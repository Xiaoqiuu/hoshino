<template>
  <div id="history-container">
    <h2>对话历史记录</h2>
    <ul>
      <li v-for="(messages, date) in chatHistory" :key="date">
        <a @click="loadChatHistory(date)">{{ date }}</a>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  data() {
    return {
      chatHistory: JSON.parse(localStorage.getItem('chatHistory') || '{}'), // 加载历史记录
    };
  },
  methods: {
    loadChatHistory(date) {
      const history = this.chatHistory[date];
      if (history) {
        localStorage.setItem('chatMessages', JSON.stringify(history));
        this.$router.push('/dialogue'); // 跳转回对话界面
      }
    },
  },
};
</script>
