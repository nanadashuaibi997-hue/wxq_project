<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { fetchHomeHighlights } from '@/api/mock'
import { Button } from '@/components/ui/button'
import { FestivalCard, PromotionCard, BrandCard } from '@/components/activity-cards'

const loading = ref(true)
const layout = ref('grid') // grid | carousel
const data = ref({ bannerList: [], categories: [], announcements: [] })
const cardMap = { '节日': FestivalCard, '促销': PromotionCard, '品牌': BrandCard }
const current = ref(0)
let timer
const router = useRouter()
const startX = ref(0)
const startY = ref(0)
const deltaX = ref(0)
const swiping = ref(false)

onMounted(async () => {
  data.value = await fetchHomeHighlights()
  loading.value = false
  if (layout.value === 'carousel' && data.value.bannerList.length) {
    startTimer()
  }
  document.addEventListener('visibilitychange', onVisibility)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
  document.removeEventListener('visibilitychange', onVisibility)
})

watch(layout, (val) => {
  if (timer) {
    clearInterval(timer)
    timer = undefined
  }
  current.value = 0
  if (val === 'carousel' && data.value.bannerList.length) {
    startTimer()
  }
})

function startTimer() {
  stopTimer()
  timer = setInterval(() => {
    current.value = (current.value + 1) % data.value.bannerList.length
  }, 1500)
}

function stopTimer() {
  if (timer) {
    clearInterval(timer)
    timer = undefined
  }
}

function onVisibility() {
  if (document.hidden) stopTimer()
  else if (layout.value === 'carousel' && data.value.bannerList.length) startTimer()
}

function onTouchStart(e) {
  if (layout.value !== 'carousel') return
  const t = e.changedTouches[0]
  startX.value = t.clientX
  startY.value = t.clientY
  deltaX.value = 0
  swiping.value = true
  stopTimer()
}

function onTouchMove(e) {
  if (!swiping.value) return
  const t = e.changedTouches[0]
  const dx = t.clientX - startX.value
  const dy = Math.abs(t.clientY - startY.value)
  if (dy > 30) return
  deltaX.value = dx
}

function onTouchEnd() {
  if (!swiping.value) return
  const threshold = 40
  if (deltaX.value > threshold) {
    current.value = (current.value - 1 + data.value.bannerList.length) % data.value.bannerList.length
  } else if (deltaX.value < -threshold) {
    current.value = (current.value + 1) % data.value.bannerList.length
  }
  swiping.value = false
  startTimer()
}
</script>

<template>
  <div class="space-y-6 theme-festival">
    <!-- Banner + 布局切换 -->
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold">重点活动</h2>
      <div class="flex gap-2" data-guide="home-layout">
        <Button variant="outline" @click="layout = 'grid'" data-guide="home-grid-btn">宫格</Button>
        <Button variant="outline" @click="layout = 'carousel'" data-guide="home-carousel-btn">轮播</Button>
      </div>
    </div>

    <!-- 公告区域 -->
    <div class="rounded-md border p-3 bg-muted">
      <ul class="text-sm list-disc pl-5">
        <li v-for="ann in data.announcements" :key="ann.id">{{ ann.text }}</li>
      </ul>
    </div>

    <!-- 分类入口 -->
    <div class="flex flex-wrap gap-2" data-guide="home-categories">
      <Button v-for="c in data.categories" :key="c" class="pulse" @click="router.push({ name: 'activities', query: { highlightsOnly: '1', category: c !== '全部' ? c : undefined, page: 1 } })">{{ c }}</Button>
    </div>

    <!-- Banner 内容：宫格/轮播 切换 -->
    <div v-if="loading" class="grid grid-cols-3 gap-4">
      <div v-for="i in 6" :key="i" class="h-32 rounded bg-muted animate-pulse"></div>
    </div>

    <div v-else>
      <div v-if="layout === 'grid'" class="grid grid-cols-3 gap-4">
        <component
          v-for="b in data.bannerList"
          :is="cardMap[b.category] || PromotionCard"
          :key="b.id"
          :data="b"
        />
      </div>

      <div v-else class="relative" @mouseenter="stopTimer" @mouseleave="startTimer" @touchstart.passive="onTouchStart" @touchmove.passive="onTouchMove" @touchend="onTouchEnd">
        <div class="overflow-hidden rounded border">
          <div class="flex transition-transform duration-500" :style="{ transform: `translateX(-${current * 100}%)` }">
            <div v-for="b in data.bannerList" :key="b.id" class="min-w-full">
              <component :is="cardMap[b.category] || PromotionCard" :data="b" class="w-full" />
            </div>
          </div>
        </div>
        <div class="absolute inset-y-0 left-2 flex items-center" data-guide="home-carousel-prev">
          <Button variant="ghost" size="icon" @click="current = (current - 1 + data.bannerList.length) % data.bannerList.length">‹</Button>
        </div>
        <div class="absolute inset-y-0 right-2 flex items-center" data-guide="home-carousel-next">
          <Button variant="ghost" size="icon" @click="current = (current + 1) % data.bannerList.length">›</Button>
        </div>
      </div>
    </div>
  </div>
</template>
