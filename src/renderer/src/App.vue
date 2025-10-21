<template>
  <div id="app" :class="{ dark: isDarkMode }">
    <!-- 不可见的标题栏，用于窗口拖拽 -->
    <div class="title-bar"></div>

    <!-- 右上角窗口控制按钮 -->
    <div class="window-controls">
      <button @click="minimizeWindow" class="window-control-button button-minimize">
        <img src="./icon/button-minimize.svg" alt="Minimize">
      </button>
      <button @click="toggleMaximizeWindow" class="window-control-button button-maximize">
        <img src="./icon/button-maximize.svg" alt="Maximize">
      </button>
      <button @click="closeWindow" class="window-control-button button-close">
        <img src="./icon/button-close.svg" alt="Close">
      </button>
    </div>

    <!-- 导航栏 -->
    <nav class="shell" :class="{ 'flowing-gradient': isDayMode, 'dark-mode': isDarkMode, 'collapsed': isSidebarCollapsed }">
      <header>
        <div class="image-text">
          <span class="image">
            <img src="../../../resources/icon.png" alt="">
          </span>
          <div class="text logo-text">
            <span class="name"></span>
            <span class="personal-signature"></span>
          </div>
        </div>
        <i class="iconfont icon-xiangyoujiantou toggle"></i>
      </header>

      <!-- 菜单栏 -->
      <div class="menu-bar">
        <ul class="menu-links">
          <li class="nav-link">
            <router-link to="/dialogue">
              <i class="icon dialogue-icon"></i>
              <span class="text nac-text">对话</span>
            </router-link>
          </li>
          <li class="nav-link">
            <router-link to="/History">
              <i class="icon icon-history"></i>
              <span class="text nac-text">历史</span>
            </router-link>
          </li>
          <li class="nav-link">
            <router-link to="/schedule">
              <i class="icon icon-schedule"></i>
              <span class="text nac-text">日程</span>
            </router-link>
          </li>
          <li class="nav-link">
            <router-link to="/models">
              <i class="icon icon-models"></i>
              <span class="text nac-text">模型</span>
            </router-link>
          </li>
          <li class="nav-link">
            <router-link to="/settings">
              <i class="icon icon-settings"></i>
              <span class="text nac-text">设置</span>
            </router-link>
          </li>
          <li class="nav-link" id="console-link">
            <router-link to="/console">
              <i class="icon icon-console"></i>
              <span class="text nac-text">命令行</span>
            </router-link>
          </li>
        </ul>

        <!-- 夜间模式切换 -->
        <li class="mode">
          <div class="sun-moon">
            <i class="iconfont icon-rijian icon sun"></i>
            <i class="iconfont icon-yejian icon moon"></i>
          </div>
          <span class="mode-text text">夜间模式</span>
          <div class="toggle-switch" @click="toggleDayNightMode(!isDayMode)">
            <span class="switch"></span>
          </div>
        </li>
      </div>
    </nav>

    <!-- 内容区域 -->
    <div class="window-content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import './assets/main.css'
import './sidebar.js'

export default {
  name: 'App',
  data() {
    return {
      isDayMode: true,
      isSidebarCollapsed: false
    }
  },
  computed: {
    isDarkMode() {
      return !this.isDayMode
    }
  },
  methods: {
    minimizeWindow() {
      window.electronAPI.minimizeWindow()
    },
    toggleMaximizeWindow() {
      window.electronAPI.toggleMaximizeWindow()
    },
    closeWindow() {
      window.electronAPI.closeWindow()
    },
    toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed
    },
    toggleDayNightMode(isDayMode) {
      this.isDayMode = isDayMode
      document.body.classList.toggle('dark', !isDayMode)
    }
  }
}
</script>

<style scoped>
/* 统一定义标题栏高度变量（放这里没问题，但我也会在全局 main.css 放一份，确保能被全局使用） */
:root {
  --titlebar-height: 32px;
}

/* 自定义标题栏 */
.title-bar {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: var(--titlebar-height);
  -webkit-app-region: drag;
  background: transparent;
  z-index: 1000;
}
.window-controls {
  position: fixed;
  top: 0; right: 0;
  height: var(--titlebar-height);
  display: flex; align-items: center; gap: 6px;
  padding: 0 8px;
  -webkit-app-region: no-drag;
  z-index: 1001;
}
.window-control-button {
  width: 36px; height: 28px;
  display: grid; place-items: center;
  border: none; background: transparent; cursor: pointer;
}

/* 侧边栏让出标题栏高度 */
.shell {
  margin-top: var(--titlebar-height);
}

/* ====== 高度链路补丁 ①：window-content 吃满剩余视口高度，不滚动，把滚动交给子页面 ====== */
.window-content {
  position: relative;
  margin-left: 250px; /* 你的侧栏宽 */
  height: calc(100vh - var(--titlebar-height));   /* 关键：扣掉自定义标题栏 */
  overflow: hidden;                                 /* 由子路由决定是否滚动 */
  display: flex; flex-direction: column;
  box-sizing: border-box;
  transition: margin-left 0.3s ease, width 0.3s ease;
}

/* 侧栏收起时 */
.shell.close + .window-content {
  width: calc(100% - 87px);
  margin-left: 88px;
  height: calc(100vh - var(--titlebar-height));
}

/* ====== 高度链路补丁 ②：让 router-view 承载的路由根组件占满 & 允许内部滚动 ======
   这条只作用于 window-content 的“直接孩子”（router-view 渲染出的根 DOM） */
.window-content > * {
  flex: 1 1 auto;
  min-height: 0;             /* 没这句，内部绝对定位/flex 子项经常不滚 */
  display: flex;
  flex-direction: column;
}
</style>
