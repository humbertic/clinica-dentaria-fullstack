
<script setup lang="ts">
/* -----------------------------------------------------------
   Cartão genérico de gráfico de barras (Shadcn Vue + Chart.js)
   ----------------------------------------------------------- */

interface Props {
  title: string
  data: any[]           // Array<{ ... }>
  index: string         // nome da chave do eixo-X
  categories: string[]  // colunas numéricas a mostrar em barras
}
const props = defineProps<Props>()

// Generate color config for each category using CSS variables
const colors = props.categories.map((_, i) => `var(--chart-${i + 1})`)
</script>

<template>
  <Card class="p-4">
    <CardHeader class="p-0 mb-2 flex justify-between items-center">
      <CardTitle>{{ title }}</CardTitle>

      <!-- acções (botões download, etc.) -->
      <slot name="actions">
        <DashboardDowloadButton format="pdf" />
      </slot>
    </CardHeader>

    <CardContent class="p-0">
      <BarChart
        :title="title"
        :data="data"
        :index="index"
        :categories="categories"
        :colors="colors"
        class="h-64 w-full"
      />
    </CardContent>
  </Card>
</template>
