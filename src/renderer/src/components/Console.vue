<template>
  <div class="console-wrap">
    <div class="toolbar">
      <div class="left">
        <label>Shell：</label>
        <select v-model="shell">
          <option value="auto">自动（Win=PowerShell，*nix=SHELL）</option>
          <option value="powershell">PowerShell（Windows）</option>
          <option value="cmd">CMD（Windows）</option>
        </select>
        <button @click="startSession" :disabled="!!sessionId">启动会话</button>
        <button @click="stopSession" :disabled="!sessionId">停止会话</button>
        <button @click="clearOutput">清屏</button>
      </div>
      <div class="right">
        <input
          class="run-once-input"
          v-model="onceCmd"
          placeholder="一次性命令：echo 你好"
          @keydown.enter="runOnce"
          autocomplete="off"
          spellcheck="false"
        />
        <button @click="runOnce">执行</button>
      </div>
    </div>

    <div class="console-body" @click="focusInput">
      <pre class="console-output" ref="outRef">{{ output }}</pre>

      <div class="input-line">
        <span class="prompt">{{ prompt }}</span>
        <input
          ref="inRef"
          v-model="line"
          class="console-input"
          @keydown.enter.prevent="sendLine"
          @keydown.tab.prevent="insertTab"
          autocomplete="off"
          spellcheck="false"
        />
        <span class="cursor" :class="{ blink: isBlink }"></span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ConsoleView',
  data() {
    return {
      output: '',
      line: '',
      onceCmd: '',
      isBlink: true,
      blinkTimer: null,
      sessionId: null,
      shell: 'auto',
      prompt: '>'
    }
  },
  mounted() {
    this.blinkTimer = setInterval(() => (this.isBlink = !this.isBlink), 600)

    // 订阅主进程输出/退出
    window.terminal?.onData?.(({ id, data }) => {
      if (id !== this.sessionId) return
      this.append(data)
    })
    window.terminal?.onExit?.(({ id, code }) => {
      if (id !== this.sessionId) return
      this.append(`\n[process exited with code ${code}]\n`)
      this.sessionId = null
      this.prompt = '>'
    })
  },
  beforeUnmount() {
    clearInterval(this.blinkTimer)
    if (this.sessionId) window.terminal?.stop?.(this.sessionId)
  },
  methods: {
    append(s) {
      this.output += s
      this.$nextTick(() => {
        const el = this.$refs.outRef
        if (el) el.scrollTop = el.scrollHeight
      })
    },
    focusInput() {
      this.$refs.inRef?.focus()
    },
    insertTab() {
      this.line += '\t'
    },
    async startSession() {
      if (!window.terminal?.start) {
        this.append('[terminal API not available]\n')
        return
      }
      if (this.sessionId) return
      try {
        const { id, exe } = await window.terminal.start({ shell: this.shell })
        this.sessionId = id
        this.prompt = exe ? `${exe}>` : '>'
        this.append(`[started ${exe || 'shell'} | id=${id}]\n`)
        this.focusInput()
      } catch (e) {
        this.append(`[start failed] ${e?.message || e}\n`)
      }
    },
    async stopSession() {
      if (!this.sessionId) return
      await window.terminal?.stop?.(this.sessionId)
      this.sessionId = null
      this.append('[stopped]\n')
      this.prompt = '>'
    },
    async sendLine() {
      const text = this.line
      this.line = ''
      if (!text && !this.sessionId) return

      if (this.sessionId) {
        // 交互式会话：写入 STDIN（Windows 下用 \r\n 更稳）
        await window.terminal.write(this.sessionId, text + '\r\n')
      } else {
        // 没有会话时：一次性命令
        const cmd = text.trim()
        if (!cmd) return
        const { code, stdout, stderr } = await window.terminal.run(cmd)
        this.append(`$ ${cmd}\n`)
        if (stdout) this.append(stdout.replace(/\r?\n/g, '\n'))
        if (stderr) this.append(stderr.replace(/\r?\n/g, '\n'))
        this.append(`[exit ${code}]\n`)
      }
    },
    clearOutput() {
      this.output = ''
    },
    async runOnce() {
      const cmd = (this.onceCmd || '').trim()
      if (!cmd) return
      const { code, stdout, stderr } = await window.terminal.run(cmd)
      this.append(`$ ${cmd}\n`)
      if (stdout) this.append(stdout.replace(/\r?\n/g, '\n'))
      if (stderr) this.append(stderr.replace(/\r?\n/g, '\n'))
      this.append(`[exit ${code}]\n`)
      this.onceCmd = ''
    }
  }
}
</script>

<style scoped>
.console-wrap {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #000;
  color: #fff;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}
.toolbar {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 10px;
  background: #111;
  border-bottom: 1px solid #222;
}
.toolbar .left, .toolbar .right {
  display: flex;
  align-items: center;
  gap: 8px;
}
.run-once-input {
  min-width: 320px;
  padding: 6px 8px;
  border: 1px solid #333;
  background: #000;
  color: #fff;
}
button, select {
  background: #222;
  color: #fff;
  border: 1px solid #333;
  padding: 6px 10px;
  cursor: pointer;
}
button:disabled { opacity: .5; cursor: not-allowed; }

.console-body {
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 10px;
  overflow: hidden;
}
.console-output {
  flex: 1;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  overflow-y: auto;
  background: #000;
}
.input-line {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid #222;
}
.prompt { color: #9acd32; }
.console-input {
  flex: 1;
  background: #000;
  color: #fff;
  border: none;
  outline: none;
  font: inherit;
  padding: 6px 0;
}
.cursor {
  width: 8px;
  height: 1.2em;
  background: #fff;
  opacity: 1;
}
.cursor.blink { opacity: 0; }
</style>
