<template>
  <div class="user-activity p-6 space-y-6">
    <!-- Header -->
    <div>
      <NuxtLink to="/contabilidade" class="text-sm text-blue-600 hover:text-blue-700 mb-2 inline-block">
        ← Voltar ao Dashboard
      </NuxtLink>
      <h1 class="text-3xl font-bold text-gray-900">Atividade do Utilizador</h1>
      <p v-if="summary" class="mt-1 text-lg text-gray-600">
        {{ summary.utilizador_nome }}
      </p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <template v-else-if="summary">
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total de Ações"
          :value="summary.total_acoes"
          icon-bg-class="bg-blue-100"
          icon-color="text-blue-600"
        />
        <StatCard
          title="Criações"
          :value="summary.acoes_por_tipo['Criação'] || 0"
          icon-bg-class="bg-green-100"
          icon-color="text-green-600"
        />
        <StatCard
          title="Atualizações"
          :value="summary.acoes_por_tipo['Atualização'] || 0"
          icon-bg-class="bg-blue-100"
          icon-color="text-blue-600"
        />
        <StatCard
          title="Remoções"
          :value="summary.acoes_por_tipo['Remoção'] || 0"
          icon-bg-class="bg-red-100"
          icon-color="text-red-600"
        />
      </div>

      <!-- Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Actions by Type -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Ações por Tipo</h3>
          <div class="space-y-3">
            <div
              v-for="(count, tipo) in summary.acoes_por_tipo"
              :key="tipo"
              class="flex items-center justify-between"
            >
              <span class="text-sm text-gray-700">{{ tipo }}</span>
              <div class="flex items-center space-x-3">
                <span class="text-sm font-semibold text-gray-900">{{ count }}</span>
                <div class="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    class="bg-blue-500 h-2 rounded-full"
                    :style="{ width: `${(count / summary.total_acoes) * 100}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Objects Modified -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Objetos Modificados</h3>
          <div class="space-y-3">
            <div
              v-for="(count, objeto) in topObjects"
              :key="objeto"
              class="flex items-center justify-between"
            >
              <span class="text-sm text-gray-700">{{ objeto }}</span>
              <div class="flex items-center space-x-3">
                <span class="text-sm font-semibold text-gray-900">{{ count }}</span>
                <div class="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    class="bg-green-500 h-2 rounded-full"
                    :style="{ width: `${(count / summary.total_acoes) * 100}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters for detail view -->
      <div class="bg-white rounded-lg shadow-md p-4">
        <div class="flex items-center space-x-4">
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
            <input
              v-model="filters.data_inicio"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
            <input
              v-model="filters.data_fim"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">Módulo</label>
            <select
              v-model="filters.modulo"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Todos</option>
              <option v-for="modulo in availableModules" :key="modulo" :value="modulo">
                {{ modulo }}
              </option>
            </select>
          </div>
          <div class="flex items-end">
            <button
              @click="loadDetails"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Filtrar
            </button>
          </div>
        </div>
      </div>

      <!-- Activity Details -->
      <ActivityTimeline
        :activities="details"
        title="Histórico Detalhado de Atividades"
        :loading="detailsLoading"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import type { UserActivitySummary, UserActivityDetail } from '~/types/contabilidade'

definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

const route = useRoute()
const { getUserSummary, getUserDetails } = useContabilidade()

const userId = computed(() => parseInt(route.params.id as string))

const summary = ref<UserActivitySummary | null>(null)
const details = ref<UserActivityDetail[]>([])
const loading = ref(true)
const detailsLoading = ref(false)

const filters = ref({
  data_inicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  data_fim: new Date().toISOString().split('T')[0],
  modulo: ''
})

const topObjects = computed(() => {
  if (!summary.value) return {}
  return Object.fromEntries(
    Object.entries(summary.value.objetos_modificados)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
  )
})

const availableModules = computed(() => {
  if (!summary.value) return []
  return Object.keys(summary.value.objetos_modificados).sort()
})

const loadSummary = async () => {
  loading.value = true
  try {
    summary.value = await getUserSummary(userId.value, {
      data_inicio: filters.value.data_inicio,
      data_fim: filters.value.data_fim
    })
  } catch (error) {
    console.error('Error loading user summary:', error)
  } finally {
    loading.value = false
  }
}

const loadDetails = async () => {
  detailsLoading.value = true
  try {
    details.value = await getUserDetails(userId.value, {
      data_inicio: filters.value.data_inicio,
      data_fim: filters.value.data_fim,
      modulo: filters.value.modulo || undefined,
      limit: 100
    })
  } catch (error) {
    console.error('Error loading user details:', error)
  } finally {
    detailsLoading.value = false
  }
}

onMounted(async () => {
  await loadSummary()
  await loadDetails()
})
</script>
