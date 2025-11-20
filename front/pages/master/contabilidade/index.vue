<script setup lang="ts">
import {
  Calendar,
  TrendingUp,
  Users,
  FileText,
  Activity,
  BarChart2,
  DollarSign,
  Filter,
} from "lucide-vue-next";

import { useToast } from "@/components/ui/toast";
import { useContabilidade } from "@/composables/useContabilidade";
import type { OperationsSummary } from "@/types/contabilidade";

definePageMeta({
  middleware: "auth",
  layout: "default",
});

const { toast } = useToast();
const { getDashboard, loading, error } = useContabilidade();

// Filters
const filters = ref({
  data_inicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0],
  data_fim: new Date().toISOString().split("T")[0],
});

// Data
const dashboard = ref<OperationsSummary | null>(null);

// Computed
const totalFinancialOps = computed(() => {
  if (!dashboard.value) return 0;
  return Object.values(dashboard.value.operacoes_financeiras).reduce(
    (a, b) => a + b,
    0
  );
});

const topModules = computed(() => {
  if (!dashboard.value) return [];
  return Object.entries(dashboard.value.por_objeto)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);
});

const topActions = computed(() => {
  if (!dashboard.value) return [];
  return Object.entries(dashboard.value.por_acao).sort(
    ([, a], [, b]) => b - a
  );
});

// Methods
async function loadDashboard() {
  try {
    const result = await getDashboard({
      data_inicio: filters.value.data_inicio,
      data_fim: filters.value.data_fim,
    });
    dashboard.value = result;
  } catch (err) {
    toast({
      title: "Erro",
      description: error.value || "Erro ao carregar dashboard",
      variant: "destructive",
    });
  }
}

