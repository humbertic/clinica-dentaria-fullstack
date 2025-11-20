<template>
  <div class="contabilidade-dashboard p-6 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Dashboard de Contabilidade</h1>
        <p class="mt-1 text-sm text-gray-600">
          Visão geral das operações e atividades do sistema
        </p>
      </div>

      <!-- Date range filter -->
      <div class="flex items-center space-x-4">
        <div class="flex items-center space-x-2">
          <label class="text-sm text-gray-700">De:</label>
          <input
            v-model="filters.data_inicio"
            type="date"
            class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div class="flex items-center space-x-2">
          <label class="text-sm text-gray-700">Até:</label>
          <input
            v-model="filters.data_fim"
            type="date"
            class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          @click="loadDashboard"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Atualizar
        </button>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p class="mt-4 text-gray-600">Carregando dados...</p>
    </div>

    <template v-else-if="dashboard">
      <!-- Quick Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Operações"
          :value="dashboard.total_operacoes"
          subtitle="No período selecionado"
          icon-bg-class="bg-blue-100"
          icon-color="text-blue-600"
        />

        <StatCard
          title="Operações Financeiras"
          :value="totalFinancialOps"
          subtitle="Faturas, pagamentos, orçamentos"
          icon-bg-class="bg-green-100"
          icon-color="text-green-600"
        />

        <StatCard
          title="Utilizadores Ativos"
          :value="dashboard.top_utilizadores.length"
          subtitle="Usuários com atividade"
          icon-bg-class="bg-purple-100"
          icon-color="text-purple-600"
        />

        <StatCard
          title="Criações"
          :value="dashboard.por_acao['Criação'] || 0"
          subtitle="Novos registros criados"
          icon-bg-class="bg-orange-100"
          icon-color="text-orange-600"
        />
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Operations by Type -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Operações por Tipo</h3>
          <div class="space-y-3">
            <div
              v-for="(count, acao) in dashboard.por_acao"
              :key="acao"
              class="flex items-center justify-between"
            >
              <div class="flex items-center space-x-3">
                <div
                  class="w-3 h-3 rounded-full"
                  :class="getActionColor(acao)"
                ></div>
                <span class="text-sm text-gray-700">{{ acao }}</span>
              </div>
              <div class="flex items-center space-x-3">
                <span class="text-sm font-semibold text-gray-900">{{ count }}</span>
                <div class="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    class="h-2 rounded-full"
                    :class="getActionColor(acao)"
                    :style="{ width: `${(count / dashboard.total_operacoes) * 100}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Operations by Module -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Operações por Módulo</h3>
          <div class="space-y-3">
            <div
              v-for="(count, modulo) in topModules"
              :key="modulo"
              class="flex items-center justify-between"
            >
              <div class="flex items-center space-x-3">
                <div class="w-3 h-3 rounded-full bg-blue-500"></div>
                <span class="text-sm text-gray-700">{{ modulo }}</span>
              </div>
              <div class="flex items-center space-x-3">
                <span class="text-sm font-semibold text-gray-900">{{ count }}</span>
                <div class="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    class="bg-blue-500 h-2 rounded-full"
                    :style="{ width: `${(count / dashboard.total_operacoes) * 100}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Users and Recent Activity -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Top Users -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Utilizadores Mais Ativos</h3>
          <div class="space-y-3">
            <div
              v-for="(user, index) in dashboard.top_utilizadores.slice(0, 10)"
              :key="user.id"
              class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              @click="navigateTo(`/contabilidade/utilizador/${user.id}`)"
            >
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span class="text-sm font-medium text-blue-600">{{ index + 1 }}</span>
                </div>
                <span class="text-sm font-medium text-gray-900">{{ user.nome }}</span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="text-sm font-semibold text-gray-900">{{ user.count }}</span>
                <span class="text-xs text-gray-500">operações</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <ActivityTimeline
          :activities="dashboard.atividades_recentes"
          title="Atividades Recentes"
          show-view-more
          @view-more="navigateTo('/contabilidade/atividades')"
        />
      </div>

      <!-- Financial Operations Summary -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Operações Financeiras</h3>
          <button
            @click="navigateTo('/contabilidade/financeiro')"
            class="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Ver detalhes →
          </button>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div
            v-for="(count, tipo) in dashboard.operacoes_financeiras"
            :key="tipo"
            class="p-4 bg-gray-50 rounded-lg"
          >
            <p class="text-xs text-gray-600 uppercase tracking-wider">{{ tipo }}</p>
            <p class="mt-1 text-2xl font-bold text-gray-900">{{ count }}</p>
          </div>
        </div>
      </div>

      <!-- Quick Links -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <NuxtLink
          to="/contabilidade/financeiro"
          class="p-6 bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-md hover:shadow-lg transition-shadow text-white"
        >
          <h4 class="text-lg font-semibold">Relatório Financeiro</h4>
          <p class="mt-2 text-sm text-green-100">Faturas, pagamentos e orçamentos</p>
          <p class="mt-4 text-sm font-medium">Ver relatório →</p>
        </NuxtLink>

        <NuxtLink
          to="/contabilidade/modulos"
          class="p-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md hover:shadow-lg transition-shadow text-white"
        >
          <h4 class="text-lg font-semibold">Análise por Módulo</h4>
          <p class="mt-2 text-sm text-blue-100">Detalhes de cada seção do sistema</p>
          <p class="mt-4 text-sm font-medium">Ver análise →</p>
        </NuxtLink>

        <NuxtLink
          to="/contabilidade/timeline"
          class="p-6 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-md hover:shadow-lg transition-shadow text-white"
        >
          <h4 class="text-lg font-semibold">Timeline de Atividades</h4>
          <p class="mt-2 text-sm text-purple-100">Linha do tempo completa</p>
          <p class="mt-4 text-sm font-medium">Ver timeline →</p>
        </NuxtLink>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { OperationsSummary } from '~/types/contabilidade'

definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

const { getDashboard } = useContabilidade()

// Filters
const filters = ref({
  data_inicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  data_fim: new Date().toISOString().split('T')[0]
})

// Data
const dashboard = ref<OperationsSummary | null>(null)
const loading = ref(true)

// Computed
const totalFinancialOps = computed(() => {
  if (!dashboard.value) return 0
  return Object.values(dashboard.value.operacoes_financeiras).reduce((a, b) => a + b, 0)
})

const topModules = computed(() => {
  if (!dashboard.value) return {}
  const sorted = Object.entries(dashboard.value.por_objeto)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
  return Object.fromEntries(sorted)
})

// Methods
const loadDashboard = async () => {
  loading.value = true
  try {
    dashboard.value = await getDashboard({
      data_inicio: filters.value.data_inicio,
      data_fim: filters.value.data_fim
    })
  } catch (error) {
    console.error('Error loading dashboard:', error)
  } finally {
    loading.value = false
  }
}

const getActionColor = (acao: string) => {
  const colors: Record<string, string> = {
    'Criação': 'bg-green-500',
    'Atualização': 'bg-blue-500',
    'Remoção': 'bg-red-500'
  }
  return colors[acao] || 'bg-gray-400'
}

// Load on mount
onMounted(() => {
  loadDashboard()
})
</script>

<style scoped>
.contabilidade-dashboard {
  max-width: 1400px;
  margin: 0 auto;
}
</style>
