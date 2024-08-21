const { contextBridge, ipcRenderer } = require('electron');

// 使用 contextBridge 将安全的 API 暴露给渲染进程
contextBridge.exposeInMainWorld('electron', {
  send: (channel, data) => {
    // 将某些 channel 名称列入白名单
    let validChannels = ['toMain'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  receive: (channel, func) => {
    let validChannels = ['fromMain'];
    if (validChannels.includes(channel)) {
      // 从主进程接收异步消息
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  }
});