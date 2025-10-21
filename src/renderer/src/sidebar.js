// src/renderer/src/sidebar.js
document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.querySelector('.shell');   // 侧边栏容器
  const toggleButton = document.querySelector('.toggle'); // 折叠/展开按钮

  if (!sidebar || !toggleButton) return; // 缺少元素时安全退出

  // 工具：安全地通知应用（优先事件总线，其次广播自定义事件）
  function notify(expanded) {
    // 优先：你的全局事件总线
    if (window.app && window.app.$eventBus && typeof window.app.$eventBus.$emit === 'function') {
      window.app.$eventBus.$emit('sidebarStateChange', expanded);
      return true;
    }
    // 兜底：浏览器事件，别的代码也可监听
    try {
      window.dispatchEvent(new CustomEvent('sidebarStateChange', { detail: { expanded } }));
    } catch {}
    return false;
  }

  // 有些时候 window.app.$eventBus 是异步挂载的——做个短暂重试
  let tries = 0;
  function notifyWithRetry(expanded) {
    if (notify(expanded)) return;
    // 若还没就绪，最多重试 20 次（约 2 秒）
    if (tries < 20) {
      tries++;
      setTimeout(() => notifyWithRetry(expanded), 100);
    }
  }

  // 点击切换
  const onToggle = (e) => {
    e.preventDefault();
    const isClosed = sidebar.classList.toggle('close'); // 切换类名
    const expanded = !isClosed;
    notifyWithRetry(expanded);
  };

  // 绑定事件（不要再写到 window.onload 上）
  toggleButton.addEventListener('click', onToggle, { passive: false });

  // 键盘可达（可选）
  toggleButton.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if (k === 'enter' || k === ' ') {
      e.preventDefault();
      onToggle(e);
    }
  });

  // 初始一次同步 UI 状态给外部（可选）
  notifyWithRetry(!sidebar.classList.contains('close'));
});
