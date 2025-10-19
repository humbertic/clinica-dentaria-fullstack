<template>
  <Badge :variant="getVariant" :method="props.method">
    {{ getLabel }}
  </Badge>
</template>

<script setup lang="ts">
const props = defineProps<{
  method: string
}>();

const getLabel = computed(() => {
  switch (props.method) {
    case 'dinheiro': return 'Dinheiro';
    case 'cartao': return 'Cartão';
    case 'transferencia': return 'Transferência';
    default: return props.method;
  }
});

const getVariant = computed(() => {
  switch (props.method) {
    case 'dinheiro': return 'success';
    case 'cartao': return 'default';
    case 'transferencia': return 'secondary';
    default: return 'default';
  }
});
</script>