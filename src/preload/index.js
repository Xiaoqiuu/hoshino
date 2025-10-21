// src/preload/index.js
const { contextBridge, ipcRenderer } = require('electron')

/**
 * 只暴露白名单 API（函数/可序列化对象），不要把整个 ipcRenderer 暴露给渲染层。
 * 确保在 contextIsolation: true 下，仅有一个入口：window.electronAPI。 
 * 参考：Electron contextBridge / contextIsolation / ipcRenderer 官方文档。
 */

const electronAPI = {
  /* ============== 窗口控制 ============== */
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  toggleMaximizeWindow: () => ipcRenderer.send('toggle-maximize-window'),
  closeWindow: () => ipcRenderer.send('close-window'),

  /* ============== PDF 打开/读取/保存 ============== */
  openPdfDialog: () => ipcRenderer.invoke('pdf:open-dialog'),
  // 二选一：你可以继续用 ArrayBuffer，也可以改用 Base64（推荐更稳）
  readFileAsArrayBuffer: (fullPath) => ipcRenderer.invoke('fs:readFileArrayBuffer', fullPath),
  readFileAsBase64: (fullPath) => ipcRenderer.invoke('fs:readFileBase64', fullPath),
  saveAnnotationsJSON: (docId, data) => ipcRenderer.invoke('anno:save-json', { docId, data }),

  /* ============== Terminal API ============== */
  terminal: {
    // 交互式会话
    start: (opts) => ipcRenderer.invoke('terminal:start', opts),
    write: (id, data) => ipcRenderer.invoke('terminal:write', { id, data }),
    resize: (id, cols, rows) => ipcRenderer.invoke('terminal:resize', { id, cols, rows }),
    stop: (id) => ipcRenderer.invoke('terminal:stop', { id }),

    // 一次性命令
    run: (command, shell, cwd) =>
      ipcRenderer.invoke('terminal:run', { command, shell, cwd }),

    // 订阅事件（仅把 payload 传给渲染层回调）
    onData: (cb) => ipcRenderer.on('terminal:data', (_e, payload) => cb && cb(payload)),
    onExit: (cb) => ipcRenderer.on('terminal:exit', (_e, payload) => cb && cb(payload))
  },

  /* ============== 通用 IPC 封装（可选） ============== */
  ipc: {
    send: (channel, ...args) => ipcRenderer.send(channel, ...args),
    invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
    on: (channel, listener) => ipcRenderer.on(channel, listener),
    once: (channel, listener) => ipcRenderer.once(channel, listener),
    removeListener: (channel, listener) => ipcRenderer.removeListener(channel, listener),
    removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
  }
}

/** 统一主入口：始终只暴露一次 'electronAPI' */
contextBridge.exposeInMainWorld('electronAPI', electronAPI)

/** 兼容别名（旧代码可能直接用 window.terminal / window.windowControl / window.appWindow / window.ipc） */
const safeExpose = (key, value) => { try { contextBridge.exposeInMainWorld(key, value) } catch {} }
const windowControls = {
  minimizeWindow: electronAPI.minimizeWindow,
  toggleMaximizeWindow: electronAPI.toggleMaximizeWindow,
  closeWindow: electronAPI.closeWindow
}
safeExpose('terminal', electronAPI.terminal)
safeExpose('ipc', electronAPI.ipc)
safeExpose('windowControl', windowControls)
safeExpose('appWindow', windowControls)
