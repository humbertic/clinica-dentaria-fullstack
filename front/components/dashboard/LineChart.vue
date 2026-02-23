<script setup lang="ts">
interface Props {
  title: string
  data: any[]
  index: string
  categories: string[]
}
defineProps<Props>()
</script>

<template>
  <Card class="p-4">
    <CardHeader class="p-0 mb-2 flex justify-between items-center">
      <CardTitle>{{ title }}</CardTitle>
      <slot name="actions">
        <DashboardDowloadButton format="pdf" />
      </slot>
    </CardHeader>

    <CardContent class="p-0">
           <LineChart
        :title="title"
        :data="data"
        :index="index"
        :categories="categories"
        :colors="['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)']"
        class="h-64 w-full"
      />
    </CardContent>
  </Card>
</template>

