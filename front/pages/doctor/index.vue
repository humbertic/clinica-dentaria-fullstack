<template>
  <div v-if="isLoading" class="flex items-center justify-center h-screen">
    <div
      class="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"
    ></div>
  </div>
  <main v-else class="p-8 space-y-8">
    <!-- Header -->
    <header class="flex justify-between items-center">
      <h1 class="text-3xl font-bold tracking-tight">Dashboard do Médico</h1>
    </header>

    <!-- Grid responsivo com cards principais -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Card Próxima Consulta -->
      <Card class="card-hover">
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <CalendarIcon class="w-5 h-5" />
            {{
              activeConsultation ? "Consulta em Andamento" : "Próxima Consulta"
            }}
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div v-if="activeConsultation" class="space-y-2">
            <div class="flex items-center gap-2 text-sm">
              <UserIcon class="w-4 h-4" />
              <span class="font-medium">{{
                activeConsultation.paciente?.nome || "Paciente"
              }}</span>
            </div>
            <div class="flex items-center gap-2 text-sm text-muted-foreground">
              <ClipboardMinus class="w-4 h-4" />
              <p>{{ activeConsultation.observacoes || "Sem observações" }}</p>
            </div>
            <div class="flex items-center gap-2 text-sm text-muted-foreground">
              <BuildingIcon class="w-4 h-4" />
              <span>{{ activeConsultation.entidade?.nome || "Entidade" }}</span>
            </div>
            <div class="flex items-center gap-2 text-sm text-amber-500">
              <AlertCircle class="w-4 h-4" />
              <span
                >Consulta iniciada em
                {{ formatDataHora(activeConsultation.data_inicio) }}</span
              >
            </div>
          </div>
          <div v-else-if="proximaConsulta.start" class="space-y-2">
            <div class="flex items-center gap-2 text-sm text-muted-foreground">
              <ClockIcon class="w-4 h-4" />
              <span>{{ formatDataHora(proximaConsulta.start) }}</span>
            </div>
            <div class="flex items-center gap-2 text-sm">
              <UserIcon class="w-4 h-4" />
              <span class="font-medium">{{
                proximaConsulta.paciente?.nome
              }}</span>
            </div>
            <div class="flex items-center gap-2 text-sm text-muted-foreground">
              <ClipboardMinus class="w-4 h-4" />
              <p>{{ proximaConsulta.observacoes }}</p>
            </div>
            <div class="flex items-center gap-2 text-sm text-muted-foreground">
              <BuildingIcon class="w-4 h-4" />
              <span>{{ proximaConsulta.entidade?.nome }}</span>
            </div>
          </div>
          <div v-else class="text-center py-4 text-muted-foreground">
            Não há consultas agendadas.
          </div>
          <Button
            class="w-full"
            :disabled="!proximaConsulta.start && !activeConsultation"
            @click="handleConsultaAction"
            :variant="activeConsultation ? 'default' : 'secondary'"
          >
            <template v-if="activeConsultation">
              <ArrowRightIcon class="w-4 h-4 mr-2" />
              Continuar Consulta
            </template>
            <template v-else>
              <PlayIcon class="w-4 h-4 mr-2" />
              Iniciar Consulta
            </template>
          </Button>
        </CardContent>
      </Card>

      <!-- Card Estatísticas -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <BarChartIcon class="w-5 h-5" />
            Estatísticas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-3 gap-4">
            <!-- Consultas Hoje -->
            <div class="text-center p-4 bg-muted/50 rounded-lg">
              <div class="text-2xl font-bold text-primary">
                {{ estatisticas.consultasHoje }}
              </div>
              <div class="text-sm text-muted-foreground">Consultas Hoje</div>
            </div>

            <!-- Pendentes -->
            <div class="text-center p-4 bg-muted/50 rounded-lg">
              <div class="text-2xl font-bold text-orange-500">
                {{ estatisticas.pendentes }}
              </div>
              <div class="text-sm text-muted-foreground">Pendentes</div>
            </div>

            <!-- Faltas -->
            <div class="text-center p-4 bg-muted/50 rounded-lg">
              <div class="text-2xl font-bold text-red-500">
                {{ estatisticas.faltas }}
              </div>
              <div class="text-sm text-muted-foreground">Faltas</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Tabs Section -->
    <Tabs default-value="agenda" class="w-full">
      <TabsList class="grid w-full grid-cols-2">
        <TabsTrigger value="agenda" class="flex items-center gap-2">
          <CalendarDaysIcon class="w-4 h-4" />
          Agenda
        </TabsTrigger>
        <TabsTrigger value="pacientes" class="flex items-center gap-2">
          <UsersIcon class="w-4 h-4" />
          Pacientes
        </TabsTrigger>
      </TabsList>

      <TabsContent value="agenda" class="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Calendário de Consultas</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              class="flex items-center justify-center h-64 bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/25"
            >
              <div class="text-center space-y-2">
                <CalendarIcon class="w-12 h-12 mx-auto text-muted-foreground" />
                <p class="text-muted-foreground">Aqui vai o calendário</p>
                <p class="text-sm text-muted-foreground">
                  Componente de calendário será implementado
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="pacientes" class="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Lista de Pacientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              class="flex items-center justify-center h-64 bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/25"
            >
              <div class="text-center space-y-2">
                <UsersIcon class="w-12 h-12 mx-auto text-muted-foreground" />
                <p class="text-muted-foreground">
                  Aqui vai a lista de pacientes
                </p>
                <p class="text-sm text-muted-foreground">
                  Tabela de pacientes será implementada
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>

    <!-- Cards adicionais de informações rápidas -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent class="p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Receita Mensal</p>
              <p class="text-2xl font-bold">CVE 12.450</p>
            </div>
            <div class="p-2 bg-green-100 dark:bg-green-900 rounded-full">
              <TrendingUpIcon
                class="w-6 h-6 text-green-600 dark:text-green-400"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Novos Pacientes</p>
              <p class="text-2xl font-bold">
                {{ estatisticas.novosPacientes }}
              </p>
            </div>
            <div class="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
              <UserPlusIcon class="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Taxa de Satisfação</p>
              <p class="text-2xl font-bold">98%</p>
            </div>
            <div class="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-full">
              <StarIcon class="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Orçamentos Pendentes</p>
              <p class="text-2xl font-bold">
                {{ estatisticas.orcamentosPendentes }}
              </p>
            </div>
            <div class="p-2 bg-purple-100 dark:bg-purple-900 rounded-full">
              <FileTextIcon
                class="w-6 h-6 text-purple-600 dark:text-purple-400"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useState } from "#app";
