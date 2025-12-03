<script setup>
import Guide from './GuideManager'
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { Button } from '@/components/ui/button'

const targetInfo = computed(() => Guide.getTarget())
const tick = ref(0)
const tipRef = ref(null)

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

function onKey(e) {
  if (!Guide.state.active) return
  if (e.key === 'Escape') Guide.stop()
  if (e.key === 'ArrowRight') Guide.next()
  if (e.key === 'ArrowLeft') Guide.prev()
}

function onViewport() {
  tick.value++
}

onMounted(() => {
  document.addEventListener('keydown', onKey)
  window.addEventListener('scroll', onViewport, { passive: true })
  window.addEventListener('resize', onViewport)
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
    </div>
  </teleport>
  
</template>
