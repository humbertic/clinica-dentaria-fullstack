<script setup lang="ts">
import { useReports } from "@/composables/useReports";

const {
  getRevenue,
  getTopServices,
  getCashShift,
  getCashShiftRange,
  getOverdue,
  getStockCritical,
} = useReports();

function toISODateLocal(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// --- Stores reativos -------------------------------------------------
const revenueDay = ref<any[]>([]);
const revenueMonth = ref<any[]>([]);
const revenueYear = ref<any[]>([]);
const cash30 = ref<any[]>([]);
const services = ref<any[]>([]);
const stockCrit = ref<any[]>([]);
const overdue = ref<any[]>([]);

onMounted(async () => {
  const today = new Date();
  const isoToday = today.toISOString().slice(0, 10);
  const firstMonth = isoToday.slice(0, 8) + "01";
  const firstYear = isoToday.slice(0, 4) + "-01-01";
  const iso30Local = toISODateLocal(new Date(today.getTime() - 29 * 864e5));

  revenueDay.value = await getRevenue(isoToday, isoToday);
  revenueMonth.value = await getRevenue(firstMonth, isoToday);
  revenueYear.value = await getRevenue(firstYear, isoToday);

  cash30.value = await getCashShiftRange(iso30Local, isoToday);
  services.value = await getTopServices(5);
  stockCrit.value = await getStockCritical();
  overdue.value = await getOverdue(90);
});

// --- Derivados --------------------------------------------------------
const kpis = computed(() => [
  { title: "Receita Hoje", value: +revenueDay.value[0]?.receita_recebida || 0 },
  {
    title: "Receita Mês",
    value: revenueMonth.value.reduce((s, r) => s + +r.receita_recebida, 0),
  },
  {
    title: "Receita Ano",
    value: revenueYear.value.reduce((s, r) => s + +r.receita_recebida, 0),
  },
]);

const cashEntries = computed(() =>
  cash30.value.map((r: any) => ({ dia: r.dia, Entradas: r.entradas }))
);

const alerts = computed(() => [
  ...overdue.value.map(
    (o: any) => `Fatura #${o.fatura_id} vencida há ${o.dias_em_atraso} dias.`
  ),
  ...stockCrit.value.map(
    (s: any) =>
      `Stock crítico: ${s.nome} (${s.quantidade_atual}/${s.quantidade_minima})`
  ),
]);
</script>

<template>
  <div class="grid 2xl:grid-cols-3 lg:grid-cols-2 gap-6 p-6">
    <DashboardKipCard
      v-for="k in kpis"
      :key="k.title"
      :title="k.title"
      :value="k.value"
    />
    <DashboardLineChart
      title="Entradas de Caixa (30 dias)"
      :data="cashEntries"
      index="dia"
      :categories="['Entradas']"
    >
      <template #actions>
        <DashboardDowloadButton format="pdf" />
      </template>
    </DashboardLineChart>
    <DashboardBarChart
      title="Top 5 Serviços"
      :data="services"
      index="servico"
      :categories="['valor_total']"
    >
      <template #actions>
        <DashboardDowloadButton format="xlsx" />
      </template>
    </DashboardBarChart>
    <DashboardStocktable :items="stockCrit">
      <template #actions><DownloadButton format="csv" /></template>
    </DashboardStocktable>
    <DashboardAlertFeed :alerts="alerts" />
  </div>
</template>
