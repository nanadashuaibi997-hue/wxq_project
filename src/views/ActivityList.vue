<script setup>
import { ref, watch, computed } from 'vue'
import { watchDebounced } from '@vueuse/core'
import { useRoute, useRouter } from 'vue-router'
import { fetchActivityList } from '@/api/mock'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import VirtualList from 'vue3-virtual-scroll-list'
import ActivityItem from '@/components/list/ActivityItem.vue'
import { Loader2 } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

const status = ref(route.query.status || '全部')
const category = ref(route.query.category || '全部')
const keyword = ref(route.query.keyword || '')
const start = ref(route.query.start || '')
const end = ref(route.query.end || '')
const page = ref(Number(route.query.page || 1))
const pageSize = ref(20)
const highlightsOnly = ref(route.query.highlightsOnly === '1')

const loading = ref(false)
const total = ref(0)
const list = ref([])
let reqId = 0

async function load() {
  const id = ++reqId
  loading.value = true
  const { list: l, total: t } = await fetchActivityList({ page: page.value, pageSize: pageSize.value, status: status.value, keyword: keyword.value, start: start.value, end: end.value, highlightsOnly: highlightsOnly.value, category: category.value !== '全部' ? category.value : undefined })
  if (id !== reqId) return
  list.value = l
  total.value = t
  loading.value = false
}

function updateQuery() {
  router.replace({ name: 'activities', query: { status: status.value, category: category.value !== '全部' ? category.value : undefined, keyword: keyword.value, start: start.value, end: end.value, page: page.value, highlightsOnly: highlightsOnly.value ? '1' : undefined } })
}

watchDebounced([keyword], () => {
  page.value = 1
  updateQuery()
  load()
}, { debounce: 400, maxWait: 1000 })

watchDebounced([status, category, start, end, page, highlightsOnly], () => {
  updateQuery()
  load()
}, { debounce: 150, maxWait: 600 })

load()

const pageCount = computed(() => Math.ceil(total.value / pageSize.value))

function toDetail(id) {
  router.push({ name: 'activity-detail', params: { id } })
}
</script>

<template>
  <div class="space-y-4">
    <!-- 筛选区 -->
    <div class="grid grid-cols-6 gap-3 items-end">
      <div data-guide="list-status">
        <label class="text-sm text-muted-foreground">状态</label>
        <Select v-model="status">
          <SelectTrigger class="w-full" :disabled="loading"><SelectValue placeholder="选择状态" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="全部">全部</SelectItem>
            <SelectItem value="未开始">未开始</SelectItem>
            <SelectItem value="进行中">进行中</SelectItem>
            <SelectItem value="已结束">已结束</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div data-guide="list-category">
        <label class="text-sm text-muted-foreground">分类</label>
        <Select v-model="category">
          <SelectTrigger class="w-full" :disabled="loading"><SelectValue placeholder="选择分类" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="全部">全部</SelectItem>
            <SelectItem value="节日">节日</SelectItem>
            <SelectItem value="促销">促销</SelectItem>
            <SelectItem value="品牌">品牌</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div data-guide="list-keyword">
        <label class="text-sm text-muted-foreground">关键词</label>
        <Input v-model="keyword" placeholder="输入活动标题关键词" :disabled="loading" />
      </div>
      <div>
        <label class="text-sm text-muted-foreground">开始时间</label>
        <Input v-model="start" type="date" :disabled="loading" />
      </div>
      <div>
        <label class="text-sm text-muted-foreground">结束时间</label>
        <Input v-model="end" type="date" :disabled="loading" />
      </div>
      <div class="flex items-center justify-end gap-4">
        <label class="inline-flex items-center gap-2 text-sm select-none">
          <input type="checkbox" v-model="highlightsOnly" :disabled="loading" data-guide="list-highlights" />
          仅重点活动
        </label>
        <span class="inline-flex items-center gap-2 text-sm">
          共 {{ total }} 条
          <Loader2 v-if="loading" class="w-4 h-4 animate-spin text-muted-foreground" />
        </span>
      </div>
    </div>

    <!-- 列表骨架屏与虚拟滚动 -->
    <div v-if="loading" class="space-y-2">
      <Skeleton v-for="i in 10" :key="i" class="h-20 w-full" />
    </div>

    <VirtualList
      v-else
      :data-key="'id'"
      :data-sources="list"
      :data-component="ActivityItem"
      :keeps="20"
      :estimate-size="100"
      class="space-y-2 h-[70vh] overflow-auto"
      data-guide="list-container"
    />

    <!-- 空状态 -->
    <div v-if="!loading && total === 0" class="text-sm text-muted-foreground text-center py-8">暂无数据，请调整筛选条件</div>

    <!-- 分页 -->
    <div class="flex items-center justify-center gap-2">
      <button class="px-3 py-1 border rounded" :disabled="page === 1" @click="page = page - 1">上一页</button>
      <span class="text-sm">{{ page }} / {{ pageCount }}</span>
      <button class="px-3 py-1 border rounded" :disabled="page >= pageCount" @click="page = page + 1">下一页</button>
    </div>
  </div>
</template>
