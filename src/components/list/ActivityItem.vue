<script setup>
import { useRouter } from 'vue-router'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'

const props = defineProps({
  index: { type: Number, required: false },
  source: { type: Object, required: true },
})

const router = useRouter()

function toDetail() {
  router.push({ name: 'activity-detail', params: { id: props.source.id } })
}
</script>

<template>
  <Card class="cursor-pointer min-h-[80px]" @click="toDetail">
    <CardHeader>
      <div class="flex items-center justify-between">
        <CardTitle>{{ props.source.title }}</CardTitle>
        <div class="text-sm text-muted-foreground">{{ props.source.status }}</div>
      </div>
      <div class="text-xs text-muted-foreground">{{ props.source.creator }} · {{ new Date(props.source.startTime).toLocaleDateString() }} - {{ new Date(props.source.endTime).toLocaleDateString() }}</div>
    </CardHeader>
    <CardContent>
      <div class="text-sm">参与人数：{{ props.source.participants }}</div>
    </CardContent>
    <CardFooter class="text-xs text-muted-foreground">ID: {{ props.source.id }}</CardFooter>
  </Card>
</template>
