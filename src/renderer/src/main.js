import { createApp } from 'vue';
import App from './App.vue';

createApp(App).mount('#app');

function showProfile() {  
    alert('显示个人信息');  
    // 这里应该打开一个模态窗口或跳转到另一个页面  
  }  
    
  function loadSection(section) {  
    console.log('加载', section);  
    // 根据section加载不同的内容或视图  
  }  
    
  function openSettings() {  
    alert('打开设置');  
    // 这里应该打开设置窗口或跳转到设置页面  
  }function showProfile() {  
    alert('显示个人信息');  
    // 这里应该打开一个模态窗口或跳转到另一个页面  
  }  
    
  function loadSection(section) {  
    console.log('加载', section);  
    // 根据section加载不同的内容或视图  
  }  
    
  function openSettings() {  
    alert('打开设置');  
    // 这里应该打开设置窗口或跳转到设置页面  
  }

  function checkFileType() {  
    var input = document.getElementById('imageInput');  
    var file = input.files[0];  
    var validExtensions = /(\.jpg|\.jpeg|\.png|\.webp)$/i;  

    if (!validExtensions.exec(file.name)) {  
        alert('请上传jpg, jpeg, png, 或 webp格式的图片。');  
        input.value = ''; // 清除选择  
    }  
  }