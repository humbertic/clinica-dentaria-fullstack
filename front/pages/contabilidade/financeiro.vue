<template>
  <div class="financial-report p-6 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <NuxtLink to="/contabilidade" class="text-sm text-blue-600 hover:text-blue-700 mb-2 inline-block">
          ← Voltar ao Dashboard
        </NuxtLink>
        <h1 class="text-3xl font-bold text-gray-900">Relatório Financeiro</h1>
        <p class="mt-1 text-sm text-gray-600">
          Análise detalhada de operações financeiras
        </p>
      </div>

      <!-- Date filters -->
      <div class="flex items-center space-x-4">
        <input
          v-model="filters.data_inicio"
          type="date"
          class="px-3 py-2 border border-gray-300 rounded-lg"
        />
        <input
          v-model="filters.data_fim"
          type="date"
          class="px-3 py-2 border border-gray-300 rounded-lg"
        />
        <button
          @click="loadData"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Atualizar
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <template v-else-if="data">
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <!-- Invoices -->
        <StatCard
          title="Faturas Criadas"
          :value="data.faturas_criadas"
          icon-bg-class="bg-blue-100"
          icon-color="text-blue-600"
        />
        <StatCard
          title="Faturas Atualizadas"
          :value="data.faturas_atualizadas"
          icon-bg-class="bg-indigo-100"
          icon-color="text-indigo-600"
        />

        <!-- Payments -->
        <StatCard
          title="Pagamentos Registrados"
          :value="data.pagamentos_registrados"
          icon-bg-class="bg-green-100"
          icon-color="text-green-600"
        />
        <StatCard
          title="Parcelas Pagas"
          :value="data.parcelas_pagas"
          icon-bg-class="bg-emerald-100"
          icon-color="text-emerald-600"
        />

        <!-- Budgets -->
        <StatCard
          title="Orçamentos Criados"
          :value="data.orcamentos_criados"
          icon-bg-class="bg-purple-100"
          icon-color="text-purple-600"
        />
        <StatCard
          title="Orçamentos Aprovados"
          :value="data.orcamentos_aprovados"
          icon-bg-class="bg-green-100"
          icon-color="text-green-600"
        />
        <StatCard
          title="Orçamentos Rejeitados"
          :value="data.orcamentos_rejeitados"
          icon-bg-class="bg-red-100"
          icon-color="text-red-600"
        />

        <!-- Approval Rate -->
        <StatCard
          title="Taxa de Aprovação"
          :value="approvalRate"
          format="percentage"
          icon-bg-class="bg-yellow-100"
          icon-color="text-yellow-600"
        />

        <!-- Cash Register -->
        <StatCard
          title="Sessões Abertas"
          :value="data.sessoes_caixa_abertas"
          icon-bg-class="bg-orange-100"
          icon-color="text-orange-600"
        />
        <StatCard
          title="Sessões Fechadas"
          :value="data.sessoes_caixa_fechadas"
          icon-bg-class="bg-gray-100"
          icon-color="text-gray-600"
        />
        <StatCard
          title="Pagamentos em Caixa"
          :value="data.pagamentos_caixa"
          icon-bg-class="bg-teal-100"
          icon-color="text-teal-600"
        />
      </div>

      <!-- Top Users Financial Operations -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">
          Operações Financeiras por Utilizador
        </h3>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  #
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilizador
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Operações
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  % do Total
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="(user, index) in data.operacoes_por_utilizador"
                :key="user.id"
                class="hover:bg-gray-50"
              >
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ index + 1 }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span class="text-sm font-medium text-blue-600">
                        {{ user.nome.charAt(0).toUpperCase() }}
                      </span>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ user.nome }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-900">
                  {{ user.count }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                  {{ Math.round((user.count / totalOps) * 100) }}%
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <NuxtLink
                    :to="`/contabilidade/utilizador/${user.id}`"
                    class="text-blue-600 hover:text-blue-900"
                  >
                    Ver detalhes
                  </NuxtLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Summary Stats -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Invoice Summary -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h4 class="text-md font-semibold text-gray-900 mb-4">Resumo de Faturas</h4>
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Total Criadas:</span>
              <span class="text-sm font-semibold text-gray-900">{{ data.faturas_criadas }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Total Atualizadas:</span>
              <span class="text-sm font-semibold text-gray-900">{{ data.faturas_atualizadas }}</span>
            </div>
            <div class="flex justify-between items-center pt-3 border-t">
              <span class="text-sm font-medium text-gray-900">Total Operações:</span>
              <span class="text-lg font-bold text-blue-600">
                {{ data.faturas_criadas + data.faturas_atualizadas }}
              </span>
            </div>
          </div>
        </div>

        <!-- Budget Summary -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h4 class="text-md font-semibold text-gray-900 mb-4">Resumo de Orçamentos</h4>
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Criados:</span>
              <span class="text-sm font-semibold text-gray-900">{{ data.orcamentos_criados }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Aprovados:</span>
              <span class="text-sm font-semibold text-green-600">{{ data.orcamentos_aprovados }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Rejeitados:</span>
              <span class="text-sm font-semibold text-red-600">{{ data.orcamentos_rejeitados }}</span>
            </div>
            <div class="flex justify-between items-center pt-3 border-t">
              <span class="text-sm font-medium text-gray-900">Taxa de Aprovação:</span>
              <span class="text-lg font-bold text-green-600">{{ approvalRate }}%</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { FinancialOperationsSummary } from '~/types/contabilidade'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const { getFinancialSummary } = useContabilidade()

const filters = ref({
  data_inicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  data_fim: new Date().toISOString().split('T')[0]
})

const data = ref<FinancialOperationsSummary | null>(null)
const loading = ref(true)

const approvalRate = computed(() => {
  if (!data.value) return 0
  const total = data.value.orcamentos_aprovados + data.value.orcamentos_rejeitados
  if (total === 0) return 0
  return Math.round((data.value.orcamentos_aprovados / total) * 100)
})

const totalOps = computed(() => {
  if (!data.value) return 0
  return data.value.operacoes_por_utilizador.reduce((sum, u) => sum + u.count, 0)
})

const loadData = async () => {
  loading.value = true
  try {
    data.value = await getFinancialSummary({
      data_inicio: filters.value.data_inicio,
      data_fim: filters.value.data_fim
    })
  } catch (error) {
    console.error('Error loading financial data:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>
