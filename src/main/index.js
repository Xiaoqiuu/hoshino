// src/main/main.js
import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

// 读/写文件
import fs from 'fs/promises'
import os from 'os'
import path from 'path'

// 降级方案：仅使用 child_process（不依赖 node-pty）
import { spawn, exec } from 'child_process'

/* --------------------- 交互式会话管理 --------------------- */
const sessions = new Map() // id -> { kind:'spawn', child: ChildProcess }
function newId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

/* --------------------- 创建主窗口 --------------------- */
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    minWidth: 1240,
    height: 745,
    minHeight: 745,
    frame: false,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    title: 'Hoshino Project Dev',
    webPreferences: {
      // 仅加载这一份 preload，且只在这份 preload 里 exposeInMainWorld('electronAPI', ...)
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true, // 建议开启（与 contextBridge 配合）
      sandbox: false
      // webSecurity: false // 如需调试 CORS/CSP 再按需开关
    }
  })

  /* --------- 窗口控制 IPC（与 preload 暴露方法对应） --------- */
  ipcMain.on('minimize-window', () => mainWindow.minimize())
  ipcMain.on('toggle-maximize-window', () => {
    if (mainWindow.isMaximized()) mainWindow.unmaximize()
    else mainWindow.maximize()
  })
  ipcMain.on('close-window', () => mainWindow.close())

  mainWindow.on('ready-to-show', () => mainWindow.show())
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  /* --------- 终端 IPC（降级：spawn/exec，含中文编码修复） --------- */

  // 启动交互式会话
  ipcMain.handle('terminal:start', (event, { shell: want = 'auto', cwd } = {}) => {
    const isWin = process.platform === 'win32'
    let exe = '', args = []

    if (isWin) {
      if (want === 'cmd') {
        exe = 'cmd.exe'
        args = ['/K', 'chcp', '65001'] // /K 保持会话；先切 UTF-8 代码页
      } else if (want === 'powershell') {
        exe = 'powershell.exe'
        args = [
          '-NoLogo', '-NoProfile', '-NoExit', '-ExecutionPolicy', 'Bypass', '-Command',
          "[Console]::InputEncoding=[System.Text.UTF8Encoding]::new();"
          + "[Console]::OutputEncoding=[System.Text.UTF8Encoding]::new();"
          + "$OutputEncoding=[System.Text.UTF8Encoding]::new()"
        ]
      } else {
        // auto：Windows 默认 PowerShell
        exe = 'powershell.exe'
        args = [
          '-NoLogo', '-NoProfile', '-NoExit', '-ExecutionPolicy', 'Bypass', '-Command',
          "[Console]::InputEncoding=[System.Text.UTF8Encoding]::new();"
          + "[Console]::OutputEncoding=[System.Text.UTF8Encoding]::new();"
          + "$OutputEncoding=[System.Text.UTF8Encoding]::new()"
        ]
      }
    } else {
      // *nix：默认 UTF-8
      exe = process.env.SHELL || '/bin/bash'
      args = ['-l'] // login shell
    }

    const child = spawn(exe, args, {
      cwd: cwd || process.cwd(),
      shell: false,
      windowsHide: true
    })

    const id = newId()
    sessions.set(id, { kind: 'spawn', child })

    child.stdout?.on('data', (buf) => {
      try { event.sender.send('terminal:data', { id, data: buf.toString('utf8') }) } catch {}
    })
    child.stderr?.on('data', (buf) => {
      try { event.sender.send('terminal:data', { id, data: buf.toString('utf8') }) } catch {}
    })
    child.on('close', (code) => {
      sessions.delete(id)
      try { event.sender.send('terminal:exit', { id, code }) } catch {}
    })
    child.on('error', (err) => {
      try { event.sender.send('terminal:data', { id, data: `[process error] ${err?.message || err}\n` }) } catch {}
    })

    return { id, exe, pty: false }
  })

  // 向会话写入
  ipcMain.handle('terminal:write', (_event, { id, data }) => {
    const s = sessions.get(id)
    if (!s) return { ok: false }
    try { s.child.stdin?.write(data); return { ok: true } } catch { return { ok: false } }
  })

  // 降级模式无真实 resize，这里保持接口
  ipcMain.handle('terminal:resize', () => ({ ok: true }))

  // 停止/杀死会话
  ipcMain.handle('terminal:stop', (_event, { id }) => {
    const s = sessions.get(id)
    if (!s) return { ok: true }
    try {
      if (process.platform === 'win32') {
        s.child.stdin?.write('\r\nexit\r\n')
        setTimeout(() => { try { s.child.kill('SIGTERM') } catch {} }, 300)
      } else {
        s.child.kill('SIGTERM')
      }
    } catch {}
    sessions.delete(id)
    return { ok: true }
  })

  // 一次性命令（Windows 先切到 UTF-8 确保中文正常）
  ipcMain.handle('terminal:run', (_event, { command, shell: useShell, cwd }) => {
    const isWin = process.platform === 'win32'
    const wrapped = isWin ? `chcp 65001>nul & ${command}` : command
    return new Promise((resolve) => {
      exec(wrapped, {
        shell: useShell || true,   // Windows -> cmd.exe；*nix -> /bin/sh
        cwd: cwd || process.cwd(),
        windowsHide: true,
        maxBuffer: 1024 * 1024 * 8
      }, (error, stdout, stderr) => {
        resolve({ code: error?.code ?? 0, stdout, stderr })
      })
    })
  })

  /* --------- PDF/批注 相关 IPC --------- */

  // 选择 PDF 文件（系统对话框）
  ipcMain.handle('pdf:open-dialog', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      filters: [{ name: 'PDF', extensions: ['pdf'] }],
      properties: ['openFile']
    })
    if (canceled || !filePaths?.length) return null
    return filePaths[0]
  })

  // 读取 PDF 为 ArrayBuffer（渲染端可 new Uint8Array(...) 喂给 getDocument）
  ipcMain.handle('fs:readFileArrayBuffer', async (_e, fullPath) => {
    const buf = await fs.readFile(fullPath)
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
  })

  // 读取 PDF 为 Base64（跨 IPC 更稳妥，渲染端用 atob/Buffer 转回 Uint8Array）
  ipcMain.handle('fs:readFileBase64', async (_e, fullPath) => {
    const buf = await fs.readFile(fullPath)
    return buf.toString('base64')
  })

  // 保存批注 JSON（写到用户主目录）
  ipcMain.handle('anno:save-json', async (_e, { docId, data }) => {
    const safeName = String(docId || 'document').replace(/[^a-z0-9_\-\.]+/gi, '_')
    const outPath = path.join(os.homedir(), `annotations_${safeName}.json`)
    await fs.writeFile(outPath, JSON.stringify(data, null, 2), 'utf-8')
    return { ok: true, path: outPath }
  })
}

/* --------------------- App lifecycle --------------------- */
app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')
  app.on('browser-window-created', (_, window) => optimizer.watchWindowShortcuts(window))
  ipcMain.on('ping', () => console.log('pong'))
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
