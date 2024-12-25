//Hoshino-mainWindow.js

//遗弃用法，因为会白屏
import { ipcRenderer } from 'electron';  
  
export default {  
  data() {  
    return {  
      isFullScreen: false,  
    };  
  },  
  methods: {  
    minimizeWindow() {  
      ipcRenderer.send('minimize');  
    },  
    toggleFullScreen() {  
      ipcRenderer.send('toggle-full-screen');  
    },  
    closeWindow() {  
      ipcRenderer.send('close');
    },  
    // 从main进程接收全屏状态更新  
    receiveFullScreenStatus(event, isFullScreen) {  
      this.isFullScreen = isFullScreen;  
    }  
  },  
  mounted() {  
    // 监听来自main进程的全屏状态更新  
    ipcRenderer.on('update-full-screen-status', this.receiveFullScreenStatus);  
  },  
  beforeDestroy() {  
    // 清理事件监听器  
    ipcRenderer.removeListener('update-full-screen-status', this.receiveFullScreenStatus);  
  }  
};  