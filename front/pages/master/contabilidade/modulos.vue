<script setup lang="ts">
import {
  BarChart2,
  Users,
  TrendingUp,
  Activity,
  FileText,
  ArrowLeft,
} from "lucide-vue-next";

import { useToast } from "@/components/ui/toast";
import { useContabilidade } from "@/composables/useContabilidade";
import type { ModuleSummary } from "@/types/contabilidade";


const { toast } = useToast();
const { getModuleSummary, loading, error } = useContabilidade();

const availableModules = [
  "Fatura",
  "Marcação",
  "Orçamento",
  "CaixaSession",
  "Paciente",
  "Utilizador",
  "Perfil",
  "Mensagem",
  "CashierPayment",
  "Parcela",
];

const selectedModule = ref("Fatura");
const moduleData = ref<ModuleSummary | null>(null);

function getActionBadgeClass(acao: string) {
  const classes: Record<string, string> = {
    Criação: "bg-green-100 text-green-800",
    Atualização: "bg-blue-100 text-blue-800",
    Remoção: "bg-red-100 text-red-800",
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

async function selectModule(modulo: string) {
  selectedModule.value = modulo;
  await loadModuleData();
}

async function loadModuleData() {
  try {
    const result = await getModuleSummary(selectedModule.value);
    moduleData.value = result;
  } catch (err) {
    toast({
      title: "Erro",
      description: error.value || "Erro ao carregar dados do módulo",
      variant: "destructive",
    });
  }
}

onMounted(() => {
  loadModuleData();
});
</script>

<template>
  <div class="flex flex-col gap-8 p-6 max-w-screen-xl mx-auto w-full">
    <!-- Header -->
    <div class="sticky top-0 z-10 bg-background pt-2 pb-4 border-b">
      <Button
        variant="ghost"
        size="sm"
        @click="navigateTo('/master/contabilidade')"
        class="mb-2"
      >
        <ArrowLeft class="h-4 w-4 mr-2" />
        Voltar ao Dashboard
      </Button>
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">Análise por Módulo</h1>
          <p class="text-sm text-muted-foreground">
            Detalhes de operações em cada seção do sistema
          </p>
        </div>
      </div>
    </div>

    <!-- Module Selector -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <BarChart2 class="h-5 w-5" />
          Selecionar Módulo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          <Button
            v-for="modulo in availableModules"
            :key="modulo"
            @click="selectModule(modulo)"
            :variant="selectedModule === modulo ? 'default' : 'outline'"
            class="justify-start"
          >
            {{ modulo }}
          </Button>
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

    <!-- Module Details -->
    <template v-else-if="moduleData">
      <!-- Module Header -->
      <Card class="bg-primary text-primary-foreground">
        <CardHeader>
          <CardTitle class="text-2xl">{{ moduleData.modulo }}</CardTitle>
          <p class="text-sm opacity-90">Análise detalhada de operações</p>
        </CardHeader>
      </Card>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">Total de Operações</CardTitle>
            <Activity class="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">{{ moduleData.total_operacoes }}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">Criações</CardTitle>
            <TrendingUp class="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold text-green-600">{{ moduleData.criacoes }}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">Atualizações</CardTitle>
            <Activity class="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold text-blue-600">{{ moduleData.atualizacoes }}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">Remoções</CardTitle>
            <TrendingUp class="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold text-red-600">{{ moduleData.remocoes }}</div>
          </CardContent>
        </Card>
      </div>

      <!-- Distribution Chart -->
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Operações</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-6">
            <!-- Creations -->
            <div>
              <div class="flex justify-between text-sm mb-2">
                <span class="font-medium">Criações</span>
                <span class="font-semibold">
                  {{ moduleData.criacoes }} ({{
                    Math.round((moduleData.criacoes / moduleData.total_operacoes) * 100)
                  }}%)
                </span>
              </div>
              <div class="w-full bg-secondary rounded-full h-3">
                <div
                  class="bg-green-500 h-3 rounded-full transition-all"
                  :style="{
                    width: `${(moduleData.criacoes / moduleData.total_operacoes) * 100}%`,
                  }"
                ></div>
              </div>
            </div>

            <!-- Updates -->
            <div>
              <div class="flex justify-between text-sm mb-2">
                <span class="font-medium">Atualizações</span>
                <span class="font-semibold">
                  {{ moduleData.atualizacoes }} ({{
                    Math.round((moduleData.atualizacoes / moduleData.total_operacoes) * 100)
                  }}%)
                </span>
              </div>
              <div class="w-full bg-secondary rounded-full h-3">
                <div
                  class="bg-blue-500 h-3 rounded-full transition-all"
                  :style="{
                    width: `${(moduleData.atualizacoes / moduleData.total_operacoes) * 100}%`,
                  }"
                ></div>
              </div>
            </div>

            <!-- Deletions -->
            <div>
              <div class="flex justify-between text-sm mb-2">
                <span class="font-medium">Remoções</span>
                <span class="font-semibold">
                  {{ moduleData.remocoes }} ({{
                    Math.round((moduleData.remocoes / moduleData.total_operacoes) * 100)
                  }}%)
                </span>
              </div>
              <div class="w-full bg-secondary rounded-full h-3">
                <div
                  class="bg-red-500 h-3 rounded-full transition-all"
                  :style="{
                    width: `${(moduleData.remocoes / moduleData.total_operacoes) * 100}%`,
                  }"
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Top Users -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Users class="h-5 w-5" />
            Top Utilizadores em {{ moduleData.modulo }}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-2">
            <div
              v-for="(user, index) in moduleData.top_utilizadores"
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

      <!-- Recent Operations -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <FileText class="h-5 w-5" />
            Operações Recentes em {{ moduleData.modulo }}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-3">
            <div
              v-for="activity in moduleData.operacoes_recentes"
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
                <p v-if="activity.detalhes" class="text-xs text-muted-foreground mt-1">
                  {{ activity.detalhes }}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </template>
  </div>
</template>
