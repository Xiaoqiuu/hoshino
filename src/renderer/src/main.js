// src/main.js
import './assets/clear.css';
import './assets/main.css';

import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import App from './App.vue';
import router from './router';
import './sidebar.js';

// const { createDataTable } = require("./db/sqlite3db.js");
// createDataTable();
/*
import './eventBus.js'

// 创建一个简单的事件总线对象
const EventBus = {
    handlers: {},
    $on: function (eventName, handler) {
      if (!this.handlers[eventName]) {
        this.handlers[eventName] = [];
      }
      this.handlers[eventName].push(handler);
    },
    $emit: function (eventName, ...args) {
      const handlers = this.handlers[eventName];
      if (handlers) {
        handlers.forEach(handler => handler(...args));
      }
    },
    $off: function (eventName, handler) {
      const handlers = this.handlers[eventName];
      if (handlers) {
        this.handlers[eventName] = handlers.filter(h => h !== handler);
      }
    }
  };
  */
  const app = createApp(App);
  
  //app.config.globalProperties.$eventBus = EventBus; // 将事件总线注入到全局上下文中
  
  app.use(router);
  app.use(ElementPlus);
  
  app.mount('#app');
/*
import './assets/clear.css'
import './assets/main.css'

import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import './sidebar.js'

const app = createApp(App)

app.config.globalProperties.$eventBus = new EventBus()

createApp(App).use(router).use(ElementPlus).mount('#app')

*/