<template>
  <div class="pdf-root">
    <div class="pdf-stage">
      <!-- 绝对定位的滚动容器 -->
      <div ref="viewer" class="viewer">
        <!-- 空态（未加载 PDF） -->
        <div v-if="!ready && !loading" class="empty">
          <div class="empty-card">
            <div class="empty-emoji">📄</div>
            <div class="empty-title">还没有打开 PDF</div>
            <div class="empty-sub">点击右下角按钮选择一个 PDF 文件</div>
          </div>
        </div>

        <!-- 连续滚动的页容器 -->
        <div v-show="ready" ref="pagesEl" class="pages"></div>
      </div>

      <!-- HUD（右上角） -->
      <div class="hud">
        <div>Tool: {{ tool }}</div>
        <div>Pages: {{ pageCount }}</div>
        <div>Zoom: {{ zoomPercent }}%</div>
        <div v-if="err" style="color:#ffb4b4">Err: {{ err }}</div>
      </div>

      <!-- 右下角：打开 PDF -->
      <button class="fab" @click="openLocalPdf" aria-label="打开 PDF" title="打开 PDF">📄</button>

      <!-- 底部工具条（悬浮，不随滚动） -->
      <div class="dock" role="toolbar" aria-label="PDF 标注工具">
        <div class="group">
          <button :class="['dock-btn', { active: tool==='HIGHLIGHT' }]" :disabled="!ready"
                  @click="setTool('HIGHLIGHT')" title="荧光笔 (H)">✨<span>荧光笔</span></button>
          <button :class="['dock-btn', { active: tool==='INK' }]" :disabled="!ready"
                  @click="setTool('INK')" title="画笔 (P)">🖊️<span>画笔</span></button>
          <button :class="['dock-btn', { active: tool==='FREETEXT' }]" :disabled="!ready"
                  @click="setTool('FREETEXT')" title="文字 (T)">🔤<span>文字</span></button>
          <button :class="['dock-btn', { active: tool==='ERASER' }]" :disabled="!ready"
                  @click="setTool('ERASER')" title="编辑/删除 (E)">🧽<span>编辑</span></button>
        </div>

        <div class="divider" aria-hidden="true"></div>

        <!-- 缩放 -->
        <div class="group">
          <button class="dock-btn" :disabled="!ready" @click="zoomOut" title="缩小 (Ctrl -)">➖<span>缩小</span></button>
          <button class="dock-btn" :disabled="!ready" @click="resetZoom" title="100%">100%</button>
          <button class="dock-btn" :disabled="!ready" @click="fitWidth" title="适配宽度">↔️<span>适配</span></button>
          <button class="dock-btn" :disabled="!ready" @click="zoomIn" title="放大 (Ctrl +)">➕<span>放大</span></button>
        </div>

        <div class="divider" aria-hidden="true"></div>

        <!-- 撤回 -->
        <div class="group">
          <button class="dock-btn" :disabled="!canUndo" @click="undo" title="撤回 (Ctrl/Cmd + Z)">↩️<span>撤回</span></button>
        </div>

        <div class="divider" aria-hidden="true"></div>

        <button class="primary" :disabled="!ready" @click="save" title="保存批注(JSON)">
          💾<span>保存</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, computed } from 'vue'

/* ===== PDF.js 4.x ===== */
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import 'pdfjs-dist/web/pdf_viewer.css'
import workerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url'
GlobalWorkerOptions.workerSrc = workerUrl as unknown as string

/* ===== viewer shim ===== */
import * as pdfjsViewerNS from 'pdfjs-dist/web/pdf_viewer.mjs'
function buildViewerShim() {
  const {
    AnnotationLayerBuilder,
    EventBus: _EventBus,
    PDFLinkService: _PDFLinkService,
    NullL10n: _NullL10n,
    renderTextLayer: _renderTextLayer
  } = (pdfjsViewerNS as any)

  const EventBus = _EventBus || class {}
  const NullL10n = _NullL10n || { getDirection: () => 'ltr', async get() { return null }, async translate() {} }
  const PDFLinkService = _PDFLinkService || class { setDocument(){} setViewer(){} }

  class CompatTextLayerFactory {
    createTextLayerBuilder(textLayerDiv: HTMLDivElement, _pageIndex: number, viewport: any) {
      let _textContent: any = null
      return {
        textLayerDiv,
        setTextContent(tc:any){ _textContent = tc },
        async render(timeout?:number){
          if (_renderTextLayer && _textContent) {
            return _renderTextLayer({
              textContent: _textContent,
              container: textLayerDiv,
              viewport,
              textDivs: [],
              timeout
            })
          }
        },
        cancel(){ /* no-op */ }
      }
    }
  }

  class CompatAnnotationLayerFactory {
    createAnnotationLayerBuilder(pageDiv: HTMLDivElement, pdfPage:any, annotationStorage=null,
                                 imageResourcesPath='', renderForms=true, l10n=NullL10n) {
      const eventBus = new EventBus()
      const linkService = new PDFLinkService({ eventBus })
      const inner = AnnotationLayerBuilder
        ? new AnnotationLayerBuilder({
            pageDiv,
            pdfPage,
            annotationStorage,
            imageResourcesPath,
            renderForms,
            linkService,
            l10n
          })
        : null
      return {
        async render(params:any){ if (inner?.render) return inner.render(params) },
        cancel(){ inner?.cancel?.() },
        hide(){ inner?.hide?.() },
        show(){ inner?.show?.() }
      }
    }
  }

  return {
    ...pdfjsViewerNS,
    EventBus,
    PDFLinkService,
    NullL10n,
    DefaultTextLayerFactory: CompatTextLayerFactory,
    DefaultAnnotationLayerFactory: CompatAnnotationLayerFactory
  }
}
;(window as any).pdfjsViewer = buildViewerShim()

