<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6 border-b pb-4">
      <h1 class="text-2xl font-bold">Orçamentos</h1>
      <Button @click="criarNovoOrcamento" :disabled="loading">
        <PlusIcon class="w-4 h-4 mr-2" />
        Novo Orçamento
      </Button>
    </div>
    
    <!-- Filtros -->
    <div class="p-4 rounded-lg shadow mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label for="filtro-paciente">Paciente</Label>
        <Select v-model="filtroPaciente" :disabled="loadingPacientes">
          <SelectTrigger>
            <SelectValue placeholder="Todos os pacientes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem :value="null">Todos os pacientes</SelectItem>
            <SelectItem 
              v-for="paciente in pacientes" 
              :key="paciente.id" 
              :value="paciente.id"
            >
              {{ paciente.nome }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label for="filtro-estado">Estado</Label>
        <Select v-model="filtroEstado">
          <SelectTrigger>
            <SelectValue placeholder="Todos os estados" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem :value="null">Todos os estados</SelectItem>
            <SelectItem value="rascunho">Rascunho</SelectItem>
            <SelectItem value="aprovado">Aprovado</SelectItem>
            <SelectItem value="rejeitado">Rejeitado</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
    
    <!-- Estado de carregamento -->
    <div v-if="loading" class="rounded-lg shadow p-12 text-center">
      <div class="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
      <p class="text-gray-500">Carregando orçamentos...</p>
    </div>
    
    <!-- Mensagem de erro -->
    <Alert v-else-if="error" variant="destructive" class="mb-6">
      <AlertTitle>Erro</AlertTitle>
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>
    
    <!-- Tabela de orçamentos usando o novo componente -->
    <div v-else class="rounded-lg shadow overflow-hidden border p-4">
      <h2 class="text-md font-semibold mb-4">Lista de Orçamentos</h2>
      <OrcamentosOrcamentoTable
        :orcamentos="orcamentosPaginados"
        :pacientes="pacientes"
        :entidades="entidades"
        :clinica="selectedClinic"
        @edit="editarOrcamento($event.id)"
        @approve="updateOrcamentoStatus($event, 'aprovado')"
        @reject="updateOrcamentoStatus($event, 'rejeitado')"
      />

      <!-- Pagination -->
      <TablePagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total-items="totalItems"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import {
  PlusIcon,
  PencilIcon,
  CheckIcon,
  XIcon,
  CircleIcon,
} from "lucide-vue-next";
import { useToast } from "@/components/ui/toast";

import { useOrcamentos } from "~/composables/useOrcamentos";
import { usePacientes } from "~/composables/usePacientes";
import { useEntidades } from "~/composables/useEntidades";
import type { Orcamento } from "~/types/orcamento";
import type { Clinica } from "~/types/clinica";

const props = defineProps({
  clinics: {
    type: Array as PropType<Clinica[]>,
    default: () => [],
  },
});

const selectedClinic = useState<Clinica | null>(
  "selectedClinic",
  () => props.clinics[0] || null
);

const router = useRouter();
const { toast } = useToast();

// Inicializar os composables
const { 
  orcamentos, 
  loading, 
  error, 
  fetchOrcamentos, 
  createOrcamento,
  updateOrcamentoStatus: apiUpdateStatus // Give it an alias 
} = useOrcamentos();

const {
  pacientes,
  loading: loadingPacientes,
  error: errorPacientes,
  fetchPacientes,
} = usePacientes();

const {
  entidades,
  loading: loadingEntidades,
  error: errorEntidades,
  fetchEntidades,
} = useEntidades();

// Filtros
const filtroPaciente = ref<number | null>(null);
const filtroEstado = ref<string | null>(null);

// Carregar dados quando o componente for montado
onMounted(async () => {
  try {
    await Promise.all([
      fetchOrcamentos(),
      fetchPacientes(selectedClinic.value?.id),
      fetchEntidades(),
    ]);
  } catch (err) {
    toast({
      title: "Erro",
      description: "Ocorreu um erro ao carregar os dados.",
      variant: "destructive",
    });
    console.error("Erro ao carregar dados iniciais:", err);
  }
});

watch(() => selectedClinic.value, async (newClinic) => {
  if (newClinic) {
    try {
      await fetchPacientes(newClinic.id);
      toast({
        title: "Sucesso",
        description: "Lista de pacientes atualizada para a nova clínica",
      });
    } catch (err) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os pacientes da nova clínica.",
        variant: "destructive",
      });
      console.error("Erro ao carregar pacientes da nova clínica:", err);
    }
  }
});


// Orçamentos filtrados
const orcamentosFiltrados = computed(() => {
  return orcamentos.value.filter((orc) => {
    // Filtro por paciente
    if (filtroPaciente.value && orc.paciente_id !== filtroPaciente.value) {
      return false;
    }

    // Filtro por estado
    if (filtroEstado.value && orc.estado !== filtroEstado.value) {
      return false;
    }

    return true;
  });
});

// Use pagination composable
const {
  currentPage,
  pageSize,
  paginatedItems: orcamentosPaginados,
  totalItems,
} = usePagination(orcamentosFiltrados);

const getEstadoLabel = (estado: string) => {
  switch (estado) {
    case "rascunho":
      return "Rascunho";
    case "aprovado":
      return "Aprovado";
    case "rejeitado":
      return "Rejeitado";
    default:
      return estado;
  }
};

const updateOrcamentoStatus = async (id: number, estado: "rascunho" | "aprovado" | "rejeitado") => {
  try {
    await apiUpdateStatus(id, estado); // Use the aliased function
    toast({
      title: "Sucesso",
      description: `Estado do orçamento atualizado para ${getEstadoLabel(estado)}`,
    });
    
    // Refresh the data
    await fetchOrcamentos();
  } catch (err) {
    toast({
      title: "Erro",
      description: "Não foi possível atualizar o estado do orçamento.",
      variant: "destructive"
    });
    console.error(`Erro ao atualizar estado do orçamento ${id}:`, err);
  }
};

// Ações
const criarNovoOrcamento = async () => {
  // Verificar se temos dados carregados
  if (pacientes.value.length === 0 || entidades.value.length === 0) {
    toast({
      title: "Erro",
      description:
        "Não foi possível criar um orçamento: pacientes ou entidades não estão disponíveis.",
      variant: "destructive",
    });
    return;
  }

  try {
    // Por padrão, criar com o primeiro paciente e entidade
    const pacienteId = pacientes.value[0].id;
    const entidadeId = entidades.value[1].id;

    const novoId = await createOrcamento(pacienteId, entidadeId);
    if (novoId) {
      router.push(`/master/orcamentos/${novoId}/edit`);
    } else {
      throw new Error("Falha ao criar orçamento");
    }
  } catch (err) {
    toast({
      title: "Erro",
      description: "Não foi possível criar o orçamento.",
      variant: "destructive",
    });
    console.error("Erro ao criar orçamento:", err);
  }
};

const editarOrcamento = (id: number) => {
  router.push(`/master/orcamentos/${id}/edit`);
};
</script>
