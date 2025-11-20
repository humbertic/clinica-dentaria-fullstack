<script setup lang="ts">
import {
  DollarSign,
  Receipt,
  CreditCard,
  TrendingUp,
  Users,
  Filter,
  ArrowLeft,
} from "lucide-vue-next";

import { useToast } from "@/components/ui/toast";
import { useContabilidade } from "@/composables/useContabilidade";
import type { FinancialOperationsSummary } from "@/types/contabilidade";

definePageMeta({
  middleware: "auth",
  layout: "dashboard",
});

const { toast } = useToast();
const { getFinancialSummary, loading, error } = useContabilidade();

const filters = ref({
  data_inicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0],
  data_fim: new Date().toISOString().split("T")[0],
});

const data = ref<FinancialOperationsSummary | null>(null);

const approvalRate = computed(() => {
  if (!data.value) return 0;
  const total =
    data.value.orcamentos_aprovados + data.value.orcamentos_rejeitados;
  if (total === 0) return 0;
  return Math.round((data.value.orcamentos_aprovados / total) * 100);
});

const totalOps = computed(() => {
  if (!data.value) return 0;
  return data.value.operacoes_por_utilizador.reduce(
    (sum, u) => sum + u.count,
    0
  );
});

async function loadData() {
  try {
    const result = await getFinancialSummary({
      data_inicio: filters.value.data_inicio,
      data_fim: filters.value.data_fim,
    });
    data.value = result;
  } catch (err) {
    toast({
      title: "Erro",
      description: error.value || "Erro ao carregar dados financeiros",
      variant: "destructive",
    });
  }
}

onMounted(() => {
  loadData();
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
          <h1 class="text-2xl font-bold tracking-tight">Relatório Financeiro</h1>
          <p class="text-sm text-muted-foreground">
            Análise detalhada de operações financeiras
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
            <Button @click="loadData" :disabled="loading" class="w-full">
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

    <!-- Financial Report Content -->
    <template v-else-if="data">
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Invoices -->
        <Card>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">Faturas Criadas</CardTitle>
            <Receipt class="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">{{ data.faturas_criadas }}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">Faturas Atualizadas</CardTitle>
            <Receipt class="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">{{ data.faturas_atualizadas }}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">Pagamentos Registrados</CardTitle>
            <CreditCard class="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">{{ data.pagamentos_registrados }}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">Parcelas Pagas</CardTitle>
            <DollarSign class="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">{{ data.parcelas_pagas }}</div>
          </CardContent>
        </Card>

        <!-- Budgets -->
        <Card>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">Orçamentos Criados</CardTitle>
            <Receipt class="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">{{ data.orcamentos_criados }}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">Orçamentos Aprovados</CardTitle>
            <TrendingUp class="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold text-green-600">{{ data.orcamentos_aprovados }}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">Orçamentos Rejeitados</CardTitle>
            <Receipt class="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold text-red-600">{{ data.orcamentos_rejeitados }}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">Taxa de Aprovação</CardTitle>
            <TrendingUp class="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold text-blue-600">{{ approvalRate }}%</div>
          </CardContent>
        </Card>

        <!-- Cash Register -->
        <Card>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">Sessões Abertas</CardTitle>
            <DollarSign class="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">{{ data.sessoes_caixa_abertas }}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">Sessões Fechadas</CardTitle>
            <DollarSign class="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">{{ data.sessoes_caixa_fechadas }}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">Pagamentos em Caixa</CardTitle>
            <CreditCard class="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">{{ data.pagamentos_caixa }}</div>
          </CardContent>
        </Card>
      </div>

      <!-- Top Users Table -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Users class="h-5 w-5" />
            Operações Financeiras por Utilizador
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead class="w-12">#</TableHead>
                <TableHead>Utilizador</TableHead>
                <TableHead class="text-right">Operações</TableHead>
                <TableHead class="text-right">% do Total</TableHead>
                <TableHead class="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="(user, index) in data.operacoes_por_utilizador" :key="user.id">
                <TableCell class="font-medium">{{ index + 1 }}</TableCell>
                <TableCell>
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span class="text-xs font-medium text-primary">
                        {{ user.nome.charAt(0).toUpperCase() }}
                      </span>
                    </div>
                    <span class="font-medium">{{ user.nome }}</span>
                  </div>
                </TableCell>
                <TableCell class="text-right font-semibold">{{ user.count }}</TableCell>
                <TableCell class="text-right text-muted-foreground">
                  {{ Math.round((user.count / totalOps) * 100) }}%
                </TableCell>
                <TableCell class="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    @click="navigateTo(`/master/contabilidade/utilizador/${user.id}`)"
                  >
                    Ver detalhes
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <!-- Summary Stats -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Invoice Summary -->
        <Card>
          <CardHeader>
            <CardTitle>Resumo de Faturas</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-sm text-muted-foreground">Total Criadas:</span>
                <span class="text-sm font-semibold">{{ data.faturas_criadas }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-muted-foreground">Total Atualizadas:</span>
                <span class="text-sm font-semibold">{{ data.faturas_atualizadas }}</span>
              </div>
              <div class="flex justify-between items-center pt-3 border-t">
                <span class="text-sm font-medium">Total Operações:</span>
                <span class="text-lg font-bold text-primary">
                  {{ data.faturas_criadas + data.faturas_atualizadas }}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Budget Summary -->
        <Card>
          <CardHeader>
            <CardTitle>Resumo de Orçamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-sm text-muted-foreground">Criados:</span>
                <span class="text-sm font-semibold">{{ data.orcamentos_criados }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-muted-foreground">Aprovados:</span>
                <span class="text-sm font-semibold text-green-600">{{ data.orcamentos_aprovados }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-muted-foreground">Rejeitados:</span>
                <span class="text-sm font-semibold text-red-600">{{ data.orcamentos_rejeitados }}</span>
              </div>
              <div class="flex justify-between items-center pt-3 border-t">
                <span class="text-sm font-medium">Taxa de Aprovação:</span>
                <span class="text-lg font-bold text-green-600">{{ approvalRate }}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </template>
  </div>
</template>