/* ===== pdf-annotate.js ===== */
import PDFJSAnnotate from '@submitty/pdf-annotate.js'
const { UI } = PDFJSAnnotate
PDFJSAnnotate.setStoreAdapter(new PDFJSAnnotate.LocalStoreAdapter())

/* ---------- refs & state ---------- */
const viewer   = ref<HTMLDivElement|null>(null)
const pagesEl  = ref<HTMLDivElement|null>(null)

const tool       = ref<'HIGHLIGHT'|'INK'|'FREETEXT'|'ERASER'>('HIGHLIGHT')
const pageCount  = ref(0)
const ready      = ref(false)
const loading    = ref(false)
const err        = ref('')
const currentDoc = ref<string>('')

let pdfDoc: any = null
let naturalPageWidth = 0
const scale = ref(1.0)
const zoomPercent = computed(() => Math.round(scale.value * 100))
const SCALE_MIN = 0.5, SCALE_MAX = 3.0, SCALE_STEP = 0.1

/* ---------- 工具开关 ---------- */
function disableAll() {
  try { UI.disablePen() } catch {}
  try { UI.disableText() } catch {}
  try { UI.disablePoint() } catch {}
  try { UI.disableRect() } catch {}
  try { UI.disableEdit() } catch {}
}
function setTool(t: typeof tool.value) {
  if (!ready.value) return
  tool.value = t
  disableAll()
  switch (t) {
    case 'HIGHLIGHT':
      UI.enableRect('highlight')
      break
    case 'INK':
      UI.enablePen()
      UI.setPen?.(1.5, '2f64dd')   // 更细
      break
    case 'FREETEXT':
      UI.enableText()
      UI.setText?.(14, '111111')
      break
    case 'ERASER':
      UI.enableEdit()
      break
  }
}

/* ---------- 撤回（简易历史栈：add/delete） ---------- */
type HistoryItem = { kind: 'add'|'delete', docId: string, page: number, anno: any }
const historyStack: HistoryItem[] = []
const canUndo = computed(() => historyStack.length > 0)

async function undo() {
  if (!canUndo.value) return
  const item = historyStack.pop()!
  const store = PDFJSAnnotate.getStoreAdapter() as any
  try {
    if (item.kind === 'add') {
      await store.deleteAnnotation(item.docId, item.anno.uuid || item.anno.id)
    } else if (item.kind === 'delete') {
      await store.addAnnotation(item.docId, item.page, item.anno)
    }
    await requestRerender()
  } catch (e) {
    console.warn('[undo] failed', e)
  }
}
function hookHistoryEvents() {
  try {
    UI.addEventListener?.('annotation:add', (payload:any) => {
      const anno = payload?.annotation || payload
      const page = anno?.page || payload?.page || 1
      historyStack.push({ kind:'add', docId: currentDoc.value || 'document', page, anno })
    })
    UI.addEventListener?.('annotation:delete', (payload:any) => {
      const anno = payload?.annotation || payload
      const page = anno?.page || payload?.page || 1
      historyStack.push({ kind:'delete', docId: currentDoc.value || 'document', page, anno })
    })
  } catch {}
}

/* ---------- Zoom ---------- */
function zoomIn()  { setScale(Math.min(scale.value + SCALE_STEP, SCALE_MAX)) }
function zoomOut() { setScale(Math.max(scale.value - SCALE_STEP, SCALE_MIN)) }
function resetZoom(){ setScale(1.0) }
function fitWidth() {
  if (!viewer.value || !naturalPageWidth) return
  const containerWidth = Math.max(0, viewer.value.clientWidth - 48) // padding: 24*2
  const s = Math.max(0.1, Math.min(containerWidth / naturalPageWidth, SCALE_MAX))
  setScale(s)
}
function setScale(s:number){
  if (!pdfDoc) return
  scale.value = s
  requestRerender()
}

