<template>
    <div class="models-container">
      <img :src="currentModelImage" alt="模型介绍" class="model-image" :class="{ 'fade-out': isFadingOut }">
      <div class="model-list">
        <div v-for="(model, index) in models" :key="index" class="model-item" @mouseover="handleMouseOver(index)" @mouseout="handleMouseOut(index)">
          <img :src="model.logo" alt="模型logo" class="model-logo" :class="{ 'hover': currentIndex === index }">
          <div v-if="currentIndex === index" class="model-click">点击切换</div>
        </div>
      </div>
    </div>
  </template>
  <!---->
  <script>
  import model1 from './model-1.png'
  import model1Logo from './model-logo-1.png'
  import model2Logo from './model-1.png'
  import model2Image from './model-1.png'
  import model3Logo from './model-1.png'
  import model3Image from './model-3.png'
  import model4Logo from './model-1.png'
  import model4Image from './model-1.png'
  import model5Logo from './model-1.png'
  import model5Image from './model-1.png'
  
  export default {
    data() {
      return {
        models: [
          { logo:model1Logo, image:model1 },
          { logo:model2Logo, image:model2Image },
          { logo:model3Logo, image:model3Image },
          { logo:model4Logo, image:model4Image },
          { logo:model5Logo, image:model5Image }
        ],
        currentModelImage: model1,
        currentIndex: -1,
        isFadingOut: false,
      isFadingIn: false,
      nextModelImage: '',
      fadeTimeout: null,
      }
    },
    methods: {
        handleMouseOver(index) {
      this.nextModelImage = this.models[index].image;
      this.isFadingOut = true;
      this.isFadingIn = true;
      setTimeout(() => {
        this.currentModelImage = this.nextModelImage;
        this.isFadingOut = false;
        this.isFadingIn = false;
      }, 200);
    },
    handleMouseOut(index) {
      this.isFadingOut = false;
      this.isFadingIn = false;
    }
  }
}
  </script>
  
  <style>
  .models-container {
    /*
    margin-top:  -30px;
    margin-left: -20px;
    */
    position: fixed;
    width: 100%;
    height: 100vh;
    background-color: #f0f0f0;
  }
  
  .model-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: opacity 0.5s;
  }
  
  .model-list {
    position: absolute;
    bottom: 0;
    left: 0;
    display: flex;
    justify-content: space-between;
    width: 80%;
    padding: 20px;
  }
  
  .model-item {
    position: relative;
    width: 18%;
    height: 100px;
    background-color: #fff;
    border-radius: 10px;
    cursor: pointer;
  }
  
  .model-item:hover {
    transform: scale(1.1);
  }
  
  .model-logo {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 160px;
    height: 100px;
    object-fit: cover;
  }
  
  .model-logo.hover {
    filter: blur(2px);
  }
  
  .model-click {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 16px;
    font-weight: bold;
    color: #333;
  }


  .model-image.fade-out {
  opacity: 0;
}

.model-image.fade-in {
  opacity: 1;
}
  </style>
          