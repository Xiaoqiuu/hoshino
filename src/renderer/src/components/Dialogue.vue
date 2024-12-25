<template>
  <div id="chat-container">
    <!-- 对话窗口 -->
    <div id="chat-window">
      <div v-for="(message, index) in messages" :key="index" :class="['message', message.sender === 'user' ? 'user' : 'ai']">
        <div class="message-bubble">
          <p>{{ message.text }}</p>
          <span class="message-time">{{ message.time }}</span>
        </div>
      </div>
    </div>

    <!-- 输入框 -->
    <div id="chat-input-container">
      <input v-model="newMessage" @keydown.enter="sendMessage" type="text" placeholder="输入消息..." />
      <button @click="sendMessage">发送</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      messages: this.loadMessages(),
      newMessage: '',
      apiUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
      apiKey: 'a7206851a3776971cbcd41bf649cc3e0.2kp0ZXPloVOlEnoE' // 替换为您的 API 密钥
    };
  },
  methods: {
    loadMessages() {
      const storedMessages = localStorage.getItem('chatMessages');
      return storedMessages ? JSON.parse(storedMessages) : [];
    },
    saveMessages() {
      localStorage.setItem('chatMessages', JSON.stringify(this.messages));
    },
    sendMessage() {
      if (this.newMessage.trim() !== '') {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        this.messages.push({ sender: 'user', text: this.newMessage, time });
        this.newMessage = '';

        this.callAi().then(aiResponse => {
          this.messages.push({ sender: 'ai', text: aiResponse, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
          this.saveMessages();
        });

        this.saveMessages();
        this.$nextTick(() => {
          const chatWindow = document.getElementById('chat-window');
          chatWindow.scrollTop = chatWindow.scrollHeight;
        });
      }
    },
    callAi() {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}` // 使用 API 密钥进行授权
      };
      const payload = {
        model: 'glm-4',
        messages: this.messages.map(msg => ({ role: msg.sender, content: msg.text }))
      };

      return axios.post(this.apiUrl, payload, { headers })
        .then(response => {
          return response.data.choices[0].message.content;
        })
        .catch(error => {
          console.error('AI call failed:', error);
          return 'AI 服务暂时无法响应。';
        });
    }
  }
};
</script>

<style scoped>
/* 容器样式 */
#chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
  overflow-x: hidden;
  overflow-y: hidden;
}

/* 对话窗口 */
#chat-window {
  padding-top: 50PX;
  flex-grow: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #fff;
}

/* 消息样式 */
.message {
  display: flex;
  margin-bottom: 30px;/*气泡和紧挨着气泡的距离*/
}

.message.user {
  justify-content: flex-end;
}

.message.ai {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 60%;
  padding: 10px;
  border-radius: 10px;
  background-color: #f0f0f0;
  position: relative;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.message.user .message-bubble {
  background-color: #9eea6a;
}

.message-time {
  font-size: 12px;
  color: #888;
  position: absolute;
  bottom: -18px;
  right: 0;
}

/* 输入框样式 */
#chat-input-container {
  display: flex;
  padding: 10px;
  background-color: #fff;
  border-top: 1px solid #ddd;
}

#chat-input-container input {
  flex-grow: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  outline: none;
}

#chat-input-container button {
  margin-left: 10px;
  padding: 10px 20px;
  border: none;
  background-color: #6ac6ff;
  color: white;
  border-radius: 5px;
  cursor: pointer;
}

#chat-input-container button:hover {
  background-color: #4fa4db;
}
</style>
