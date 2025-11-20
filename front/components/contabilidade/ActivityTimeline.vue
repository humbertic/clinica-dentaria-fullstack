<template>
  <div class="activity-timeline bg-white rounded-lg shadow-md p-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ title }}</h3>

    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p class="mt-2 text-sm text-gray-600">Carregando...</p>
    </div>

    <div v-else-if="activities.length === 0" class="text-center py-8 text-gray-500">
      <p>Nenhuma atividade encontrada</p>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="activity in activities"
        :key="activity.id"
        class="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <!-- Icon based on action type -->
        <div class="flex-shrink-0">
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
            :class="getActionColor(activity.acao)"
          >
            {{ getActionIcon(activity.acao) }}
          </div>
        </div>

        <!-- Activity details -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between">
            <p class="text-sm font-medium text-gray-900">
              {{ activity.utilizador_nome }}
            </p>
            <p class="text-xs text-gray-500">
              {{ formatDate(activity.data) }}
            </p>
          </div>
          <p class="text-sm text-gray-600 mt-1">
            <span class="font-medium">{{ activity.acao }}</span> de
            <span class="font-medium">{{ activity.objeto }}</span>
            <span v-if="activity.objeto_id"> #{{ activity.objeto_id }}</span>
          </p>
          <p v-if="activity.detalhes" class="text-xs text-gray-500 mt-1">
            {{ activity.detalhes }}
          </p>
        </div>
      </div>
    </div>

    <div v-if="showViewMore && activities.length > 0" class="mt-4 text-center">
      <button
        @click="$emit('view-more')"
        class="text-sm text-blue-600 hover:text-blue-700 font-medium"
      >
        Ver mais →
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UserActivityDetail } from '~/types/contabilidade'

interface Props {
  activities: UserActivityDetail[]
  title?: string
  loading?: boolean
  showViewMore?: boolean
}

withDefaults(defineProps<Props>(), {
  title: 'Atividades Recentes',
  loading: false,
  showViewMore: false
})

defineEmits<{
  'view-more': []
}>()

const getActionColor = (acao: string) => {
  const colors: Record<string, string> = {
    'Criação': 'bg-green-500',
    'Atualização': 'bg-blue-500',
    'Remoção': 'bg-red-500',
    'Login': 'bg-purple-500',
    'Logout': 'bg-gray-500'
  }
  return colors[acao] || 'bg-gray-400'
}

const getActionIcon = (acao: string) => {
  const icons: Record<string, string> = {
    'Criação': '+',
    'Atualização': '✎',
    'Remoção': '×',
    'Login': '→',
    'Logout': '←'
  }
  return icons[acao] || '•'
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return 'agora'
  if (diffMins < 60) return `há ${diffMins}m`
  if (diffMins < 1440) return `há ${Math.floor(diffMins / 60)}h`

  return new Intl.DateTimeFormat('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}
</script>
