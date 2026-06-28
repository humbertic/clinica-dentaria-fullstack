<template>
  <Card>
    <CardContent class="p-6 flex items-center gap-4">
      <div :class="['p-3 rounded-full', iconBgClass]">
        <slot name="icon">
          <ActivityIcon :class="['w-5 h-5', iconColor]" />
        </slot>
      </div>
      <div>
        <p class="text-sm text-muted-foreground">{{ title }}</p>
        <p class="text-2xl font-bold text-foreground">{{ value }}</p>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { ActivityIcon } from 'lucide-vue-next'

defineProps<{
  title: string
  value: number | string
  iconBgClass?: string
  iconColor?: string
}>()
</script>