function getActionBadgeClass(acao: string) {
  const classes: Record<string, string> = {
    Criação: "bg-green-100 text-green-800",
    Atualização: "bg-blue-100 text-blue-800",
    Remoção: "bg-red-100 text-red-800",
    Login: "bg-purple-100 text-purple-800",
    Logout: "bg-gray-100 text-gray-800",
  };
  return classes[acao] || "bg-gray-100 text-gray-800";
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

// Load on mount
onMounted(() => {
  loadDashboard();
});
</script>

<template>
  <div class="flex flex-col gap-8 p-6 max-w-screen-xl mx-auto w-full">
    <!-- Header -->
    <div class="sticky top-0 z-10 bg-background pt-2 pb-4 border-b">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">Dashboard de Contabilidade</h1>
          <p class="text-sm text-muted-foreground">
            Visão geral das operações e atividades do sistema
          </p>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <Filter class="h-5 w-5" />
          Período
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label for="data-inicio">Data Início</Label>
            <Input id="data-inicio" v-model="filters.data_inicio" type="date" />
          </div>
          <div>
            <Label for="data-fim">Data Fim</Label>
            <Input id="data-fim" v-model="filters.data_fim" type="date" />
          </div>
          <div class="flex items-end">
            <Button @click="loadDashboard" :disabled="loading" class="w-full">
              Atualizar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <!-- Error State -->
    <Alert v-else-if="error" variant="destructive">
      <AlertTitle>Erro</AlertTitle>
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>

    <!-- Dashboard Content -->
    <template v-else-if="dashboard">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">Total de Operações</CardTitle>
            <Activity class="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">{{ dashboard.total_operacoes }}</div>
            <p class="text-xs text-muted-foreground">No período selecionado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">Operações Financeiras</CardTitle>
            <DollarSign class="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">{{ totalFinancialOps }}</div>
            <p class="text-xs text-muted-foreground">Faturas, pagamentos, orçamentos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">Utilizadores Ativos</CardTitle>
            <Users class="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">{{ dashboard.top_utilizadores.length }}</div>
            <p class="text-xs text-muted-foreground">Usuários com atividade</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">Criações</CardTitle>
            <FileText class="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">{{ dashboard.por_acao['Criação'] || 0 }}</div>
            <p class="text-xs text-muted-foreground">Novos registros criados</p>
          </CardContent>
        </Card>
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Operations by Action -->
        <Card>
          <CardHeader>
            <CardTitle>Operações por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div
                v-for="[acao, count] in topActions"
                :key="acao"
                class="flex items-center justify-between"
              >
                <div class="flex items-center gap-2">
                  <Badge :class="getActionBadgeClass(acao)">{{ acao }}</Badge>
                </div>
                <div class="flex items-center gap-3">
                  <span class="text-sm font-semibold">{{ count }}</span>
                  <div class="w-32 bg-secondary rounded-full h-2">
                    <div
                      class="bg-primary h-2 rounded-full"
                      :style="{ width: `${(count / dashboard.total_operacoes) * 100}%` }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Operations by Module -->
        <Card>
          <CardHeader>
            <CardTitle>Operações por Módulo</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div
                v-for="[modulo, count] in topModules"
                :key="modulo"
                class="flex items-center justify-between"
              >
                <span class="text-sm text-muted-foreground">{{ modulo }}</span>
                <div class="flex items-center gap-3">
                  <span class="text-sm font-semibold">{{ count }}</span>
                  <div class="w-32 bg-secondary rounded-full h-2">
                    <div
                      class="bg-primary h-2 rounded-full"
                      :style="{ width: `${(count / dashboard.total_operacoes) * 100}%` }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Top Users and Recent Activity -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Top Users -->
        <Card>
          <CardHeader>
            <CardTitle>Utilizadores Mais Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-2">
              <div
                v-for="(user, index) in dashboard.top_utilizadores.slice(0, 10)"
                :key="user.id"
                class="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer"
                @click="navigateTo(`/master/contabilidade/utilizador/${user.id}`)"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"
                  >
                    <span class="text-sm font-medium text-primary">{{ index + 1 }}</span>
                  </div>
                  <span class="text-sm font-medium">{{ user.nome }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-sm font-semibold">{{ user.count }}</span>
                  <span class="text-xs text-muted-foreground">operações</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Recent Activity -->
        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-3">
              <div
                v-for="activity in dashboard.atividades_recentes.slice(0, 10)"
                :key="activity.id"
                class="flex items-start gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
              >
                <div class="flex-shrink-0">
                  <Badge :class="getActionBadgeClass(activity.acao)" class="text-xs">
                    {{ activity.acao.substring(0, 1) }}
                  </Badge>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between">
                    <p class="text-sm font-medium truncate">{{ activity.utilizador_nome }}</p>
                    <p class="text-xs text-muted-foreground">
                      {{ formatDate(activity.data) }}
                    </p>
                  </div>
                  <p class="text-sm text-muted-foreground mt-1">
                    {{ activity.acao }} de {{ activity.objeto }}
                    <span v-if="activity.objeto_id">#{{ activity.objeto_id }}</span>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Financial Operations Summary -->
      <Card>
        <CardHeader>
          <div class="flex items-center justify-between">
            <CardTitle>Operações Financeiras</CardTitle>
            <Button variant="ghost" size="sm" @click="navigateTo('/master/contabilidade/financeiro')">
              Ver detalhes →
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div
              v-for="(count, tipo) in dashboard.operacoes_financeiras"
              :key="tipo"
              class="p-4 bg-accent rounded-lg"
            >
              <p class="text-xs text-muted-foreground uppercase tracking-wider">{{ tipo }}</p>
              <p class="mt-1 text-2xl font-bold">{{ count }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Quick Links -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card class="cursor-pointer hover:shadow-lg transition-shadow"  @click="navigateTo('/master/contabilidade/financeiro')">
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <DollarSign class="h-5 w-5" />
              Relatório Financeiro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-sm text-muted-foreground">Faturas, pagamentos e orçamentos</p>
          </CardContent>
        </Card>

        <Card class="cursor-pointer hover:shadow-lg transition-shadow" @click="navigateTo('/master/contabilidade/modulos')">
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <BarChart2 class="h-5 w-5" />
              Análise por Módulo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-sm text-muted-foreground">Detalhes de cada seção do sistema</p>
          </CardContent>
        </Card>

        <Card class="cursor-pointer hover:shadow-lg transition-shadow" @click="navigateTo('/master/historico')">
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Activity class="h-5 w-5" />
              Histórico Completo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-sm text-muted-foreground">Auditoria completa do sistema</p>
          </CardContent>
        </Card>
      </div>
    </template>

    <!-- Empty State -->
    <Card v-else>
      <CardContent class="text-center py-12">
        <FileText class="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p class="text-muted-foreground">Nenhum dado encontrado para o período selecionado</p>
        <p class="text-sm text-muted-foreground mt-2">Tente ajustar os filtros</p>
      </CardContent>
    </Card>
  </div>
</template>
