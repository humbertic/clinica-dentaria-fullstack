<script setup lang="ts">
import { useRouter } from "vue-router";
import { useOrcamentos } from "~/composables/useOrcamentos";
import { useToast } from "~/components/ui/toast";
import type { Orcamento } from "~/types/orcamento";
import { useEntidades } from "~/composables/useEntidades";
import {
  FileText,
  PlusCircle,
  Eye,
  Check,
  X,
  ExternalLink,
} from "lucide-vue-next";

const props = defineProps<{
  isLoading: boolean;
  pacienteId: number;
}>();

const router = useRouter();
const route = useRoute();
const { toast } = useToast();

const {
  orcamentos,
  loading: orcamentosLoading,
  fetchOrcamentosByPaciente,
  updateOrcamentoStatus,
  createOrcamento,
} = useOrcamentos();

const creatingOrcamento = ref(false);
const showEntidadeDialog = ref(false);
const selectedEntidadeId = ref<number | null>(null);

const { entidades, fetchEntidades, loading: entidadesLoading } = useEntidades();

const isDoctorContext = computed(() => {
  return route.path.includes('/doctor/');
});

const isFrontdeskContext = computed(() => {
  return route.path.includes('/frontdesk/');
});

const consultaId = computed(() => {
  return route.query.consulta_id ? Number(route.query.consulta_id) : null;
});
// Load orcamentos when component is mounted or pacienteId changes
watch(
  () => props.pacienteId,
  (newId) => {
    if (newId) {
      fetchOrcamentosByPaciente(newId);
    }
  },
  { immediate: true }
);

