<template>
    <div class="chat-window">
      <div class="greeting">
        Sensei，你好哇
      </div>
      <div class="chat-box">
        <!-- 在这里显示与AI的对话内容 -->
      </div>
      <div class="input-box">
        <input v-model="message" placeholder="输入你的消息..." />
        <button @click="sendMessage">发送</button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        message: ''
      }
    },
    methods: {
      sendMessage() {
        if (this.message.trim()) {
          // 发送消息的逻辑
          this.message = '';
        }
      }
    }
  }
  </script>
  
  <style scoped>
  .chat-window {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 20px;
  }
  .greeting {
    text-align: center;
    font-size: 24px;
    color: #555;
    margin-bottom: 20px;
  }
  .chat-box {
    flex-grow: 1;
    background-color: #f1f1f1;
    padding: 10px;
    border-radius: 10px;
    overflow-y: auto;
    margin-bottom: 20px;
  }
  .input-box {
    display: flex;
  }
  input {
    flex-grow: 1;
    padding: 10px;
    border-radius: 5px;
    border: 1px solid #ccc;
    margin-right: 10px;
  }
  button {
    padding: 10px 20px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  </style>