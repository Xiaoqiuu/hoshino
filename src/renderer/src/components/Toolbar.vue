<template>
    <div class="toolbar">
      <div class="avatar" @click="showProfile">
        <img src="@/assets/avatar.png" alt="Avatar" />
      </div>
      <div class="menu">
        <button @click="showHistory">历史记录</button>
        <button @click="showCustomization">个性化</button>
        <button @click="showTools">工具箱</button>
      </div>
      <div class="settings">
        <button @click="showSettings">设置</button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    methods: {
      showProfile() {
        // 显示个人信息的逻辑
      },
      showHistory() {
        // 显示历史记录的逻辑
      },
      showCustomization() {
        // 显示个性化设置的逻辑
      },
      showTools() {
        // 显示工具箱的逻辑
      },
      showSettings() {
        // 显示设置的逻辑
      }
    }
  }
  </script>
  
  <style scoped>
  .toolbar {
    width: 200px;
    background-color: #f8f9fa;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100vh;
    padding: 10px;
  }
  .avatar img {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    cursor: pointer;
    margin-bottom: 20px;
  }
  .menu {
    flex-grow: 1;
  }
  .menu button, .settings button {
    width: 100%;
    margin-bottom: 10px;
    padding: 10px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  .settings {
    margin-top: auto;
  }
  </style>