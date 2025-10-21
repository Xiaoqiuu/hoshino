// src/main/ipc-pdf.js
const { dialog, ipcMain } = require('electron')
const fs = require('fs/promises')
const path = require('path')
const os = require('os')

ipcMain.handle('pdf:open-dialog', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    filters: [{ name: 'PDF', extensions: ['pdf'] }],
    properties: ['openFile']
  })
  if (canceled || !filePaths?.length) return null
  return filePaths[0]
})

ipcMain.handle('fs:readFileArrayBuffer', async (_e, fullPath) => {
  const buf = await fs.readFile(fullPath)
  // 关键：返回 ArrayBuffer（不要返回字符串）
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
})

ipcMain.handle('anno:save-json', async (_e, { docId, data }) => {
  const safe = docId.replace(/[^a-z0-9_\-\.]+/gi, '_')
  const out = path.join(os.homedir(), `annotations_${safe}.json`)
  await fs.writeFile(out, JSON.stringify(data, null, 2), 'utf-8')
  return { ok: true, path: out }
})