// Format date strings
function formatarData(data: string): string {
  if (!data) return "—";
  const d = new Date(data);
  return d.toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// Format currency values
function formatCurrency(value: number | string | undefined): string {
  if (value === undefined) return "—";
  const num = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("cv-CV", {
    style: "currency",
    currency: "CVE",
  }).format(num);
}

// Get status badge classes based on estado
function getEstadoColor(estado: string): string {
  switch (estado) {
    case "rascunho":
      return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    case "aprovado":
      return "bg-green-100 text-green-800 hover:bg-green-100";
    case "rejeitado":
      return "bg-red-100 text-red-800 hover:bg-red-100";
    default:
      return "bg-slate-100 text-slate-800 hover:bg-slate-100";
  }
}

// Get display name for status
function getEstadoLabel(estado: string): string {
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
}

function abrirDialogoNovoOrcamento() {
  selectedEntidadeId.value = null;
  showEntidadeDialog.value = true;
}
// Create a new orçamento
async function criarNovoOrcamento() {
  if (!props.pacienteId) {
    toast({
      title: "Erro",
      description: "ID do paciente não disponível",
      variant: "destructive",
    });
    return;
  }

  if (!selectedEntidadeId.value) {
    toast({
      title: "Erro",
      description: "Selecione uma entidade",
      variant: "destructive",
    });
    return;
  }

  try {
    creatingOrcamento.value = true;

    // First parameter is pacienteId, second is entidadeId
    const novoOrcamentoId = await createOrcamento(
      props.pacienteId,
      selectedEntidadeId.value
    );

    if (novoOrcamentoId) {
      // Refresh the list
      fetchOrcamentosByPaciente(props.pacienteId);

      // Redirect to the edit page for the new orçamento
      redirectToOrcamentoEdit(novoOrcamentoId);

      toast({
        title: "Sucesso",
        description: `Orçamento #${novoOrcamentoId} criado com sucesso`,
      });
    }
  } catch (error) {
    console.error("Erro ao criar orçamento:", error);
    toast({
      title: "Erro",
      description: "Ocorreu um erro ao criar o orçamento",
      variant: "destructive",
    });
  } finally {
    creatingOrcamento.value = false;
    showEntidadeDialog.value = false;
  }
}

// View/edit an existing orçamento
function viewOrcamento(orcamento: Orcamento) {
  redirectToOrcamentoEdit(orcamento.id);
}

// Update orçamento status (approve/reject)
async function atualizarStatusOrcamento(
  orcamentoId: number,
  novoEstado: "aprovado" | "rejeitado"
) {
  try {
    toast({
      title: "Processando",
      description: `Atualizando status do orçamento...`,
    });

    await updateOrcamentoStatus(orcamentoId, novoEstado);

    // Refresh the list
    if (props.pacienteId) {
      await fetchOrcamentosByPaciente(props.pacienteId);
    }

    toast({
      title: "Sucesso",
      description: `Orçamento ${
        novoEstado === "aprovado" ? "aprovado" : "rejeitado"
      } com sucesso`,
    });
  } catch (error) {
    console.error(
      `Erro ao ${
        novoEstado === "aprovado" ? "aprovar" : "rejeitar"
      } orçamento:`,
      error
    );
    toast({
      title: "Erro",
      description: `Ocorreu um erro ao ${
        novoEstado === "aprovado" ? "aprovar" : "rejeitar"
      } o orçamento`,
      variant: "destructive",
    });
  }
}

// Helper function to redirect to the orçamento edit page
function redirectToOrcamentoEdit(orcamentoId: number) {
  if (isDoctorContext.value) {
    // If in doctor context
    if (consultaId.value) {
      // If coming from a consulta, include that in the navigation
      router.push(
        `/doctor/consulta/${consultaId.value}/orcamento/${orcamentoId}?source=doctor&patient_id=${props.pacienteId}`
      );
    } else {
      // Otherwise just navigate to doctor's orcamento view
      router.push(
        `/master/orcamentos/${orcamentoId}/edit?patient_id=${props.pacienteId}&source=doctor_patient`
      );
    }
  } else if (isFrontdeskContext.value) {
    // If in frontdesk context
    router.push(`/frontdesk/orcamentos/${orcamentoId}/edit?patient_id=${props.pacienteId}`);
  } else {
    // Standard master navigation
    router.push(
      `/master/orcamentos/${orcamentoId}/edit?patient_id=${props.pacienteId}&source=patient`
    );
  }
}

// Shorthand functions for approve/reject
function aprovarOrcamento(id: number) {
  atualizarStatusOrcamento(id, "aprovado");
}

function rejeitarOrcamento(id: number) {
  atualizarStatusOrcamento(id, "rejeitado");
}

onMounted(async () => {
  await fetchEntidades();
});
</script>

<template>
  <div class="space-y-6">
    <!-- Loading skeleton -->
    <div v-if="props.isLoading || orcamentosLoading" class="space-y-4">
      <Skeleton class="h-10 w-48" />
      <Skeleton class="h-64 rounded-2xl" />
    </div>

    <div v-else class="rounded-2xl shadow bg-card text-card-foreground p-6">
      <!-- Header with title and action button -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h3 class="text-lg font-semibold">Orçamentos</h3>
        <Button @click="abrirDialogoNovoOrcamento" :disabled="creatingOrcamento" class="w-full sm:w-auto">
          <PlusCircle class="mr-2 h-4 w-4" />
          Novo Orçamento
        </Button>
      </div>

      <!-- Empty state when no orçamentos exist -->
      <Card v-if="!orcamentos.length" class="py-8 text-center">
        <CardContent>
          <div class="flex flex-col items-center justify-center space-y-3">
            <FileText class="h-10 w-10 text-muted-foreground" />
            <p class="text-muted-foreground">
              Nenhum orçamento encontrado para este paciente
            </p>
            <Button
              size="sm"
              @click="abrirDialogoNovoOrcamento"
              :disabled="creatingOrcamento"
            >
              <PlusCircle class="mr-2 h-4 w-4" /> Criar Orçamento
            </Button>
          </div>
        </CardContent>
      </Card>

      <!-- Table of orçamentos -->
      <div v-else class="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Entidade</TableHead>
              <TableHead class="text-right">Total Seg.</TableHead>
              <TableHead class="text-right">Total Pac.</TableHead>
              <TableHead class="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="orcamento in orcamentos" :key="orcamento.id">
              <TableCell class="font-medium">#{{ orcamento.id }}</TableCell>
              <TableCell>{{ formatarData(orcamento.data) }}</TableCell>
              <TableCell>
                <Badge :class="getEstadoColor(orcamento.estado)">
                  {{ getEstadoLabel(orcamento.estado) }}
                </Badge>
              </TableCell>
              <TableCell>
                {{ orcamento.entidade?.nome || "Sem entidade" }}
              </TableCell>
              <TableCell class="text-right">{{
                formatCurrency(orcamento.total_entidade)
              }}</TableCell>
              <TableCell class="text-right">{{
                formatCurrency(orcamento.total_paciente)
              }}</TableCell>
              <TableCell class="text-right">
                <div class="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    @click="viewOrcamento(orcamento)"
                  >
                    <Eye class="h-4 w-4" />
                  </Button>

                  <!-- Show approve button only for rascunho status -->
                  <Button
                    v-if="orcamento.estado === 'rascunho'"
                    variant="outline"
                    size="sm"
                    @click="aprovarOrcamento(orcamento.id)"
                    class="text-green-600 hover:text-green-700"
                  >
                    <Check class="h-4 w-4" />
                  </Button>

                  <!-- Show reject button only for rascunho status -->
                  <Button
                    v-if="orcamento.estado === 'rascunho'"
                    variant="outline"
                    size="sm"
                    @click="rejeitarOrcamento(orcamento.id)"
                    class="text-red-600 hover:text-red-700"
                  >
                    <X class="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
    <Dialog
      :open="showEntidadeDialog"
      @update:open="showEntidadeDialog = $event"
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Selecionar Entidade</DialogTitle>
          <DialogDescription>
            Selecione a entidade para o novo orçamento.
          </DialogDescription>
        </DialogHeader>

        <div class="py-4">
          <div v-if="entidadesLoading" class="flex justify-center py-4">
            <div
              class="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"
            ></div>
          </div>
          <div
            v-else-if="!entidades.length"
            class="text-center py-4 text-muted-foreground"
          >
            Nenhuma entidade disponível.
          </div>
          <div v-else>
            <Label for="entidade">Entidade</Label>
            <Select v-model="selectedEntidadeId">
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma entidade" />
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
        </div>

        <DialogFooter>
          <Button variant="outline" @click="showEntidadeDialog = false"
            >Cancelar</Button
          >
          <Button
            :disabled="!selectedEntidadeId || creatingOrcamento"
            @click="criarNovoOrcamento"
          >
            <div
              v-if="creatingOrcamento"
              class="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"
            ></div>
            Criar Orçamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
