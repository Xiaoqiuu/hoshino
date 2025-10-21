<template>
  <div class="settings-page">
    <div class="settings-scroll">
      <el-row :gutter="16">
        <el-col :span="24">
          <!-- 通用设置 -->
          <el-card class="option-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span>通用设置</span>
              </div>
            </template>

            <el-form label-position="left" :label-width="labelWidth">
              <el-form-item label="配置模式">
                <el-input placeholder="请输入内容" />
                <div class="option-description">此设置项用于配置应用程序的运行模式。</div>
              </el-form-item>

              <el-form-item label="配置模式">
                <el-select placeholder="请选择">
                  <el-option label="新手（推荐）" value="1" />
                  <el-option label="专家" value="2" />
                </el-select>
                <div class="option-description">
                  新手模式适合初学者，专家模式适合高级用户。
                </div>
              </el-form-item>

              <el-form-item label="环境检测">
                <div class="inline-row">
                  <el-button type="primary" @click="startDetection">开始检测</el-button>
                  <span class="option-description ml8">检测依赖库与系统配置。</span>
                </div>
              </el-form-item>

              <el-form-item label="肤色更改">
                <el-select placeholder="请选择">
                  <el-option label="蓝色（默认）" value="1" />
                  <el-option label="Hoshino" value="2" />
                </el-select>
                <div class="option-description">正式版无此项功能。</div>
              </el-form-item>
            </el-form>
          </el-card>

          <!-- 模型配置 -->
          <el-card class="option-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span>模型配置</span>
                <small class="save-hint" v-if="saveBadgeText">{{ saveBadgeText }}</small>
              </div>
            </template>

            <el-form :model="form" label-position="left" :label-width="labelWidth">
              <el-form-item label="提供商">
                <el-select v-model="form.provider" placeholder="请选择">
                  <el-option label="DeepSeek" value="deepseek" />
                </el-select>
                <div class="option-description">当前仅提供 DeepSeek 直连配置。</div>
              </el-form-item>

              <el-form-item label="API Base URL">
                <el-input v-model="form.baseUrl" placeholder="https://api.deepseek.com/v1" />
                <div class="option-description">
                  DeepSeek 推荐值：<code>https://api.deepseek.com/v1</code>
                </div>
              </el-form-item>

              <el-form-item label="模型">
                <el-select v-model="form.model" placeholder="请选择">
                  <el-option label="deepseek-chat（通用）" value="deepseek-chat" />
                  <el-option label="deepseek-reasoner（思考）" value="deepseek-reasoner" />
                </el-select>
                <div class="option-description">根据需求选择通用对话或思考模型。</div>
              </el-form-item>

              <el-form-item label="API Key">
                <el-input
                  v-model="form.apiKey"
                  placeholder="在此粘贴 DeepSeek API Key"
                  show-password
                  type="password"
                />
                <div class="option-description">
                  仅保存在本机 <code>localStorage</code>（开发期），请妥善保管。
                </div>
                <div class="option-description" v-if="maskedKey">
                  已保存：{{ maskedKey }}
                </div>
              </el-form-item>

              <el-form-item label="操作">
                <div class="btn-row">
                  <el-button type="primary" @click="saveSettings">保存</el-button>
                  <el-button @click="testConnection" :loading="testing">测试连接</el-button>
                  <el-button type="danger" @click="clearSettings">清空配置</el-button>
                </div>
                <div class="option-description">
                  对话页将读取以下键：<code>hs_ai_provider</code>、
                  <code>hs_ai_base_url</code>、<code>hs_ai_model</code>、
                  <code>hs_ai_api_key</code>。
                </div>
              </el-form-item>
            </el-form>
          </el-card>

          <!-- 软件设定 -->
          <el-card class="option-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span>软件设定</span>
              </div>
            </template>

            <el-form label-position="left" :label-width="labelWidth">
              <el-form-item label="占位项">
                <el-input placeholder="更多设置可在此扩展" />
                <div class="option-description">留作将来扩展。</div>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed, onBeforeUnmount } from 'vue'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import { ElMessage } from 'element-plus'
import axios from 'axios'

/* ========== localStorage 键名 ========== */
const LS_KEYS = {
  provider: 'hs_ai_provider',
  baseUrl: 'hs_ai_base_url',
  model: 'hs_ai_model',
  apiKey: 'hs_ai_api_key'
}

/* ========== 表单与状态 ========== */
const labelWidth = '150px'
const form = reactive({
  provider: 'deepseek',
  baseUrl: 'https://api.deepseek.com/v1',
  model: 'deepseek-chat',
  apiKey: ''
})
const testing = ref(false)
const lastSavedAt = ref(0)
const saveBadgeText = computed(() => {
  if (!lastSavedAt.value) return ''
  const d = new Date(lastSavedAt.value)
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  const ss = String(d.getSeconds()).padStart(2, '0')
  return `已自动保存 ${hh}:${mm}:${ss}`
})
const maskedKey = computed(() => {
  if (!form.apiKey) return ''
  const head = form.apiKey.slice(0, 6)
  const tail = form.apiKey.slice(-4)
  return `${head}...${tail}`
})

