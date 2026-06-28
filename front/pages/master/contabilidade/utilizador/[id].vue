<template>
  <div class="user-activity p-6 space-y-6">
    <!-- Header -->
    <div>
      <Button variant="link" as-child class="mb-2 h-auto p-0 text-sm">
        <NuxtLink to="/master/contabilidade">← Voltar ao Dashboard</NuxtLink>
      </Button>
      <h1 class="text-3xl font-bold text-foreground">Atividade do Utilizador</h1>
      <p v-if="summary" class="mt-1 text-lg text-muted-foreground">
        {{ summary.utilizador_nome }}
      </p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      <Skeleton v-for="i in 4" :key="i" class="h-28 rounded-lg" />
    </div>

    <template v-else-if="summary">
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <ContabilidadeStatCard
          title="Total de Ações"
          :value="summary.total_acoes"
          icon-bg-class="bg-primary/10"
          icon-color="text-primary"
        />
        <ContabilidadeStatCard
          title="Criações"
          :value="summary.acoes_por_tipo['Criação'] || 0"
          icon-bg-class="bg-green-500/10"
          icon-color="text-green-600 dark:text-green-400"
        />
        <ContabilidadeStatCard
          title="Atualizações"
          :value="summary.acoes_por_tipo['Atualização'] || 0"
          icon-bg-class="bg-primary/10"
          icon-color="text-primary"
        />
        <ContabilidadeStatCard
          title="Remoções"
          :value="summary.acoes_por_tipo['Remoção'] || 0"
          icon-bg-class="bg-destructive/10"
          icon-color="text-destructive"
        />
      </div>

      <!-- Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Actions by Type -->
        <Card>
          <CardHeader>
            <CardTitle class="text-lg">Ações por Tipo</CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <div
              v-for="(count, tipo) in summary.acoes_por_tipo"
              :key="tipo"
              class="flex items-center justify-between"
            >
              <span class="text-sm text-muted-foreground">{{ tipo }}</span>
              <div class="flex items-center space-x-3">
                <span class="text-sm font-semibold text-foreground">{{ count }}</span>
                <div class="w-32 bg-muted rounded-full h-2">
                  <div
                    class="bg-primary h-2 rounded-full"
                    :style="{ width: `${(count / summary.total_acoes) * 100}%` }"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Objects Modified -->
        <Card>
          <CardHeader>
            <CardTitle class="text-lg">Objetos Modificados</CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <div
              v-for="(count, objeto) in topObjects"
              :key="objeto"
              class="flex items-center justify-between"
            >
              <span class="text-sm text-muted-foreground">{{ objeto }}</span>
              <div class="flex items-center space-x-3">
                <span class="text-sm font-semibold text-foreground">{{ count }}</span>
                <div class="w-32 bg-muted rounded-full h-2">
                  <div
                    class="bg-green-500 dark:bg-green-400 h-2 rounded-full"
                    :style="{ width: `${(count / summary.total_acoes) * 100}%` }"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Filters for detail view -->
      <Card>
        <CardContent class="pt-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="space-y-1">
              <Label for="data-inicio">Data Início</Label>
              <Input id="data-inicio" v-model="filters.data_inicio" type="date" />
            </div>
            <div class="space-y-1">
              <Label for="data-fim">Data Fim</Label>
              <Input id="data-fim" v-model="filters.data_fim" type="date" />
            </div>
            <div class="space-y-1">
              <Label for="modulo">Módulo</Label>
              <Select v-model="filters.modulo">
                <SelectTrigger id="modulo">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="modulo in availableModules" :key="modulo" :value="modulo">
                    {{ modulo }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="flex items-end">
              <Button class="w-full" @click="loadDetails">Filtrar</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Activity Details -->
      <ContabilidadeActivityTimeline
        :activities="details"
        title="Histórico Detalhado de Atividades"
        :loading="detailsLoading"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import type { UserActivitySummary, UserActivityDetail } from '~/types/contabilidade'



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
    }) ?? []
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
