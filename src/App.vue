<script setup>
import { Button } from '@/components/ui/button'
import Guide from '@/guide/GuideManager'
import { useRoute } from 'vue-router'

const route = useRoute()

function devEntry() {
  if (Guide.state.active) {
    Guide.toggleDebug()
  } else {
    Guide.start(String(route.name), { debug: true, persist: true, resume: true })
  }
}
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <header class="border-b">
      <div class="container mx-auto px-4 py-3 flex items-center justify-between">
        <h1 class="text-xl font-semibold">运营活动平台</h1>
        <nav class="flex items-center gap-4">
          <!-- 使用路由链接保证与 createWebHistory 配置一致 -->
          <router-link class="text-sm hover:underline" to="/">首页</router-link>
          <router-link class="text-sm hover:underline" to="/activities">活动列表</router-link>
          <Button size="sm" variant="outline" @click="Guide.start($route.name)">新手引导</Button>
          <Button size="sm" variant="outline" @click="devEntry">开发者模式</Button>
        </nav>
      </div>
    </header>
    <main class="container mx-auto px-4 py-6">
      <router-view />
      <GuideOverlay />
    </main>
  </div>
</template>

<style scoped>
</style>
