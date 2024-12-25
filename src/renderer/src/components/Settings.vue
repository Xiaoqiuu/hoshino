<template>
  <div class="settings-container">
    <p class="section-title"></p>
    <el-row :gutter="12" class="options-row">
      <el-col :span="24">
        <el-card class="option-card" shadow="hover">
          <div slot="header" class="card-header">
            <span>通用设置</span>
          </div>
          <div class="option-content">
            <el-form label-position="left" label-width="150px">
              <el-form-item label="配置模式">
                <el-input placeholder="请输入内容"></el-input>
                <div class="option-description">此设置项用于配置应用程序的运行模式。</div>
              </el-form-item>
              <el-form-item label="配置模式">
                <el-select placeholder="请选择">
                  <el-option label="新手（推荐）" value="1"></el-option>
                  <el-option label="专家" value="2"></el-option>
                </el-select>
                <div class="option-description">此设置项用于配置应用程序的运行模式，新手模式适合初学者，专家模式适合高级用户。</div>
              </el-form-item>
              <!-- 添加环境检测部分 -->
              <el-form-item label="环境检测">
                <el-button type="primary" @click="startDetection">开始检测</el-button>
                <div class="option-description">此按钮用于检测应用程序的运行环境，包括依赖库和系统配置。</div>
              </el-form-item>
              <el-form-item label="肤色更改">
                <el-select placeholder="请选择">
                  <el-option label="蓝色（默认）" value="1"></el-option>
                  <el-option label="Hoshino" value="2"></el-option>
                </el-select>
                <div class="option-description">此设置项用于配置应用程序的皮肤色彩，蓝色为默认。正式版无此项功能。</div>
              </el-form-item>
            </el-form>
          </div>
          <div slot="header" class="card-header">
            <span>模型配置</span>
          </div>
          <div class="option-content">

            <el-form-item label="API Keys">
                <el-input placeholder="请输入内容"></el-input>
                <div class="option-description">此设置项用于配置在线模型调用所需的API Keys。此项为敏感项，请妥善保管好自己的API Keys。</div>
            </el-form-item>
          </div>
          <div slot="header" class="card-header">
            <span>软件设定</span>
          </div>
        </el-card>
      </el-col>
      <!-- 更多选项可以类似添加 -->
    </el-row>
  </div>
</template>

<style scoped>
/* 之前的样式保持不变 */
</style>

<style scoped>

.settings-container { /* 核心主框 */
  position : absolute;
  top: 20px;
  left : 10px;
  width : 150vh;
  padding: 20px;
}

.section-title {
  font-size: 18px;
  color: var(--el-text-color-regular);
  margin-bottom: 10px;
}

.options-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.option-card {
  margin-bottom: 20px;
  width : 100%;
  border: 1px solid var(--el-border-color-light); /* 浅灰色边框 */
  border-radius: 4px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
}

.option-content {
  padding: 10px;
  text-align: right; /* 文本右对齐 */
}

.el-form {
  width: 100%;
  box-sizing: border-box;
}

/* 根据需要调整表单元素的宽度和间距 */
.el-form-item__label {
  text-align: right;
  padding-right: 10px;
}

.el-button {
  position : absolute;
  right: 10px;
  width: 20%; 
}

.el-input, .el-select {
  position : absolute;
  right: 10px;
  width: 20%; /* 根据label-width调整输入框宽度 */
}

.option-description {
  font-size: 12px;
  color: #9a9a9a;
  margin-top: px;
  padding-left: 10px;
}
</style>

<script setup>
import { ElCard, ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElButton, ElMessage } from 'element-plus';
//import { remote } from 'electron';
import { useRouter } from 'vue-router';
// import { ipcRenderer } from 'electron';

// 假设这里有一个方法用于处理开始检测的操作
const router = useRouter();

const checkEnvironment = async () => {
  try {
    const result = await ipcRenderer.invoke('checkLibraries', ['transformers', 'torch', 'flask']);
    router.push({ name: 'console' });
    // 发送事件给控制台页面，显示检测结果
    router.appContext.config.globalProperties.$eventBus.emit('showDetectionResult', result);
  } catch (error) {
    ElMessage({
      message: `环境检测失败: ${error}`,
      type: 'error'
    });
  }
};

const startDetection = () => {
  checkEnvironment();
};
</script>