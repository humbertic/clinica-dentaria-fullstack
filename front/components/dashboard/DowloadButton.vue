<script setup lang="ts">
const props = defineProps<{ format: string }>()
function click() {
  console.log('download', props.format)
}
</script>

<template>
  <Button variant="outline" size="sm" @click="click">
    {{ format.toUpperCase() }}
  </Button>
</template>
