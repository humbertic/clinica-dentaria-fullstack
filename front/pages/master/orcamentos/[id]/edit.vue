<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import type { Clinica } from "~/types/clinica";
import { PlusIcon, CheckIcon, XIcon, CircleIcon } from "lucide-vue-next";
import { useToast } from "@/components/ui/toast";

// Importações reais
import { usePacientes } from "~/composables/usePacientes";
import { useEntidades } from "~/composables/useEntidades";
import { useOrcamentos } from "~/composables/useOrcamentos";
import type {
  Orcamento,
  OrcamentoItem,
  UpdateOrcamentoDTO,
  AddItemOrcamentoDTO,
  OrcamentoItemRead,
} from "~/types/orcamento";

const route = useRoute();
const router = useRouter();
const { toast } = useToast();
const source = computed(() => route.query.source as string);
const patientId = computed(() =>
  route.query.patient_id ? Number(route.query.patient_id) : null
);

// ID do orçamento da rota
const orcamentoId = computed(() => {
  const id = route.params.id;
  return typeof id === "string" ? parseInt(id, 10) : -1;
});

const props = defineProps({
  clinics: {
    type: Array as PropType<Clinica[]>,
    default: () => [],
  },
});

// Inicializar composables
const {
  fetchOrcamentoById,
  updateOrcamento,
  updateOrcamentoStatus: apiUpdateStatus,
  addItemToOrcamento,
  deleteOrcamento,
  deleteItemFromOrcamento,
  loading: loadingOrcamento,
  error: errorOrcamento,
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

// Estado local
const orcamento = ref<Orcamento | undefined>(undefined);
const loading = ref(true);
const error = ref<string | null>(null);
const showAddModal = ref(false);
const itemEmEdicao = ref<OrcamentoItemRead | undefined>(undefined);
const atualizandoEstado = ref(false);

// Campos editáveis do orçamento
const pacienteId = ref<number>(0);
const entidadeId = ref<number>(0);
const dataOrcamento = ref<string>("");

const selectedClinic = useState<Clinica | null>(
  "selectedClinic",
  () => props.clinics[0] || null
);

// Verificar se tem itens
const temItens = computed(() => {
  return (
    orcamento.value && orcamento.value.itens && orcamento.value.itens.length > 0
  );
});

// Carregar dados iniciais
onMounted(async () => {
  loading.value = true;
  error.value = null;

  if (!selectedClinic.value) {
    console.error("Nenhuma clínica selecionada", selectedClinic.value);
    error.value = "Nenhuma clínica selecionada";
    loading.value = false;
    return;
  }

  try {
    // Carregar orçamento, pacientes e entidades em paralelo
    await Promise.all([
      carregarOrcamento(),
      fetchPacientes(selectedClinic.value.id),
      fetchEntidades(),
    ]);
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : String(err);
    console.error("Erro ao carregar dados iniciais:", err);
  } finally {
    loading.value = false;
  }
});

// Carregar orçamento
async function carregarOrcamento() {
  if (!orcamentoId.value || orcamentoId.value < 1) {
    error.value = "ID do orçamento inválido";
    return;
  }

  try {
    const data = await fetchOrcamentoById(orcamentoId.value);

    if (!data) {
      error.value = "Orçamento não encontrado";
      return;
    }

    orcamento.value = data;

    // Inicializar campos editáveis
    pacienteId.value = data.paciente_id;
    entidadeId.value = data.entidade_id;
    dataOrcamento.value = data.data;
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : String(err);
    console.error(`Erro ao carregar orçamento ${orcamentoId.value}:`, err);
  }
}

// Funções auxiliares
const formatCurrency = (value: number | string): string => {
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("cv-CV", {
    style: "currency",
    currency: "CVE",
  }).format(numValue);
};

const getTotalGeral = (): number => {
  if (!orcamento.value) return 0;

  const entidadeValue =
    typeof orcamento.value.total_entidade === "string"
      ? parseFloat(orcamento.value.total_entidade)
      : orcamento.value.total_entidade || 0;

  const pacienteValue =
    typeof orcamento.value.total_paciente === "string"
      ? parseFloat(orcamento.value.total_paciente)
      : orcamento.value.total_paciente || 0;

  return entidadeValue + pacienteValue;
};

const getNomePaciente = (id: number | null) => {
  if (!id) return "Selecione um paciente";

  if (orcamento.value?.paciente && orcamento.value.paciente.id === id) {
    return orcamento.value.paciente.nome;
  }

  const paciente = pacientes.value.find((p) => p.id === id);
  return paciente ? paciente.nome : `Paciente ${id}`;
};

const getNomeEntidade = (id: number | null) => {
  if (!id) return "Selecione uma entidade";

  if (orcamento.value?.entidade && orcamento.value.entidade.id === id) {
    return orcamento.value.entidade.nome;
  }

  const entidade = entidades.value.find((e) => e.id === id);
  return entidade ? entidade.nome : `Entidade ${id}`;
};

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

const getEstadoVariant = (estado: string) => {
  switch (estado) {
    case "rascunho":
      return "outline";
    case "aprovado":
      return "secondary";
    case "rejeitado":
      return "destructive";
    default:
      return "default";
  }
};

// Atualizar um campo do orçamento
async function updateOrcamentoField(
  field: keyof UpdateOrcamentoDTO,
  value: any
) {
  if (!orcamento.value) return;

  try {
    const updateData: Partial<UpdateOrcamentoDTO> = { [field]: value };

    await updateOrcamento(orcamento.value.id, updateData);

    // Atualizar o orçamento local após a atualização bem-sucedida
    await carregarOrcamento();

    toast({
      title: "Sucesso",
      description: "Orçamento atualizado com sucesso",
    });
  } catch (err: unknown) {
    toast({
      title: "Erro",
      description: "Erro ao atualizar orçamento",
      variant: "destructive",
    });
    console.error("Erro ao atualizar orçamento:", err);
  }
}

function voltarParaPagina() {
  if (source.value === "patient" && patientId.value) {
    // Return to patient page with orcamentos tab selected
    router.push(`/master/patient/${patientId.value}?tab=orcamentos`);
  } else {
    // Default - return to orcamentos list
    router.push("/master/orcamentos");
  }
}

// Ações
const voltar = voltarParaPagina;

const aprovar = async () => {
  if (!orcamento.value) return;

  atualizandoEstado.value = true;

  try {
    await apiUpdateStatus(orcamento.value.id, "aprovado");

    toast({
      title: "Sucesso",
      description: "Orçamento aprovado com sucesso",
    });

    // Recarregar orçamento para atualizar o estado
    await carregarOrcamento();
  } catch (err: unknown) {
    toast({
      title: "Erro",
      description: "Erro ao aprovar orçamento",
      variant: "destructive",
    });
    console.error("Erro ao aprovar orçamento:", err);
  } finally {
    atualizandoEstado.value = false;
  }
};

const rejeitar = async () => {
  if (!orcamento.value) return;

  atualizandoEstado.value = true;

  try {
    await apiUpdateStatus(orcamento.value.id, "rejeitado");

    toast({
      title: "Sucesso",
      description: "Orçamento rejeitado com sucesso",
    });

    // Recarregar orçamento para atualizar o estado
    await carregarOrcamento();
  } catch (err: unknown) {
    toast({
      title: "Erro",
      description: "Erro ao rejeitar orçamento",
      variant: "destructive",
    });
    console.error("Erro ao rejeitar orçamento:", err);
  } finally {
    atualizandoEstado.value = false;
  }
};

const adicionarItem = async (item: AddItemOrcamentoDTO) => {
  if (!orcamento.value) return;

  try {
    await addItemToOrcamento(orcamento.value.id, item);

    toast({
      title: "Sucesso",
      description: "Procedimento adicionado com sucesso",
    });

    // Recarregar orçamento para mostrar o novo item
    await carregarOrcamento();

    // Fechar modal
    fecharModal();
  } catch (err: unknown) {
    toast({
      title: "Erro",
      description: "Erro ao adicionar procedimento",
      variant: "destructive",
    });
    console.error("Erro ao adicionar item ao orçamento:", err);
  }
};

const editarItem = (itemId: number) => {
  if (!orcamento.value || !orcamento.value.itens) return;

  const item = orcamento.value.itens.find((i) => i.id === itemId);
  if (item) {
    itemEmEdicao.value = item;
    showAddModal.value = true;
  }
};

const atualizarItem = async (itemId: number, data: Partial<OrcamentoItem>) => {
  if (!orcamento.value) return;

  try {
    // Implementar chamada API para atualizar item
    // await updateOrcamentoItem(orcamento.value.id, itemId, data);

    toast({
      title: "Sucesso",
      description: "Procedimento atualizado com sucesso",
    });

    // Recarregar orçamento para mostrar as alterações
    await carregarOrcamento();

    // Fechar modal
    fecharModal();
  } catch (err: unknown) {
    toast({
      title: "Erro",
      description: "Erro ao atualizar procedimento",
      variant: "destructive",
    });
    console.error("Erro ao atualizar item do orçamento:", err);
  }
};

const removerItem = async (itemId: number) => {
  if (!orcamento.value) return;

  try {
    // Implementar chamada API para remover item
    await deleteItemFromOrcamento(orcamento.value.id, itemId);

    toast({
      title: "Sucesso",
      description: "Procedimento removido com sucesso",
    });

    // Recarregar orçamento para atualizar a lista de itens
    await carregarOrcamento();
  } catch (err: unknown) {
    toast({
      title: "Erro",
      description: "Erro ao remover procedimento",
      variant: "destructive",
    });
    console.error("Erro ao remover item do orçamento:", err);
  }
};

const fecharModal = () => {
  showAddModal.value = false;
  itemEmEdicao.value = undefined;
};

// Recarregar orçamento quando a rota mudar
watch(
  () => route.params.id,
  async () => {
    if (orcamentoId.value > 0) {
      await carregarOrcamento();
    }
  }
);
</script>
<template>
  <div class="p-6">
    <!-- Loading state -->
    <div v-if="loading" class="text-center p-8 border">
      <div
        class="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
      ></div>
      <p class="">Carregando orçamento...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="text-center p-8 border">
      <Alert variant="destructive" class="mb-4">
        <AlertTitle>Erro ao carregar orçamento</AlertTitle>
        <AlertDescription>{{ error }}</AlertDescription>
      </Alert>
      <Button class="mt-4" @click="voltar">Voltar</Button>
    </div>

    <!-- Orçamento não encontrado -->
    <div v-else-if="!orcamento" class="text-center p-8 border">
      <p>Orçamento não encontrado.</p>
      <Button class="mt-4" @click="voltar">Voltar</Button>
    </div>

    <!-- Conteúdo principal -->
    <div v-else>
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Orçamento #{{ orcamento.id }}</h1>
        <Badge :variant="getEstadoVariant(orcamento.estado)" class="text-sm">
          <div class="flex items-center gap-1">
            <CheckIcon v-if="orcamento.estado === 'aprovado'" class="w-3 h-3" />
            <XIcon v-if="orcamento.estado === 'rejeitado'" class="w-3 h-3" />
            <CircleIcon
              v-if="orcamento.estado === 'rascunho'"
              class="w-3 h-3"
            />
            {{ getEstadoLabel(orcamento.estado) }}
          </div>
        </Badge>
      </div>

      <div class="p-6 rounded-lg shadow mb-6 border">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <Label for="paciente">Paciente</Label>
            <Select
              v-model="pacienteId"
              :disabled="
                temItens || orcamento.estado !== 'rascunho' || loadingPacientes
              "
              @update:modelValue="updateOrcamentoField('paciente_id', $event)"
            >
              <SelectTrigger>
                <SelectValue
                  :placeholder="
                    loadingPacientes
                      ? 'Carregando...'
                      : getNomePaciente(pacienteId)
                  "
                />
              </SelectTrigger>
              <SelectContent>
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
            <Label for="entidade">Entidade</Label>
            <Select
              v-model="entidadeId"
              :disabled="
                temItens || orcamento.estado !== 'rascunho' || loadingEntidades
              "
              @update:modelValue="updateOrcamentoField('entidade_id', $event)"
            >
              <SelectTrigger>
                <SelectValue
                  :placeholder="
                    loadingEntidades
                      ? 'Carregando...'
                      : getNomeEntidade(entidadeId)
                  "
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="entidade in entidades"
                  :key="entidade.id"
                  :value="entidade.id"
                >
                  {{ entidade.nome }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label for="data">Data</Label>
            <Input
              id="data"
              v-model="dataOrcamento"
              type="date"
              :disabled="orcamento.estado !== 'rascunho'"
              @update:modelValue="updateOrcamentoField('data', $event)"
            />
          </div>
        </div>
      </div>

      <div class="p-6 rounded-lg shadow mb-6 border">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-medium">Procedimentos</h2>
          <Button
            v-if="orcamento.estado === 'rascunho'"
            @click="showAddModal = true"
          >
            <PlusIcon class="w-4 h-4 mr-2" />
            Adicionar procedimento
          </Button>
        </div>

        <OrcamentosItemTable
          :itens="orcamento.itens || []"
          :readonly="orcamento.estado !== 'rascunho'"
          @edit="editarItem"
          @delete="removerItem"
        />
      </div>

      <div class="p-6 rounded-lg shadow mb-6 border">
        <div class="grid grid-cols-3 gap-4">
          <div class="text-right">
            <p class="">Total Seguradora:</p>
            <p class="text-xl font-bold">
              {{ formatCurrency(orcamento.total_entidade || 0) }}
            </p>
          </div>
          <div class="text-right">
            <p class="">Total Paciente:</p>
            <p class="text-xl font-bold">
              {{ formatCurrency(orcamento.total_paciente || 0) }}
            </p>
          </div>
          <div class="text-right">
            <p class="">Total Geral:</p>
            <p class="text-xl font-bold">
              {{ formatCurrency(getTotalGeral()) }}
            </p>
          </div>
        </div>
      </div>

      <div class="flex justify-between">
        <Button variant="outline" @click="voltar">
          {{ source === "patient" ? "Voltar para Paciente" : "Voltar" }}
        </Button>

        <div class="flex gap-2">
          <Button
            v-if="orcamento.estado === 'rascunho'"
            variant="destructive"
            @click="rejeitar"
            :disabled="atualizandoEstado"
          >
            <XIcon class="w-4 h-4 mr-2" />
            Rejeitar
          </Button>

          <Button
            v-if="orcamento.estado === 'rascunho'"
            @click="aprovar"
            :disabled="atualizandoEstado"
          >
            <CheckIcon class="w-4 h-4 mr-2" />
            Aprovar
          </Button>
        </div>
      </div>

      <OrcamentosAddProcedureModal
        :show="showAddModal"
        :entidade-id="entidadeId"
        :edit-item="itemEmEdicao"
        :disabled="orcamento.estado !== 'rascunho'"
        @close="fecharModal"
        @save="adicionarItem"
        @update="atualizarItem"
      />
    </div>
  </div>
</template>
