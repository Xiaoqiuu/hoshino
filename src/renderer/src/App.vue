<template>
  <div id="app" :class="{ dark: isDarkMode }"> <!-- 通过动态类应用夜间模式 -->
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
    <nav class="shell" :class="{ 'flowing-gradient': isDayMode, 'dark-mode': isDarkMode, 'collapsed': isSidebarCollapsed }"> <!-- 使用动态类切换模式 -->
      <header>
        <div class="image-text">
          <span class="image">
            <img src="../../../resources/icon.png" alt="">
          </span>
          <div class="text logo-text">
          <!-- logo 文字 旧地方 为了简约暂时关闭了 -->
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
          <li class="nav-link" id = "console-link">
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
import './assets/main.css';
import './sidebar.js';

export default {
  name: 'App',
  data() {
    return {
      isDayMode: true, // 默认白天模式
      isSidebarCollapsed: false, // 默认侧边栏展开
    };
  },
  computed: {
    isDarkMode() {
      return !this.isDayMode;
    }
  },
  methods: {
    minimizeWindow() {
      window.electronAPI.minimizeWindow();
    },
    toggleMaximizeWindow() {
      window.electronAPI.toggleMaximizeWindow();
    },
    closeWindow() {
      window.electronAPI.closeWindow();
    },
    toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    },
    toggleDayNightMode(isDayMode) {
      this.isDayMode = isDayMode;
      document.body.classList.toggle('dark', !isDayMode); // 切换全局主题类
    },
  }
};
</script>

<style scoped>
/* 夜间模式样式 */
.dark {
  --body-color: #202224;
  --shell-color: #171717;
  --primary-color: #3a3b3c;
  --primary-color-light: #3a3b3c;
  --text-color: #ccc;
}

.shell {
  background-color: var(--shell-color);
  transition: all 0.3s ease;
}

.dark-mode {
  background-color: var(--primary-color-dark); /* 在夜间模式下使用深色背景 */
}

.window-controls, .menu-bar, .window-content {
  transition: all 0.3s ease; /* 添加平滑过渡效果 */
}

/*！ router-view CSS样式更改区域 ！*/

/* 主要内容区域的样式 */
.window-content {
  position: relative;
  margin-left: 250px; /* 初始左边距 */
  

/**
 * padding-top 将router-view的高度设置为0顶到虚空标题栏 让功能界面的css样式自己设定顶部的距离
 **/
  padding-top: 0px; 

  flex-grow: 1; /* 允许内容区域扩展填充剩余空间 */
  width: calc(100% - (20% + 00px)); /* 自适应宽度 */
  transition: margin-left 0.3s ease, width 0.3s ease; /* 平滑过渡 */
  box-sizing: border-box;
}

/* 当侧边栏处于收起状态时 */
.shell.close + .window-content {
  width: calc(100% - 87px ); /* 自适应宽度 */
  margin-left: 88px/* 初始左边距 */
}
</style>