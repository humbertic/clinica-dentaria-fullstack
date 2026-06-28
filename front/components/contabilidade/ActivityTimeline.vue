<template>
  <Card>
    <CardHeader>
      <CardTitle>{{ title }}</CardTitle>
    </CardHeader>
    <CardContent>
      <div v-if="loading" class="space-y-4">
        <Skeleton v-for="i in 5" :key="i" class="h-16 rounded-lg" />
      </div>

      <div v-else-if="!activities.length" class="py-12 text-center text-muted-foreground">
        Nenhuma atividade encontrada.
      </div>

      <div v-else class="relative space-y-0">
        <div
          v-for="(activity, index) in activities"
          :key="activity.id"
          class="flex gap-4"
        >
          <!-- Timeline line + dot -->
          <div class="flex flex-col items-center">
            <div :class="['mt-1 w-2.5 h-2.5 rounded-full flex-shrink-0', dotColor(activity.acao)]" />
            <div v-if="index < activities.length - 1" class="w-px flex-1 bg-border mt-1" />
          </div>

          <!-- Content -->
          <div class="pb-6 flex-1 min-w-0">
            <div class="flex flex-wrap items-center gap-2 mb-1">
              <Badge :variant="badgeVariant(activity.acao)">{{ activity.acao }}</Badge>
              <span class="text-sm font-medium text-foreground truncate">{{ activity.objeto }}</span>
              <span v-if="activity.objeto_id" class="text-xs text-muted-foreground">#{{ activity.objeto_id }}</span>
            </div>
            <p v-if="activity.detalhes" class="text-sm text-muted-foreground line-clamp-2">
              {{ activity.detalhes }}
            </p>
            <p class="text-xs text-muted-foreground mt-1">{{ formatDate(activity.data) }}</p>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import type { UserActivityDetail } from '~/types/contabilidade'

defineProps<{
  activities: UserActivityDetail[]
  title?: string
  loading?: boolean
}>()

function dotColor(acao: string) {
  if (acao === 'Criação') return 'bg-green-500 dark:bg-green-400'
  if (acao === 'Remoção') return 'bg-destructive'
  if (acao === 'Atualização') return 'bg-primary'
  return 'bg-muted-foreground'
}

function badgeVariant(acao: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (acao === 'Criação') return 'default'
  if (acao === 'Remoção') return 'destructive'
  return 'secondary'
}

function formatDate(date: string) {
  return new Date(date).toLocaleString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>
