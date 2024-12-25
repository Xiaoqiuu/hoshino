// preload.js
const { contextBridge, ipcRenderer } = require('electron/renderer');
import { electronAPI } from '@electron-toolkit/preload';

//ipcRenderer
//const { ipcRenderer } = require('electron');

// Custom APIs for renderer
const api = {};

// Expose Electron APIs to renderer
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error(error);
  }
} else {
  window.electron = electronAPI;
  window.api = api;
}

// Expose additional methods via contextBridge
contextBridge.exposeInMainWorld('electronAPI', {
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  toggleMaximizeWindow: () => ipcRenderer.send('toggle-maximize-window'),
  closeWindow: () => ipcRenderer.send('close-window'),
  invoke: ipcRenderer.invoke.bind(ipcRenderer), // 添加invoke方法
  on: ipcRenderer.on.bind(ipcRenderer), // 添加on方法
});

// 全局暴露必要的Electron变量
if (typeof __dirname === 'undefined') {
  globalThis.__dirname = '';
}
if (typeof __filename === 'undefined') {
  globalThis.__filename = '';
}