/* ---------- 文件读取 ---------- */
function base64ToU8(b64: string) {
  const bin = typeof atob==='function' ? atob(b64) : Buffer.from(b64, 'base64').toString('binary')
  const u8 = new Uint8Array(bin.length)
  for (let i=0;i<bin.length;i++) u8[i] = bin.charCodeAt(i) & 0xff
  return u8
}
function looksLikePdf(u8: Uint8Array) {
  return u8.byteLength >= 5 &&
    u8[0]===0x25 && u8[1]===0x50 && u8[2]===0x44 && u8[3]===0x46 && u8[4]===0x2D // %PDF-
}

/* ---------- 打开本地 PDF ---------- */
async function openLocalPdf() {
  err.value = ''
  loading.value = true
  try {
    const fp: string|undefined = await (window as any).electronAPI?.openPdfDialog?.()
    if (!fp) { loading.value = false; return }
    currentDoc.value = fp

    let u8: Uint8Array | null = null
    try {
      const buf: ArrayBuffer = await (window as any).electronAPI?.readFileAsArrayBuffer?.(fp)
      if (buf && buf.byteLength > 0) u8 = new Uint8Array(buf)
    } catch {}

    if (!u8) {
      const b64: string = await (window as any).electronAPI?.readFileAsBase64?.(fp)
      if (!b64) throw new Error('无法读取文件：' + fp)
      u8 = base64ToU8(b64)
    }

    await loadPdf(u8)
  } catch (e:any) {
    err.value = e?.message || String(e)
    console.error('[openLocalPdf] fail:', e)
  } finally {
    loading.value = false
  }
}

/* ---------- 渲染串行化 & 防抖 ---------- */
let rendering = false
let rerenderPending = false
let resizeTimer: any = null

async function requestRerender() {
  if (rendering) { rerenderPending = true; return }
  await renderDocumentWithScale().catch(e => console.error('[rerender] fail', e))
}

function debounceResizeRerender(){
  clearTimeout(resizeTimer)
  resizeTimer = setTimeout(async () => {
    if (pdfDoc && naturalPageWidth) {
      const prev = scale.value
      fitWidth()
      if (Math.abs(scale.value - prev) < 0.01) await requestRerender()
    }
  }, 200)
}

/* ---------- 加载 & 渲染 ---------- */
async function loadPdf(u8: Uint8Array) {
  if (!looksLikePdf(u8)) throw new Error('选择的内容不是 PDF（缺少 %PDF- 头）')

  // 重置
  ready.value = false
  pageCount.value = 0
  historyStack.length = 0
  pagesEl.value && (pagesEl.value.innerHTML = '')

  pdfDoc = await getDocument({ data: u8 }).promise
  pageCount.value = pdfDoc.numPages

  const tmpPage = await pdfDoc.getPage(1)
  naturalPageWidth = tmpPage.getViewport({ scale: 1.0 }).width
  tmpPage.cleanup()

  // 先渲染一轮，确保 UI 有内容，再开放交互
  fitWidth()
  await requestRerender()

  UI.enableEdit()
  ready.value = true
  setTool('HIGHLIGHT') // 渲染有内容后再启用工具，避免“无反应”的错觉
  console.log('[PDF] loaded:', pageCount.value, 'pages, scale=', scale.value)
}

async function renderDocumentWithScale() {
  if (!pdfDoc || !pagesEl.value) return
  rendering = true
  rerenderPending = false

  pagesEl.value.innerHTML = ''

  PDFJSAnnotate.setStoreAdapter(new PDFJSAnnotate.LocalStoreAdapter())

  for (let i=1; i<=pageCount.value; i++) {
    const page = await pdfDoc.getPage(i)
    const viewport = page.getViewport({ scale: scale.value })

    const pageEl = UI.createPage(i)
    pageEl.style.width  = `${viewport.width}px`
    pageEl.style.height = `${viewport.height}px`
    pagesEl.value!.appendChild(pageEl)

    await UI.renderPage(i, {
      documentId: currentDoc.value || 'document',
      pdfDocument: pdfDoc,
      scale: scale.value,
      rotate: 0
    })
  }

  rendering = false
  if (rerenderPending) await requestRerender()
}

/* ---------- 监听尺寸变化 & 快捷键 ---------- */
let ro: ResizeObserver | null = null
onMounted(() => {
  hookHistoryEvents()

  if (window.ResizeObserver && viewer.value) {
    ro = new ResizeObserver(debounceResizeRerender)
    ro.observe(viewer.value)
  }

  // 快捷键：工具 + 缩放 + 撤回
  window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase()
    if (k === 'h') setTool('HIGHLIGHT')
    if (k === 'p') setTool('INK')
    if (k === 't') setTool('FREETEXT')
    if (k === 'e') setTool('ERASER')
    if ((e.ctrlKey || e.metaKey) && k === '=') { e.preventDefault(); zoomIn() }
    if ((e.ctrlKey || e.metaKey) && k === '-') { e.preventDefault(); zoomOut() }
    if ((e.ctrlKey || e.metaKey) && k === '0') { e.preventDefault(); resetZoom() }
    if ((e.ctrlKey || e.metaKey) && k === 'z') { e.preventDefault(); undo() }
  })
})
onBeforeUnmount(() => { ro?.disconnect(); ro = null; clearTimeout(resizeTimer) })

