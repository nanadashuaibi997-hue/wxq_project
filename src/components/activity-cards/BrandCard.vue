<script setup>
const props = defineProps({ data: { type: Object, required: true } })
</script>

<template>
  <div class="group rounded overflow-hidden border">
    <div class="h-32 bg-gradient-to-r from-indigo-500 to-blue-600 transition-all duration-700 group-hover:saturate-150"></div>
    <div class="p-3">
      <div class="flex items-center justify-between">
        <span class="font-medium">🏷️ {{ props.data.title }}</span>
        <span class="text-xs text-muted-foreground">{{ props.data.status }}</span>
      </div>
      <div class="text-xs text-muted-foreground">{{ props.data.creator }} · {{ new Date(props.data.startTime).toLocaleDateString() }} - {{ new Date(props.data.endTime).toLocaleDateString() }}</div>
    </div>
  </div>
</template>
