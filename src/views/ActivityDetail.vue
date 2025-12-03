<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchActivityDetail, updateActivity } from '@/api/mock'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const route = useRoute()
const router = useRouter()
const id = route.params.id

const loading = ref(true)
const readonly = ref(true)
const detail = ref(null)
const editForm = ref({ title: '', rules: '' })

onMounted(async () => {
  detail.value = await fetchActivityDetail(id)
  editForm.value = { title: detail.value.title, rules: detail.value.rules }
  loading.value = false
})

async function submit() {
  loading.value = true
  const { success } = await updateActivity(id, { title: editForm.value.title, rules: editForm.value.rules })
  loading.value = false
  if (success) {
    readonly.value = true
    detail.value = await fetchActivityDetail(id)
    alert('更新成功')
  } else {
    alert('更新失败')
  }
}
</script>

<template>
  <div>
    <Card v-if="!loading">
      <CardHeader>
        <CardTitle>{{ detail.title }}</CardTitle>
        <div class="text-xs text-muted-foreground">{{ detail.creator }} · {{ new Date(detail.startTime).toLocaleDateString() }} - {{ new Date(detail.endTime).toLocaleDateString() }} · {{ detail.status }}</div>
      </CardHeader>
      <CardContent class="space-y-3">
        <div>
          <div class="font-medium">基础信息</div>
          <div class="text-sm text-muted-foreground">ID: {{ detail.id }} · 分类：{{ detail.category }} · 参与人数：{{ detail.participants }}</div>
        </div>
        <div>
          <div class="font-medium">活动规则</div>
          <div v-if="readonly" class="text-sm whitespace-pre-line" data-guide="detail-rules">{{ detail.rules }}</div>
          <div v-else class="space-y-2" data-guide="detail-rules">
            <Input v-model="editForm.title" placeholder="活动标题" />
            <textarea v-model="editForm.rules" class="w-full rounded border p-2 h-32" placeholder="活动规则"></textarea>
          </div>
        </div>
        <div>
          <div class="font-medium">参与数据（模拟）</div>
          <div class="text-sm">近7日参与人数趋势（示例）：
            <span class="inline-flex items-center gap-1 text-muted-foreground">
              <i class="w-2 h-2 rounded-full bg-green-500"></i> +12%
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter class="flex items-center gap-2">
        <Button variant="outline" @click="readonly = !readonly" data-guide="detail-edit">{{ readonly ? '进入编辑' : '取消编辑' }}</Button>
        <Button v-if="!readonly" @click="submit" data-guide="detail-submit">提交更新</Button>
        <Button variant="ghost" @click="router.back()">返回</Button>
      </CardFooter>
    </Card>
    <div v-else class="space-y-2">
      <div class="h-8 w-1/2 bg-muted animate-pulse rounded"></div>
      <div class="h-32 w-full bg-muted animate-pulse rounded"></div>
      <div class="h-16 w-full bg-muted animate-pulse rounded"></div>
    </div>
  </div>
</template>
