<template>
  <div class="modules-analysis p-6 space-y-6">
    <!-- Header -->
    <div>
      <NuxtLink to="/contabilidade" class="text-sm text-blue-600 hover:text-blue-700 mb-2 inline-block">
        ← Voltar ao Dashboard
      </NuxtLink>
      <h1 class="text-3xl font-bold text-gray-900">Análise por Módulo</h1>
      <p class="mt-1 text-sm text-gray-600">
        Detalhes de operações em cada seção do sistema
      </p>
    </div>

    <!-- Module selector -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Selecionar Módulo</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <button
          v-for="modulo in availableModules"
          :key="modulo"
          @click="selectModule(modulo)"
          class="px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium"
          :class="selectedModule === modulo
            ? 'border-blue-500 bg-blue-50 text-blue-700'
            : 'border-gray-200 hover:border-gray-300 text-gray-700'"
        >
          {{ modulo }}
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Module details -->
    <template v-else-if="moduleData">
      <div class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
        <h2 class="text-2xl font-bold">{{ moduleData.modulo }}</h2>
        <p class="mt-2 text-blue-100">Análise detalhada de operações</p>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total de Operações"
          :value="moduleData.total_operacoes"
          icon-bg-class="bg-blue-100"
          icon-color="text-blue-600"
        />
        <StatCard
          title="Criações"
          :value="moduleData.criacoes"
          icon-bg-class="bg-green-100"
          icon-color="text-green-600"
        />
        <StatCard
          title="Atualizações"
          :value="moduleData.atualizacoes"
          icon-bg-class="bg-blue-100"
          icon-color="text-blue-600"
        />
        <StatCard
          title="Remoções"
          :value="moduleData.remocoes"
          icon-bg-class="bg-red-100"
          icon-color="text-red-600"
        />
      </div>

      <!-- Breakdown chart -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-6">Distribuição de Operações</h3>
        <div class="space-y-4">
          <div>
            <div class="flex justify-between text-sm mb-2">
              <span class="text-gray-700 font-medium">Criações</span>
              <span class="text-gray-900 font-semibold">
                {{ moduleData.criacoes }} ({{ Math.round((moduleData.criacoes / moduleData.total_operacoes) * 100) }}%)
              </span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div
                class="bg-green-500 h-3 rounded-full transition-all"
                :style="{ width: `${(moduleData.criacoes / moduleData.total_operacoes) * 100}%` }"
              ></div>
            </div>
          </div>

          <div>
            <div class="flex justify-between text-sm mb-2">
              <span class="text-gray-700 font-medium">Atualizações</span>
              <span class="text-gray-900 font-semibold">
                {{ moduleData.atualizacoes }} ({{ Math.round((moduleData.atualizacoes / moduleData.total_operacoes) * 100) }}%)
              </span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div
                class="bg-blue-500 h-3 rounded-full transition-all"
                :style="{ width: `${(moduleData.atualizacoes / moduleData.total_operacoes) * 100}%` }"
              ></div>
            </div>
          </div>

          <div>
            <div class="flex justify-between text-sm mb-2">
              <span class="text-gray-700 font-medium">Remoções</span>
              <span class="text-gray-900 font-semibold">
                {{ moduleData.remocoes }} ({{ Math.round((moduleData.remocoes / moduleData.total_operacoes) * 100) }}%)
              </span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div
                class="bg-red-500 h-3 rounded-full transition-all"
                :style="{ width: `${(moduleData.remocoes / moduleData.total_operacoes) * 100}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Top users in this module -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">
          Top Utilizadores em {{ moduleData.modulo }}
        </h3>
        <div class="space-y-3">
          <div
            v-for="(user, index) in moduleData.top_utilizadores"
            :key="user.id"
            class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
            @click="navigateTo(`/contabilidade/utilizador/${user.id}`)"
          >
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span class="text-sm font-medium text-blue-600">{{ index + 1 }}</span>
              </div>
              <span class="text-sm font-medium text-gray-900">{{ user.nome }}</span>
            </div>
            <span class="text-sm font-semibold text-gray-900">{{ user.count }} operações</span>
          </div>
        </div>
      </div>

      <!-- Recent operations -->
      <ActivityTimeline
        :activities="moduleData.operacoes_recentes"
        :title="`Operações Recentes em ${moduleData.modulo}`"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import type { ModuleSummary } from '~/types/contabilidade'

definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

const { getModuleSummary } = useContabilidade()

const availableModules = [
  'Fatura',
  'Marcação',
  'Orçamento',
  'CaixaSession',
  'Paciente',
  'Utilizador',
  'Perfil',
  'Mensagem',
  'CashierPayment',
  'Parcela'
]

const selectedModule = ref('Fatura')
const moduleData = ref<ModuleSummary | null>(null)
const loading = ref(false)

const selectModule = async (modulo: string) => {
  selectedModule.value = modulo
  await loadModuleData()
}

const loadModuleData = async () => {
  loading.value = true
  try {
    moduleData.value = await getModuleSummary(selectedModule.value)
  } catch (error) {
    console.error('Error loading module data:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadModuleData()
})
</script>
