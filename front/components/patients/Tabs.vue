<script setup lang="ts">
const props = defineProps<{
  active: 'resumo' | 'ficha-clinica' | 'consultas' | 'planos' | 'orcamentos' | 'pagamentos',
  // Add a prop to control which tabs to show
  visibleTabs?: Array<'resumo' | 'ficha-clinica' | 'consultas' | 'planos' | 'orcamentos' | 'pagamentos'>
}>()

// Set default values
const defaultProps = {
  visibleTabs: ['resumo', 'ficha-clinica', 'consultas', 'planos', 'orcamentos', 'pagamentos']
}

// Computed property to determine which tabs should be visible
const availableTabs = computed(() => {
  return props.visibleTabs || defaultProps.visibleTabs;
})

const emit = defineEmits<{
  (e: 'update:active', tab: typeof props.active): void
}>()

function select(tab: typeof props.active) {
  emit('update:active', tab)
}

// Handle the case where the active tab might be hidden
watchEffect(() => {
  if (props.active && !availableTabs.value.includes(props.active)) {
    // If the active tab is not visible, select the first visible tab
    if (availableTabs.value.length > 0) {
      select(availableTabs.value[0] as typeof props.active)
    }
  }
})
</script>

<template>
  <div class="md:hidden">
    <select
      v-model="props.active"
      @change="select(($event.target as HTMLSelectElement).value as typeof props.active)"
      class="h-10 w-full rounded-md border px-3 py-2"
    >
      <option v-if="availableTabs.includes('resumo')" value="resumo">Resumo</option>
      <option v-if="availableTabs.includes('ficha-clinica')" value="ficha-clinica">Ficha Clínica</option>
      <option v-if="availableTabs.includes('orcamentos')" value="orcamentos">Orçamentos</option>
      <option v-if="availableTabs.includes('consultas')" value="consultas">Consultas</option>
      <option v-if="availableTabs.includes('planos')" value="planos">Planos</option>
      <option v-if="availableTabs.includes('pagamentos')" value="pagamentos">Pagamentos</option>
    </select>
  </div>

  <div class="hidden md:block border-b">
    <div class="flex h-10 items-center space-x-4">
      <button
        v-if="availableTabs.includes('resumo')"
        @click="select('resumo')"
        :class="props.active==='resumo' ? 'border-primary text-foreground border-b-2' : 'text-muted-foreground'"
        class="px-3 py-1.5 text-sm"
      >
        Resumo
      </button>
      <button
        v-if="availableTabs.includes('ficha-clinica')"
        @click="select('ficha-clinica')"
        :class="props.active==='ficha-clinica' ? 'border-primary text-foreground border-b-2' : 'text-muted-foreground'"
        class="px-3 py-1.5 text-sm"
      >
        Ficha Clínica
      </button>
      <button
        v-if="availableTabs.includes('orcamentos')"
        @click="select('orcamentos')"
        :class="props.active==='orcamentos' ? 'border-primary text-foreground border-b-2' : 'text-muted-foreground'"
        class="px-3 py-1.5 text-sm"
      >
        Orçamentos
      </button>
      <button
        v-if="availableTabs.includes('consultas')"
        @click="select('consultas')"
        :class="props.active==='consultas' ? 'border-primary text-foreground border-b-2' : 'text-muted-foreground'"
        class="px-3 py-1.5 text-sm"
      >
        Consultas
      </button>
      <button
        v-if="availableTabs.includes('planos')"
        @click="select('planos')"
        :class="props.active==='planos' ? 'border-primary text-foreground border-b-2' : 'text-muted-foreground'"
        class="px-3 py-1.5 text-sm"
      >
        Planos
      </button>
      <button
        v-if="availableTabs.includes('pagamentos')"
        @click="select('pagamentos')"
        :class="props.active==='pagamentos' ? 'border-primary text-foreground border-b-2' : 'text-muted-foreground'"
        class="px-3 py-1.5 text-sm"
      >
        Pagamentos
      </button>
    </div>
  </div>
</template>