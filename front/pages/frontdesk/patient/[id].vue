<script setup lang="ts">
import { Edit, ClipboardList, Plus } from "lucide-vue-next";
import { useRoute, useRouter } from "vue-router";
import { usePacientes } from "~/composables/usePacientes";
import { useToast } from "~/components/ui/toast";
import type {
  Paciente,
  Consulta as ConsultaType,
  PlanoTratamento,
} from "~/types/pacientes";
import { formatPaciente } from "~/types/pacientes";

const route = useRoute();
const router = useRouter();
const { toast } = useToast();

const { fetchPacienteById, loading: isLoading, error } = usePacientes();
const rawPaciente = ref<Paciente | null>(null);

const paciente = computed(() => {
  if (!rawPaciente.value) return null;
  return formatPaciente(rawPaciente.value);
});

const patientId = computed(() => {
  const id = route.params.id;
  return typeof id === "string" ? parseInt(id) : 0;
});

const activeTab = ref<
  | "resumo"
  | "consultas"
  | "planos"
  | "orcamentos"
  | "pagamentos"
>("resumo");

function openFichaClinica() {
  console.log("Abrir ficha clínica");
}
function openAgendarConsulta() {
  if (paciente.value?.id) {
    router.push({
      path: "/frontdesk/marcacoes/",
      query: { paciente_id: paciente.value.id.toString() },
    });
  }
}

function openAdicionarAnotacao() {
  console.log("Abrir add nota");
}

function openAnexarFicheiro() {
  console.log("Abrir attach ficheiro");
}

function viewConsulta(consulta: ConsultaType) {
  // router.push(`/master/appointment/${consulta.id}`);
  toast({
    title: "Em desenvolvimento",
    description: "A funcionalidade de visualizar consulta ainda não está implementada.",
  });
}

function viewPlano(plano: PlanoTratamento) {
  // router.push(`/master/patient/${patientId.value}/plano/${plano.id}`);
  toast({
    title: "Em desenvolvimento",
    description: "A funcionalidade de visualizar plano ainda não está implementada.",
  });
}

function editPlano(plano: PlanoTratamento) {
  // router.push(`/master/patient/${patientId.value}/plano/${plano.id}/edit`);
  toast({
    title: "Em desenvolvimento",
    description: "A funcionalidade de editar plano ainda não está implementada.",
  });
}

function newPlano() {
  // router.push(`/master/patient/${patientId.value}/plano/new`);
  toast({
    title: "Em desenvolvimento",
    description: "A funcionalidade de criar novo plano ainda não está implementada.",
  });
}

onMounted(async () => {
  // First check if there's a tab parameter in the URL
  const tabParam = route.query.tab as string;
  if (tabParam && ['resumo', 'consultas', 'planos', 'orcamentos', 'pagamentos'].includes(tabParam)) {
    activeTab.value = tabParam as 'resumo' | 'consultas' | 'planos' | 'orcamentos' | 'pagamentos';
  }

  // Then load the patient data
  if (patientId.value) {
    const result = await fetchPacienteById(patientId.value);
    if (result) {
      // Use the formatPaciente helper to add derived properties
      rawPaciente.value = result;
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do paciente",
        variant: "destructive",
      });
      // Optionally redirect back to patients list
      router.push("/frontdesk/patients");
    }
  }
});

// Also add a watcher for route changes
watch(() => route.query.tab, (newTab) => {
  if (newTab && ['resumo',  'consultas', 'planos', 'orcamentos', 'pagamentos'].includes(newTab as string)) {
    activeTab.value = newTab as 'resumo' | 'consultas' | 'planos' | 'orcamentos' | 'pagamentos';
  }
});
</script>

<template>
  <div class="p-4 md:p-6 space-y-6">
    <!-- Loading skeleton -->
    <div v-if="isLoading" class="space-y-4">
      <div class="h-10 w-3/4 bg-muted animate-pulse rounded"></div>
      <div class="h-24 bg-muted animate-pulse rounded"></div>
    </div>

    <!-- Error state -->
    <div v-else-if="!paciente" class="text-center py-8">
      <Alert variant="destructive">
        <AlertTitle>Erro ao carregar paciente</AlertTitle>
        <AlertDescription>
          {{
            error ||
            "Não foi possível carregar os dados do paciente. Tente novamente mais tarde."
          }}
        </AlertDescription>
      </Alert>
      <Button class="mt-4" @click="router.push('/frontdesk/patients')">
        Voltar para lista
      </Button>
    </div>

    <!-- Content when data is loaded -->
    <template v-else>
      <PatientsHeader :paciente="paciente" :isLoading="isLoading">
        <template #actions>
          <Button @click="openFichaClinica">
            <ClipboardList class="mr-2 h-4 w-4" />
            {{
              paciente.temFichaClinica ? "Editar Ficha" : "Nova Ficha Clínica"
            }}
          </Button>
          <Button @click="openAgendarConsulta">
            <Plus class="mr-2 h-4 w-4" /> Agendar Consulta
          </Button>
        </template>
      </PatientsHeader>

      <PatientsTabs 
        v-model:active="activeTab" 
        :visible-tabs="['resumo', 'orcamentos', 'consultas', 'planos', 'pagamentos']"
        />

      <PatientsResumoTab
        v-if="activeTab === 'resumo'"
        :isLoading="isLoading"
        :paciente="paciente"
      />

    
      <PatientsOrcamentos
        v-if="activeTab === 'orcamentos'"
        :isLoading="isLoading"
        :pacienteId="paciente.id"
      />

      <PatientsConsultasTab
        v-if="activeTab === 'consultas'"
        :isLoading="isLoading"
        :paciente="paciente"
        :consultas="paciente.consultas || []"
        @schedule="openAgendarConsulta"
        @view="viewConsulta"
      />

      <PatientsPlanosTab
        v-if="activeTab === 'planos'"
        :isLoading="isLoading"
        :planos="paciente.planos || []"
        @new="newPlano"
        @view="viewPlano"
        @edit="editPlano"
      />

      <PatientsPagamentos
        v-if="activeTab === 'pagamentos'"
        :isLoading="isLoading"
        :pacienteId="paciente.id"
      
      />
    </template>
  </div>
</template>
