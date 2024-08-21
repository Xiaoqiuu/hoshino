document.querySelector('.send-button').addEventListener('click', async () => {
    const input = document.querySelector('.input-text');
    const userMessage = input.value;

    if (userMessage.trim() === '') {
        return;
    }

    try {
        const response = await fetch('https://dsw-gateway-cn-hangzhou.data.aliyun.com/dsw-617319/proxy/5000/chat', {  // 替换为阿里云专用网关的地址
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: userMessage }),
        });

        if (response.ok) {
            const data = await response.json();
            displayMessage(userMessage, 'user');
            displayMessage(data.response, 'assistant');
        } else {
            console.error('服务器错误:', response.statusText);
        }
    } catch (error) {
        console.error('网络错误:', error);
    }
});

function displayMessage(message, role) {
    const messagesContainer = document.querySelector('.messages');
    const messageElement = document.createElement('div');
    messageElement.classList.add(role);
    messageElement.textContent = message;
    messagesContainer.appendChild(messageElement);
}

function addMessage(role, content) {
    const messagesContainer = document.querySelector('.messages');
    const messageElement = document.createElement('div');
    messageElement.className = role;
    messageElement.textContent = content;
    messagesContainer.appendChild(messageElement);

    // 确保最新消息显示在聊天窗口的底部
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }