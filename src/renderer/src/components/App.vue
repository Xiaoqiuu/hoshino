<template>
    <div class="app">
      <Toolbar />
      <ChatWindow />
    </div>
  </template>
  
  <script>
  import Toolbar from '../components/Toolbar.vue';
  import ChatWindow from '../components/ChatWindow.vue';
  
  export default {
    components: {
      Toolbar,
      ChatWindow
    }
  }
  </script>
  
  <style scoped>
  .app {
    display: flex;
    height: 100vh;
    overflow: hidden;
  }
  </style>