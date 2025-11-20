<template>
  <div class="stat-card bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
    <div class="flex items-center justify-between">
      <div class="flex-1">
        <p class="text-sm font-medium text-gray-600 uppercase tracking-wider">{{ title }}</p>
        <p class="mt-2 text-3xl font-bold" :class="valueColor">{{ formattedValue }}</p>
        <p v-if="subtitle" class="mt-1 text-sm text-gray-500">{{ subtitle }}</p>
      </div>
      <div v-if="icon" class="flex-shrink-0 ml-4">
        <div class="w-12 h-12 rounded-full flex items-center justify-center" :class="iconBgClass">
          <component :is="icon" class="w-6 h-6" :class="iconColor" />
        </div>
      </div>
    </div>

    <div v-if="trend" class="mt-4 flex items-center text-sm">
      <span v-if="trend > 0" class="text-green-600 flex items-center">
        <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
        </svg>
        +{{ trend }}%
      </span>
      <span v-else-if="trend < 0" class="text-red-600 flex items-center">
        <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
        </svg>
        {{ trend }}%
      </span>
      <span v-else class="text-gray-600">—</span>
      <span class="ml-2 text-gray-600">{{ trendLabel || 'vs período anterior' }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  value: number | string
  subtitle?: string
  icon?: any
  iconColor?: string
  iconBgClass?: string
  valueColor?: string
  trend?: number
  trendLabel?: string
  format?: 'number' | 'currency' | 'percentage'
}

const props = withDefaults(defineProps<Props>(), {
  iconColor: 'text-blue-600',
  iconBgClass: 'bg-blue-100',
  valueColor: 'text-gray-900',
  format: 'number'
})

const formattedValue = computed(() => {
  if (typeof props.value === 'string') return props.value

  switch (props.format) {
    case 'currency':
      return new Intl.NumberFormat('pt-PT', {
        style: 'currency',
        currency: 'EUR'
      }).format(props.value)
    case 'percentage':
      return `${props.value}%`
    default:
      return new Intl.NumberFormat('pt-PT').format(props.value)
  }
})
</script>

<style scoped>
.stat-card {
  min-height: 140px;
}
</style>
