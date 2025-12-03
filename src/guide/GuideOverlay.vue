<script setup>
import Guide from './GuideManager'
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { Button } from '@/components/ui/button'

const targetInfo = computed(() => Guide.getTarget())
const tick = ref(0)
const tipRef = ref(null)
const panelRef = ref(null)
const panelPos = ref({ top: 16, left: 16 })
const dragging = ref(false)
let sx = 0, sy = 0, st = 0, sl = 0
let moveHandler = null
let upHandler = null

const rect = computed(() => {
  const el = targetInfo.value.el
  tick.value
  if (!el) return null
  const r = el.getBoundingClientRect()
  return { top: r.top, left: r.left, width: r.width, height: r.height }
})

const tipPos = computed(() => {
  const r = rect.value
  const vw = window.innerWidth
  const vh = window.innerHeight
  const cardW = 320
  const cardH = tipRef.value ? tipRef.value.offsetHeight : 120
  const m = 12
  if (!r) {
    // Fallback: 居中显示提示卡片，元素缺失时仍给出说明
    return { top: Math.max(m, (vh - cardH) / 2), left: Math.max(m, (vw - cardW) / 2) }
  }
  let top = r.top + r.height + m
  let left = r.left
  if (top + cardH > vh) top = Math.max(m, r.top - cardH - m)
  if (left + cardW > vw) left = Math.max(m, vw - cardW - m)
  left = Math.max(m, left)
  return { top, left }
})

const debugSteps = computed(() => {
  tick.value
  if (!Guide.state.debug) return []
  return (Guide.state.steps || []).map((s, i) => {
    const el = Guide.resolve(s.selector)
    const sel = Array.isArray(s.selector) ? s.selector.join(' | ') : s.selector
    return { index: i, title: s.title, selector: sel, found: !!el }
  })
})

watch(() => Guide.state.index, () => {
  tick.value++
})

watch(targetInfo, () => {
  tick.value++
})

function onKey(e) {
  if (!Guide.state.active) return
  if (e.key === 'Escape') Guide.stop()
  if (e.key === 'ArrowRight') Guide.next()
  if (e.key === 'ArrowLeft') Guide.prev()
}

function onViewport() {
  tick.value++
  const vw = window.innerWidth
  const vh = window.innerHeight
  const w = panelRef.value ? panelRef.value.offsetWidth : 360
  const h = panelRef.value ? panelRef.value.offsetHeight : 240
  panelPos.value.left = Math.max(8, Math.min(vw - w - 8, panelPos.value.left))
  panelPos.value.top = Math.max(8, Math.min(vh - h - 8, panelPos.value.top))
}

function onPanelMouseDown(e) {
  e.preventDefault()
  dragging.value = true
  sx = e.clientX
  sy = e.clientY
  st = panelPos.value.top
  sl = panelPos.value.left
  moveHandler = (ev) => {
    if (!dragging.value) return
    const vw = window.innerWidth
    const vh = window.innerHeight
    const w = panelRef.value ? panelRef.value.offsetWidth : 360
    const h = panelRef.value ? panelRef.value.offsetHeight : 240
    const dx = ev.clientX - sx
    const dy = ev.clientY - sy
    panelPos.value.left = Math.max(8, Math.min(vw - w - 8, sl + dx))
    panelPos.value.top = Math.max(8, Math.min(vh - h - 8, st + dy))
  }
  upHandler = () => {
    dragging.value = false
    document.removeEventListener('mousemove', moveHandler)
    document.removeEventListener('mouseup', upHandler)
    moveHandler = null
    upHandler = null
  }
  document.addEventListener('mousemove', moveHandler)
  document.addEventListener('mouseup', upHandler)
}

onMounted(() => {
  document.addEventListener('keydown', onKey)
  window.addEventListener('scroll', onViewport, { passive: true })
  window.addEventListener('resize', onViewport)
  const vw = window.innerWidth
  const w = panelRef.value ? panelRef.value.offsetWidth : 360
  panelPos.value.left = Math.max(16, vw - w - 16)
})
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKey)
  window.removeEventListener('scroll', onViewport)
  window.removeEventListener('resize', onViewport)
})
</script>

<template>
  <teleport to="body">
    <div v-if="Guide.state.active" class="fixed inset-0 z-[1000]">
      <div class="absolute inset-0 bg-black/50"></div>

      <div v-if="rect" class="absolute ring-2 ring-primary rounded-xl pointer-events-none shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]" :style="{ top: rect.top + 'px', left: rect.left + 'px', width: rect.width + 'px', height: rect.height + 'px' }"></div>

      <div v-if="tipPos" class="absolute" :style="{ top: tipPos.top + 'px', left: tipPos.left + 'px' }">
        <div ref="tipRef" class="rounded-md border bg-card text-card-foreground shadow p-3 w-[320px]">
          <div class="font-medium mb-2">{{ targetInfo.step?.title || '引导' }}</div>
          <div class="text-sm text-muted-foreground mb-3">{{ targetInfo.step?.content }}</div>
          <div class="flex items-center gap-2">
            <Button variant="outline" size="sm" @click="Guide.prev">上一步</Button>
            <Button size="sm" @click="Guide.next">下一步</Button>
            <Button variant="ghost" size="sm" @click="Guide.stop">跳过</Button>
            <span class="text-xs text-muted-foreground ml-auto">{{ Guide.state.index + 1 }} / {{ Guide.state.steps.length }}</span>
          </div>
        </div>
      </div>
      <div v-if="Guide.state.debug && rect" class="absolute text-xs text-muted-foreground" :style="{ top: (rect.top - 20) + 'px', left: rect.left + 'px' }">debug: {{ targetInfo.step?.selector }}</div>

      <div v-if="Guide.state.debug" ref="panelRef" class="absolute z-[1001] w-[360px] rounded-md border bg-card text-card-foreground shadow max-h-[70vh] overflow-auto" :style="{ top: panelPos.top + 'px', left: panelPos.left + 'px' }">
        <div class="px-3 py-2 border-b font-medium cursor-move select-none" @mousedown="onPanelMouseDown">调试面板</div>
        <div class="divide-y">
          <div v-for="d in debugSteps" :key="d.index" class="px-3 py-2 flex items-center gap-2">
            <Button size="sm" variant="outline" @click="Guide.go(d.index)">{{ d.index + 1 }}</Button>
            <div class="flex-1">
              <div class="text-sm">{{ d.title }}</div>
              <div class="text-xs text-muted-foreground truncate">{{ d.selector }}</div>
            </div>
            <div :class="d.found ? 'text-green-600' : 'text-red-600'" class="text-xs">{{ d.found ? '命中' : '缺失' }}</div>
          </div>
        </div>
      </div>
    </div>
  </teleport>
  
</template>
