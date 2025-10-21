<template>
  <div id="chat-container">
    <!-- 对话窗口 -->
    <div id="chat-window">
      <div
        v-for="(message, index) in messages"
        :key="index"
        :class="['message', message.sender === 'user' ? 'user' : 'ai']"
      >
        <div class="message-bubble">
          <p style="white-space: pre-wrap">{{ message.text }}</p>
          <span class="message-time">{{ message.time }}</span>
        </div>
      </div>
    </div>

    <!-- 输入框 -->
    <div id="chat-input-container">
      <input
        v-model="newMessage"
        @keydown.enter="sendMessage"
        type="text"
        placeholder="输入消息..."
      />
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
      newMessage: ''
    };
  },
  methods: {
    // ---- 从本地读取/保存对话 ----
    loadMessages() {
      const storedMessages = localStorage.getItem('chatMessages');
      return storedMessages ? JSON.parse(storedMessages) : [];
    },
    saveMessages() {
      localStorage.setItem('chatMessages', JSON.stringify(this.messages));
    },

    // ---- 读取设置页保存的 API 配置（不在代码里写死）----
    getAiConfig() {
      const baseUrl = (localStorage.getItem('hs_ai_base_url') || 'https://api.deepseek.com/v1').trim();
      const apiKey = (localStorage.getItem('hs_ai_api_key') || '').trim();
      const model  = (localStorage.getItem('hs_ai_model') || 'deepseek-chat').trim();
      return { baseUrl, apiKey, model };
    },

    // ---- 发送消息 ----
    sendMessage() {
      const text = this.newMessage.trim();
      if (!text) return;

      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      this.messages.push({ sender: 'user', text, time });
      this.newMessage = '';

      this.callAi().then(aiResponse => {
        this.messages.push({
          sender: 'ai',
          text: aiResponse,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        this.saveMessages();
      });

      this.saveMessages();
      this.$nextTick(() => {
        const chatWindow = document.getElementById('chat-window');
        if (chatWindow) chatWindow.scrollTop = chatWindow.scrollHeight;
      });
    },

    // ---- 调用 DeepSeek Chat Completions（读取 localStorage 配置）----
    callAi() {
      const { baseUrl, apiKey, model } = this.getAiConfig();

      // 基础校验：缺少配置时直接提示
      const missing = [];
      if (!apiKey) missing.push('API Key');
      if (!baseUrl) missing.push('Base URL');
      if (!model) missing.push('模型');
      if (missing.length) {
        return Promise.resolve(`请先在设置页填写并保存：${missing.join('、')}`);
      }

      // 生成完整接口地址：{baseUrl}/chat/completions
      const apiUrl = `${baseUrl.replace(/\/$/, '')}/chat/completions`;

      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      };

      // 把历史消息映射成 OpenAI/DeepSeek 规范
      const history = this.messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));

      // 可选 system 提示放最前
      const messages = [{ role: 'system', content: 'You are a helpful assistant.' }, ...history];

      const payload = {
        model,      // 从设置里读取：deepseek-chat / deepseek-reasoner
        messages
        // 如需流式：在这里加上 stream: true，前端需改为读流
      };

      return axios.post(apiUrl, payload, {
        headers,
        timeout: 30000,            // 30s 超时
        validateStatus: () => true // 手动处理非 2xx
      })
      .then(res => {
        if (res.status < 200 || res.status >= 300) {
          const errText = typeof res.data === 'string'
            ? res.data
            : JSON.stringify(res.data, null, 2);
          console.error('DeepSeek error:', res.status, errText);
          return `AI 返回错误（HTTP ${res.status}）:\n${errText}`;
        }
        const content = res.data?.choices?.[0]?.message?.content;
        return content ?? '(空响应)';
      })
      .catch(err => {
        const status = err?.response?.status;
        const data = err?.response?.data;
        const msg = data
          ? (typeof data === 'string' ? data : JSON.stringify(data, null, 2))
          : (err?.message || String(err));
        console.error('AI call failed:', status, msg);
        return `AI 服务暂时无法响应。\n${status ? 'HTTP ' + status + '\n' : ''}${msg}`;
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
  padding-top: 50px;
  flex-grow: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #fff;
}

/* 消息样式 */
.message {
  display: flex;
  margin-bottom: 30px; /* 气泡和紧挨着气泡的距离 */
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
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  word-break: break-word;
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