import { useDoctorDashboard } from "~/composables/useDoctorDashboard";
import type { UtilizadorResponse } from "~/types/utilizador";
import type { Clinica } from "~/types/clinica";
import { useConsultas } from "~/composables/useConsultas";
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  BuildingIcon,
  PlayIcon,
  BarChartIcon,
  CalendarDaysIcon,
  UsersIcon,
  TrendingUpIcon,
  UserPlusIcon,
  StarIcon,
  FileTextIcon,
  ClipboardMinus,
  AlertCircle,
} from "lucide-vue-next";

// Definir meta da página
definePageMeta({
  title: "Dashboard do Médico",
  layout: "default",
});

const router = useRouter();
const { createConsulta } = useConsultas();

const loggedUser = useState<UtilizadorResponse | null>("user");
const selectedClinic = useState<Clinica | null>("selectedClinic");
const isLoading = ref(true);
const {
  proximasConsultas,
  estatisticas,
  pacientes,
  activeConsultation,
  fetchActiveConsultation,
} = computed(() => {
  if (loggedUser.value && selectedClinic.value) {
    return useDoctorDashboard(loggedUser.value, selectedClinic.value);
  }
  return {
    proximasConsultas: ref([]),
    estatisticas: ref({}),
    pacientes: ref([]),
    activeConsultation: ref(null),
    fetchActiveConsultation: async (): Promise<null> => null,
  };
}).value;

watchEffect(() => {
  if (loggedUser.value) {
    isLoading.value = false;
  }
});

const proximaConsulta = computed(() => {
  return (
    proximasConsultas.value[0] || {
      start: "",
      paciente: "",
      entidade: "",
      observacoes: "",
    }
  );
});

// Função utilitária para formatar data/hora
function formatDataHora(date: string | Date) {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Funções de ação
async function handleConsultaAction() {
  if (activeConsultation.value) {
    // If there's an active consultation, navigate to it
    navigateTo(`/doctor/consulta/${activeConsultation.value.id}`);
    return;
  }

  if (!proximaConsulta.value || !proximaConsulta.value.paciente?.id) {
    toast({
      title: "Aviso",
      description: "Não há consulta disponível para iniciar",
      variant: "default",
    });
    return;
  }

  try {
    // Create a new consultation
    const nova = await createConsulta({
      paciente_id: proximaConsulta.value.paciente.id,
      clinica_id: selectedClinic.value?.id || 0,
      entidade_id: proximaConsulta.value.entidade.id,
      medico_id: loggedUser.value!.id,
      observacoes: proximaConsulta.value.observacoes || "",
    });

    if (nova?.id) {
      navigateTo(`/doctor/consulta/${nova.id}`);
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível criar a consulta",
        variant: "destructive",
      });
    }
  } catch (error) {
    console.error("Erro ao iniciar consulta:", error);
    toast({
      title: "Erro",
      description: "Ocorreu um erro ao iniciar a consulta",
      variant: "destructive",
    });
  }
}

const verPerfil = () => {
  // Navegar para página de perfil
  console.log("Abrindo perfil...");
  // Exemplo: await navigateTo('/perfil')
};

// Função para obter saudação baseada na hora
const getSaudacao = () => {
  const hora = new Date().getHours();
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
};

// Dados reativos para atualizações em tempo real
const horaAtual = ref(
  new Date().toLocaleTimeString("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
  })
);

// Atualizar hora a cada minuto
setInterval(() => {
  horaAtual.value = new Date().toLocaleTimeString("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
  });
}, 60000);

onMounted(async () => {
  if (loggedUser.value && selectedClinic.value) {
    await fetchActiveConsultation();
    isLoading.value = false;
  }
});
</script>

<style scoped>
/* Estilos adicionais se necessário */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Animação suave para os cards */
.card-hover {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}
</style>
