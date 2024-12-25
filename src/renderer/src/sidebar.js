// sidebar.js
document.addEventListener("DOMContentLoaded", () => {
  const toggleButton = document.querySelector('.toggle'); // 选择伸开导航栏的按钮
  const sidebar = document.querySelector('.shell'); // 选择导航栏
  
  toggleButton.addEventListener('click', () => {
    // 使用事件总线来通知组件改变导航栏状态
    const isExpanded = sidebar.classList.toggle('close'); // 切换close类
    window.app.$eventBus.$emit('sidebarStateChange', !isExpanded);
  });
});