/* ---------- 保存批注 ---------- */
async function save() {
  if (!ready.value) return
  const store = PDFJSAnnotate.getStoreAdapter() as any
  const annos = await store.getAllAnnotations(currentDoc.value || 'document')
  await (window as any).electronAPI?.saveAnnotationsJSON?.(currentDoc.value || 'document', annos)
  alert('批注已保存（JSON）')
}
</script>

<style scoped>
/* 让路由子页“吃满 window-content 的剩余高度” —— 关键：flex:1 */
.pdf-root{
  position: relative;
  flex: 1 1 auto;      /* ✅ 作为 router-view 的直接子元素，必须可扩展 */
  min-height: 0;       /* ✅ 允许内部滚动容器正确计算高度 */
  display: flex;
  flex-direction: column;
}
.pdf-stage{
  position: relative;
  flex: 1 1 auto;      /* ✅ 继续把空间传递给内部绝对定位容器 */
  min-height: 0;
}

/* 绝对定位的滚动容器：占满父层，内部滚动 */
.viewer{
  position: absolute;
  inset: 0;                  /* top/right/bottom/left: 0 */
  overflow: auto;            /* ✅ 滚动在这里发生 */
  background: #f6f7fb;
  padding: 24px;
  padding-bottom: 160px;     /* 给底部悬浮工具条让出空间 */
  box-sizing: border-box;
}

/* 空态 */
.empty{
  height: 100%;
  display: grid;
  place-items: center;
}
.empty-card{
  background: #fff;
  border: 1px solid #eee;
  border-radius: 14px;
  padding: 28px 36px;
  text-align: center;
  box-shadow: 0 10px 24px rgba(0,0,0,.06);
}
.empty-emoji{ font-size: 36px; line-height: 1; margin-bottom: 6px; }
.empty-title{ font-weight: 600; font-size: 16px; margin-bottom: 4px; }
.empty-sub{ color: #666; font-size: 13px; }

/* 连续滚动的页面容器：居中 */
.pages{
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

/* 文字/标注层可交互 */
:deep(.textLayer),
:deep(.annotationLayer){
  pointer-events: auto;
  z-index: 2;
}

/* 高亮柔和 */
:deep(.annotationLayer) .highlight,
:deep(.annotationLayer) .pdf-annotate-highlight,
:deep(svg .annotation.highlight) {
  opacity: 0.28;
}

/* HUD / FAB / Dock 悬浮层级要高，避免被内容覆盖 */
.hud{
  position: absolute; right: 16px; top: 16px;
  display: flex; gap: 8px; align-items: center;
  padding: 6px 10px; font-size: 12px;
  background: rgba(0,0,0,.5); color: #fff; border-radius: 10px;
  z-index: 20;
}
.fab{
  position: absolute; right: 24px; bottom: 24px;
  width: 56px; height: 56px; border-radius: 50%;
  border: none; cursor: pointer;
  background: linear-gradient(180deg,#5a8bff,#4066d8);
  color: #fff; display: grid; place-items: center;
  z-index: 30;
}
.dock{
  position: absolute; left: 50%; bottom: 24px; transform: translateX(-50%);
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
  padding: 8px 10px; background: rgba(255,255,255,.82);
  -webkit-backdrop-filter: saturate(180%) blur(10px);
  backdrop-filter: saturate(180%) blur(10px);
  border: 1px solid rgba(0,0,0,.06); border-radius: 16px;
  z-index: 40;                 /* ✅ 永远在最上层 */
}

.group{ display:flex; gap:6px; align-items:center; }
.dock-btn{ display:inline-flex; align-items:center; gap:6px; padding:8px 10px; border-radius:12px; background:transparent; border:none; cursor:pointer; }
.dock-btn[disabled]{ opacity:.5; cursor:not-allowed; }
.dock-btn.active{ background:#e9f0ff; color:#2f64dd; }
.divider{ width:1px; height:22px; background:rgba(0,0,0,.08); margin:0 2px; }
.dock .primary{ background:#2f64dd; color:#fff; border:none; padding:8px 10px; border-radius:12px; }
.dock .primary[disabled]{ opacity:.5; cursor:not-allowed; }

/* 窄屏：隐藏文字标签，仅保留图标 */
@media (max-width: 920px) {
  .dock-btn span { display: none; }
}
</style>
