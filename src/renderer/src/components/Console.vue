<template>
    <div class="console-container">
      <div class="console-header">
      </div>
      <div class="console-body">
        
        <div class="console-output" v-html="output" @click="handleClick"></div>
        <div class="console-cursor" :class="{ 'blink': isBlink }"></div>
      </div>
    </div>
  </template>
  
  <script>



  export default {
    data() {
      return {
        output: '',
        isBlink: true,
        blinkInterval: null
      }
    },
    mounted() {
      this.blinkInterval = setInterval(() => {
        this.isBlink =!this.isBlink
      }, 1000)
    },
    beforeUnmount() {
      clearInterval(this.blinkInterval)
    },
    methods: {
      handleClick() {
        // 这里可以处理点击事件
      }
    }
  }
  </script>
  
  <style>
  .console-container {
    position: fixed;
    bottom: 0;
    margin-left: 0px;
    width: 100%;
    height: 100%;
    background-color: #000000;
    color: #fff;
    padding: 10px;
    border-top: 0px solid #444;
  }
  
  .console-header {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 10px;
  }
  
  .console-body {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  
  .console-output {
    flex: 1;
    overflow-y: auto;
    padding: 10px;
    user-select: text;
  }
  
  .console-cursor {
    position: absolute;
    bottom: 10px;
    left: 10px;
    width: 2px;
    height: 20px;
    background-color: #fff;
    opacity: 1;
  }
  
  .console-cursor.blink {
    opacity: 0;
  }
  </style>