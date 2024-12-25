<!-- <template>
    <div class="digital-clock">
      {{ currentTime }}
    </div>
  </template>
  
  <script>
  import { ref, onMounted, onUnmounted } from 'vue';
  
  export default {
    setup() {
      const currentTime = ref('');
  
      const updateTime = () => {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        currentTime.value = `${hours}:${minutes}:${seconds} ${now.toLocaleDateString()}`;
      };
  
      onMounted(() => {
        updateTime();
        const interval = setInterval(updateTime, 1000);
        onUnmounted(() => {
          clearInterval(interval);
        });
      });
  
      return {
        currentTime
      };
    }
  };
  </script>
  
  <style scoped>
  .digital-clock {
    font-family: 'Digital', sans-serif; /* 确保有这个字体或者使用在线字体 */
    font-size: 2rem;
    color: #0f0; /* 绿色数码管样式 */
  }
  </style> -->

  <template>
    <div class="">
      <iframe
        id="child"
        src="https://www.csdn.net"
        style="width: 100%; height: 100%"
      ></iframe>
    </div>
  </template>
  
  <script setup lang="ts">
  // import { onMounted } from 'vue';
  
  // onMounted(() => {
  //   function changeFrame() {
  //     const frameDiv = document.getElementById('child');
  //     const deviceWidth = document.body.clientWidth;
  //     const deviceHeight = document.body.clientHeight;
  //     frameDiv!.style.width = Number(deviceWidth) - 240 + 'px'; //数字是页面布局宽度差值
  //     frameDiv!.style.height = Number(deviceHeight) - 64 + 'px'; //数字是页面布局高度差
  //   }
  //   changeFrame();
  //   window.onresize = function () {
  //     changeFrame();
  //   };
  // });
  </script>
  
  <style lang="scss" scoped></style>
  
  