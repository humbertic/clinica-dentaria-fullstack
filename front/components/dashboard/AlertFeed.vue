<script setup lang="ts">
import { Alert } from '@/components/ui/alert'
defineProps<{ alerts: string[] }>()
</script>

<template>
  <div class="space-y-2">
    <Alert v-for="(msg, i) in alerts" :key="i" variant="destructive">
      {{ msg }}
    </Alert>
  </div>
</template>