/* ========== 载入 & 保存 ========== */
function loadSettings() {
  try {
    const p = localStorage.getItem(LS_KEYS.provider)
    const b = localStorage.getItem(LS_KEYS.baseUrl)
    const m = localStorage.getItem(LS_KEYS.model)
    const k = localStorage.getItem(LS_KEYS.apiKey)
    if (p) form.provider = p
    if (b) form.baseUrl = b
    if (m) form.model = m
    if (k) form.apiKey = k
  } catch (e) {
    ElMessage.error('读取设置失败：' + (e?.message || e))
  }
}
function doSave() {
  try {
    localStorage.setItem(LS_KEYS.provider, (form.provider || '').trim())
    localStorage.setItem(LS_KEYS.baseUrl, (form.baseUrl || '').trim())
    localStorage.setItem(LS_KEYS.model, (form.model || '').trim())
    localStorage.setItem(LS_KEYS.apiKey, (form.apiKey || '').trim())
    lastSavedAt.value = Date.now()
  } catch (e) {
    ElMessage.error('保存失败：' + (e?.message || e))
  }
}
function saveSettings() {
  doSave()
  ElMessage.success('已保存')
}

/* ========== 自动保存（防抖） ========== */
let saveTimer = null
watch(
  () => ({ ...form }),
  () => {
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(() => {
      doSave()
    }, 500) // 500ms 防抖自动保存
  },
  { deep: true }
)

/* ========== 测试连接 ========== */
async function testConnection() {
  if (!form.apiKey || !form.baseUrl || !form.model) {
    ElMessage.warning('请先填写 Base URL、模型与 API Key')
    return
  }
  testing.value = true
  try {
    const url = withTrailingSlashRemoved(form.baseUrl) + '/chat/completions'
    const payload = {
      model: form.model,
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'ping' }
      ],
      max_tokens: 5
    }
    const res = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${form.apiKey}`
      },
      timeout: 20000,
      validateStatus: () => true
    })
    if (res.status >= 200 && res.status < 300) {
      const txt = res.data?.choices?.[0]?.message?.content ?? '(empty)'
      ElMessage.success('测试成功：' + txt)
    } else {
      const body = typeof res.data === 'string' ? res.data : JSON.stringify(res.data)
      ElMessage.error(`测试失败（HTTP ${res.status}）：${body}`)
    }
  } catch (err) {
    const status = err?.response?.status
    const data = err?.response?.data
    ElMessage.error(
      `网络错误${status ? '（HTTP ' + status + '）' : ''}：${
        data ? JSON.stringify(data) : (err?.message || err)
      }`
    )
  } finally {
    testing.value = false
  }
}

/* ========== 清空配置 ========== */
function clearSettings() {
  localStorage.removeItem(LS_KEYS.provider)
  localStorage.removeItem(LS_KEYS.baseUrl)
  localStorage.removeItem(LS_KEYS.model)
  localStorage.removeItem(LS_KEYS.apiKey)
  form.provider = 'deepseek'
  form.baseUrl = 'https://api.deepseek.com/v1'
  form.model = 'deepseek-chat'
  form.apiKey = ''
  lastSavedAt.value = Date.now()
  ElMessage.success('已清空本地配置')
}

/* ========== 环境检测（保留你的逻辑，避免未暴露 ipcRenderer 报错） ========== */
const router = useRouter()
async function checkEnvironment() {
  try {
    // 如果 preload 未暴露 ipcRenderer，这里仅做跳转示例避免报错
    // const result = await window?.ipcRenderer?.invoke?.('checkLibraries', ['transformers', 'torch', 'flask'])
    router.push({ name: 'console' })
    ElMessage.success('（示例）已跳转控制台页面')
  } catch (error) {
    ElMessage.error(`环境检测失败: ${error}`)
  }
}
function startDetection() {
  checkEnvironment()
}

/* ========== 生命周期 ========== */
onMounted(loadSettings)
onBeforeRouteLeave((_to, _from, next) => {
  doSave()
  next()
})
onBeforeUnmount(() => {
  doSave()
})

/* ========== 工具 ========== */
function withTrailingSlashRemoved(u) {
  return u?.endsWith('/') ? u.slice(0, -1) : u
}
</script>

<style scoped>
/* 页面容器：撑满高度并允许滚动 */
.settings-page {
  height: 100vh;
  margin-right: -10%;
  width:200vh;
  display: flex;
  flex-direction: column;
}
.settings-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: var(--el-bg-color);
  box-sizing: border-box;
  max-width: 1100px;
  margin: 0 auto;
}

/* 卡片与布局 */
.option-card {
  margin-bottom: 16px;
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.save-hint {
  color: var(--el-color-success);
  font-size: 12px;
}

/* 表单描述文本 */
.option-description {
  font-size: 12px;
  color: #9a9a9a;
  margin-top: 6px;
}
.inline-row {
  display: flex;
  align-items: center;
}
.ml8 { margin-left: 8px; }

/* 操作按钮区域 */
.btn-row {
  display: flex;
  gap: 10px;
  justify-content: flex-start;
}

/* 兼容暗色/亮色 */
:root {
  --settings-border: var(--el-border-color-light);
}
</style>
