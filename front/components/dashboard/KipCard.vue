<script setup lang="ts">

interface Props {
  title: string
  value: number | string
  subtitle?: string
}
defineProps<Props>()
</script>

<template>
  <Card class="p-4">
    <CardHeader class="p-0 mb-2 flex justify-between items-center">
      <CardTitle class="text-sm text-muted-foreground">{{ title }}</CardTitle>
      <slot name="actions" />
    </CardHeader>

    <CardContent class="p-0">
      <p class="text-3xl font-bold">{{ value }}</p>
      <p v-if="subtitle" class="text-xs text-muted-foreground">{{ subtitle }}</p>
    </CardContent>
  </Card>
</template>
