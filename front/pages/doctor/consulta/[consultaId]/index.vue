<template>
  <div class="p-4 md:p-6 space-y-6">
    <!-- Header da Consulta -->
    <ConsultasHeader :consulta="currentConsulta!">
      <template #actions>
        <Button
          @click="finalizarConsulta"
          :disabled="loading || currentConsulta?.estado === 'concluida'"
        >
          <Check class="mr-2 h-4 w-4" />
          {{
            currentConsulta?.estado === "concluida"
              ? "Concluída"
              : "Finalizar Consulta"
          }}
        </Button>
      </template>
    </ConsultasHeader>

    <!-- As Tabs principais -->
    <Tabs v-model="activeTab">
      <TabsList>
        <TabsTrigger value="plano">Plano</TabsTrigger>
        <TabsTrigger value="artigos">Artigos</TabsTrigger>
        <TabsTrigger value="orcamentos">Orçamentos</TabsTrigger>
        <TabsTrigger value="historico">Histórico</TabsTrigger>
      </TabsList>
      <TabsContent value="plano">
        <PatientsPlanoTab
          :isLoading="loadingPlano"
          :planos="planoAtivo"
          @start-procedure="startProcedimentItem"
        />
      </TabsContent>
      <TabsContent value="orcamentos">
        <!-- Cabeçalho com botão de novo orçamento -->
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium">Orçamentos do Paciente</h3>
          <Button
            variant="default"
            size="sm"
            @click="criarNovoOrcamento"
            :disabled="
              loading || orcamentosLoading || !currentConsulta?.paciente?.id
            "
          >
            <PlusCircle class="mr-2 h-4 w-4" /> Novo Orçamento
          </Button>
        </div>

        <!-- se estivermos carregando a consulta ou os orçamentos -->
        <div
          v-if="loading || orcamentosLoading"
          class="py-8 text-center text-muted-foreground"
        >
          <div
            class="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"
          ></div>
          Carregando orçamentos...
        </div>

        <!-- quando não houver orçamentos -->
        <Card v-else-if="!orcamentos.length" class="py-8 text-center">
          <CardContent>
            <div class="flex flex-col items-center justify-center space-y-3">
              <FileText class="h-10 w-10 text-muted-foreground" />
              <p class="text-muted-foreground">
                Nenhum orçamento encontrado para este paciente
              </p>
              <Button size="sm" @click="criarNovoOrcamento">
                <PlusCircle class="mr-2 h-4 w-4" /> Criar Orçamento
              </Button>
            </div>
          </CardContent>
        </Card>

        <OrcamentosOrcamentoTable
          v-else
          :orcamentos="orcamentos"
          :pacientes="currentConsulta?.paciente ? [currentConsulta.paciente as PacienteListItem] : []"
          :entidades="entidades"
          :loading="orcamentosLoading"
          @edit="abrirEditarOrcamento"
          @approve="aprovarOrcamento"
          @reject="rejeitarOrcamento"
        />
      </TabsContent>

      <TabsContent value="artigos">
        <ConsultasArtigosTab
          :itens="currentConsulta?.itens || []"
          :loading="loading"
          :disabled="currentConsulta?.estado === 'concluida'"
          :consulta-id="Number(route.params.consultaId)"
          :entidadeId="currentConsulta?.entidade_id"
          @add-item="adicionarArtigoConsulta"
          @update-item="atualizarArtigoConsulta"
          @delete-item="removerArtigoConsulta"
        />
      </TabsContent>
      <!-- Histórico de Consultas do Paciente -->
      <TabsContent value="historico" class="min-h-[300px]">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium">Histórico de Consultas</h3>
        </div>

        <Transition name="fade" mode="out-in">
          <div v-if="historicoLoading" key="loading" class="py-8 text-center">
            <div
              class="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"
            ></div>
            <p class="text-muted-foreground">Carregando histórico...</p>
          </div>

          <Card
            v-else-if="!historicoConsultas.length"
            key="empty"
            class="py-8 text-center"
          >
            <CardContent>
              <div class="flex flex-col items-center justify-center space-y-3">
                <ClipboardList class="h-10 w-10 text-muted-foreground" />
                <p class="text-muted-foreground">
                  Nenhuma consulta anterior encontrada para este paciente
                </p>
              </div>
            </CardContent>
          </Card>

          <div v-else key="content">
            <ConsultasHistoricoTab
              :consultas="historicoConsultas"
              :loading="false"
              @view="verConsulta"
            />
          </div>
        </Transition>
      </TabsContent>
    </Tabs>
    <ConsultasAddArtigoModal
      v-if="showAddArtigoModal"
      :show="showAddArtigoModal"
      :edit-item="itemEmEdicao"
      :entidadeId="currentConsulta?.entidade_id"
      :disabled="currentConsulta?.estado === 'concluida'"
      @close="fecharModalArtigo"
      @save="adicionarArtigoConsulta"
      @update="atualizarArtigoConsulta"
    />
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { useConsultas } from "~/composables/useConsultas";
import { useOrcamentos } from "~/composables/useOrcamentos";
import { useEntidades } from "~/composables/useEntidades";
import { useArtigos } from "~/composables/useArtigos";
import { usePlanos } from "~/composables/usePlanos";
import { useFaturacao } from "~/composables/useFaturacao";
import type { Orcamento } from "~/types/orcamento";
import type { PacienteListItem } from "~/types/pacientes";
import type {
  ConsultaFull,
  ConsultaItemRead,
  ConsultaItemCreate,
  ConsultaItemUpdate,
} from "~/types/consulta";
import { useToast } from "~/components/ui/toast";
import {
  PlusCircle,
  FileText,
  Edit,
  Check,
  ClipboardList,
  ChevronDown,
  ChevronRight,
} from "lucide-vue-next";

const route = useRoute();
const router = useRouter();
const { toast } = useToast();

const {
  getConsulta,
  currentConsulta,
  loading,
  addConsultaItem,
  updateConsultaItem,
  deleteConsultaItem,
  getConsultasByPacienteEClinica,
  updateConsulta,
} = useConsultas();

const {
  orcamentos,
  loading: orcamentosLoading,
  fetchOrcamentosByPaciente,
  updateOrcamentoStatus,
  createOrcamento,
} = useOrcamentos();

const { fetchPlanoAtivo, planoAtivo, loadingPlano, error, startProcedimento } =
  usePlanos();
const { createFaturaFromConsulta } = useFaturacao();
const { entidades, fetchEntidades } = useEntidades();
const { fetchArtigos } = useArtigos();
const activeTab = ref<"orcamentos" | "artigos" | "historico" | "plano">(
  "plano"
);
const creatingOrcamento = ref(false);
const showAddArtigoModal = ref(false);
const itemEmEdicao = ref<ConsultaItemRead | undefined>(undefined);
const historicoConsultas = ref<ConsultaFull[]>([]);
const historicoLoading = ref(false);
let isLoadingHistorico = false;

onMounted(async () => {
  try {
    const id = Number(route.params.consultaId);

    // First, load the primary data in sequence instead of parallel
    await getConsulta(id);

    // After the consulta is loaded, then load supporting data
    await Promise.all([fetchEntidades(), fetchArtigos()]);

    // Only load related data after the main consulta is available
    if (currentConsulta.value?.paciente?.id) {
      if (activeTab.value === "orcamentos") {
        await fetchOrcamentosByPaciente(currentConsulta.value.paciente.id);
      } else if (activeTab.value === "historico") {
        await carregarHistoricoConsultas(currentConsulta.value.paciente.id);
      } else if (activeTab.value === "plano") {
        await fetchPlanoAtivo(currentConsulta.value.paciente.id);
      }
    }
  } catch (error) {
    console.error("Error loading initial data:", error);
    toast({
      title: "Erro",
      description: "Ocorreu um erro ao carregar os dados iniciais",
      variant: "destructive",
    });
  }
});

watch(activeTab, async (newTab) => {
  if (!currentConsulta.value?.paciente?.id) return;
  if (newTab === "orcamentos") {
    await fetchOrcamentosByPaciente(currentConsulta.value.paciente.id);
  } else if (newTab === "historico") {
    await carregarHistoricoConsultas(currentConsulta.value.paciente.id);
  } else if (newTab === "plano") {
    // Load the active treatment plan when the tab is switched
    await fetchPlanoAtivo(currentConsulta.value.paciente.id);
  }
});

watch(
  () => currentConsulta.value?.paciente?.id,
  async (newPacienteId) => {
    if (!newPacienteId) return;

    if (activeTab.value === "orcamentos") {
      await fetchOrcamentosByPaciente(newPacienteId);
    } else if (activeTab.value === "historico") {
      await carregarHistoricoConsultas(newPacienteId);
    }
  }
);

async function carregarHistoricoConsultas(pacienteId: number) {
  // Prevent multiple simultaneous calls
  if (isLoadingHistorico) return;

  try {
    isLoadingHistorico = true;
    historicoLoading.value = true;

    // Record the start time
    const startTime = Date.now();

    // Fetch data
    const consultaId = Number(route.params.consultaId);
    const clinicaId = currentConsulta.value?.clinica_id || 0;
    const todasConsultas = await getConsultasByPacienteEClinica(
      clinicaId,
      pacienteId
    );

    // Process data
    if (!todasConsultas || todasConsultas.length === 0) {
      historicoConsultas.value = [];
    } else {
      historicoConsultas.value = todasConsultas
        .filter((c) => c.id !== consultaId)
        .sort(
          (a, b) =>
            new Date(b.data_inicio).getTime() -
            new Date(a.data_inicio).getTime()
        );
    }

    // Ensure loading shows for at least 400ms for a smoother experience
    const elapsedTime = Date.now() - startTime;
    if (elapsedTime < 400) {
      await new Promise((resolve) => setTimeout(resolve, 400 - elapsedTime));
    }
  } catch (error) {
    console.error("Erro ao carregar histórico:", error);
    toast({
      title: "Erro",
      description: "Não foi possível carregar o histórico de consultas",
      variant: "destructive",
    });
    historicoConsultas.value = [];
  } finally {
    historicoLoading.value = false;
    isLoadingHistorico = false;
  }
}

async function adicionarArtigoConsulta(item: ConsultaItemCreate) {
  try {
    const consultaId = Number(route.params.consultaId);
    const result = await addConsultaItem(consultaId, item);

    if (result) {
      // Recarregar a consulta para atualizar a lista de itens
      await getConsulta(consultaId);

      // Fechar o modal se estiver aberto diretamente
      showAddArtigoModal.value = false;

      toast({
        title: "Sucesso",
        description: "Procedimento adicionado com sucesso",
      });
    }
  } catch (error) {
    console.error("Erro ao adicionar procedimento:", error);
    toast({
      title: "Erro",
      description: "Ocorreu um erro ao adicionar o procedimento",
      variant: "destructive",
    });
  }
}

async function atualizarArtigoConsulta(
  itemId: number,
  item: ConsultaItemUpdate
) {
  try {
    const result = await updateConsultaItem(itemId, item);

    if (result) {
      // Recarregar a consulta para atualizar a lista de itens
      const consultaId = Number(route.params.consultaId);
      await getConsulta(consultaId);

      // Fechar o modal se estiver aberto diretamente
      showAddArtigoModal.value = false;

      toast({
        title: "Sucesso",
        description: "Procedimento atualizado com sucesso",
      });
    }
  } catch (error) {
    console.error("Erro ao atualizar procedimento:", error);
    toast({
      title: "Erro",
      description: "Ocorreu um erro ao atualizar o procedimento",
      variant: "destructive",
    });
  }
}

async function removerArtigoConsulta(itemId: number) {
  try {
    const result = await deleteConsultaItem(itemId);

    if (result) {
      // Recarregar a consulta para atualizar a lista de itens
      const consultaId = Number(route.params.consultaId);
      await getConsulta(consultaId);

      toast({
        title: "Sucesso",
        description: "Procedimento removido com sucesso",
      });
    }
  } catch (error) {
    console.error("Erro ao remover procedimento:", error);
    toast({
      title: "Erro",
      description: "Ocorreu um erro ao remover o procedimento",
      variant: "destructive",
    });
  }
}

// Funções para modal direto (opcional, se precisar abrir o modal sem passar pelo componente ArtigosTab)
function abrirModalArtigo(item?: ConsultaItemRead) {
  itemEmEdicao.value = item;
  showAddArtigoModal.value = true;
}

function fecharModalArtigo() {
  showAddArtigoModal.value = false;
  itemEmEdicao.value = undefined;
}

function editarConsulta() {
  // lógica de editar
}

async function finalizarConsulta() {
  try {
    if (currentConsulta.value?.estado === "concluida") {
      toast({
        title: "Aviso",
        description: "Esta consulta já está concluída",
        variant: "default",
      });
      return;
    }

    toast({
      title: "Processando",
      description: "Concluindo consulta...",
    });

    const consultaId = Number(route.params.consultaId);
    const pacienteId = currentConsulta.value?.paciente_id;

    if (!pacienteId) {
      throw new Error("Paciente não identificado na consulta");
    }

    // Update the consultation status
    const dadosAtualizacao = {
      estado: "concluida",
      data_fim: new Date().toISOString(),
    };

    const resultado = await updateConsulta(consultaId, dadosAtualizacao);

    if (resultado) {
      await getConsulta(consultaId);

      try {
        const { createFatura } = useFaturacao();
        const { getRecentCompletedPlan } = usePlanos();
        let fatura;

        const temPlanoAtivo = planoAtivo.value && "id" in planoAtivo.value;
        
        let planoRecemConcluido = null;
        if (!temPlanoAtivo) {
          planoRecemConcluido = await getRecentCompletedPlan(pacienteId);
        }

        if (temPlanoAtivo && planoAtivo.value?.id) {
          const planoId = planoAtivo.value.id;
          fatura = await createFatura({
            paciente_id: pacienteId,
            tipo: "plano" as const,
            consulta_id: null,
            plano_id: planoId,
          });
          
          toast({
            title: "Sucesso",
            description: `Consulta concluída e fatura gerada para o plano ativo #${planoId}`,
          });
        } 
        else if (planoRecemConcluido) {
          // Create invoice for recently completed plan
          fatura = await createFatura({
            paciente_id: pacienteId,
            tipo: "plano" as const,
            consulta_id: null,
            plano_id: planoRecemConcluido.id,
          });
          
          toast({
            title: "Sucesso",
            description: `Consulta concluída e fatura gerada para o plano recém-concluído #${planoRecemConcluido.id}`,
          });
        } 
        else {
          // Create invoice for the consultation
          fatura = await createFatura({
            paciente_id: pacienteId,
            tipo: "consulta" as const,
            consulta_id: consultaId,
            plano_id: null,
          });
          
          toast({
            title: "Sucesso",
            description: "Consulta concluída e fatura de consulta gerada com sucesso",
          });
        }

        if (!fatura) {
          toast({
            title: "Atenção",
            description: "Consulta concluída, mas não foi possível gerar a fatura automaticamente",
            variant: "default",
          });
        }
      } catch (faturaError) {
        console.error("Erro ao gerar fatura:", faturaError);

        toast({
          title: "Atenção",
          description: "Consulta concluída, mas houve um erro ao gerar a fatura",
          variant: "default",
        });
      }
    }
  } catch (error) {
    console.error("Erro ao concluir consulta:", error);

    toast({
      title: "Erro",
      description: "Ocorreu um erro ao concluir a consulta",
      variant: "destructive",
    });
  }
}

function abrirEditarOrcamento(orcamento: Orcamento) {
  const consultaId = Number(route.params.consultaId);
  router.push(`/doctor/consulta/${consultaId}/orcamento/${orcamento.id}`);
}

async function criarNovoOrcamento() {
  if (!currentConsulta.value?.paciente?.id) {
    toast({
      title: "Erro",
      description: "Não foi possível identificar o paciente da consulta",
      variant: "destructive",
    });
    return;
  }

  try {
    creatingOrcamento.value = true;

    const entidadeId =
      currentConsulta.value.entidade?.id ||
      (entidades.value.length > 0 ? entidades.value[0].id : null);

    if (!entidadeId) {
      toast({
        title: "Atenção",
        description:
          "Não foi possível identificar uma entidade. O orçamento será criado sem entidade associada.",
        variant: "default",
      });
    }

    const novoOrcamento = await createOrcamento(
      currentConsulta.value.paciente.id,
      entidadeId || 0
    );

    if (novoOrcamento) {
      fetchOrcamentosByPaciente(currentConsulta.value.paciente.id);

      const consultaId = Number(route.params.consultaId);
      router.push(`/doctor/consulta/${consultaId}/orcamento/${novoOrcamento}`);

      toast({
        title: "Sucesso",
        description: `Orçamento #${novoOrcamento} criado com sucesso`,
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
  }
}

async function atualizarStatusOrcamento(
  orcamentoId: number,
  novoEstado: "aprovado" | "rejeitado"
) {
  try {
    // Mostrar feedback de carregamento
    toast({
      title: "Processando",
      description: `Atualizando status do orçamento...`,
    });

    // Chamar o composable para atualizar o status
    await updateOrcamentoStatus(orcamentoId, novoEstado);

    // Atualizar a lista de orçamentos
    if (currentConsulta.value?.paciente?.id) {
      await fetchOrcamentosByPaciente(currentConsulta.value.paciente.id);
    }

    // Mostrar feedback de sucesso
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

    // Mostrar feedback de erro
    toast({
      title: "Erro",
      description: `Ocorreu um erro ao ${
        novoEstado === "aprovado" ? "aprovar" : "rejeitar"
      } o orçamento`,
      variant: "destructive",
    });
  }
}

function aprovarOrcamento(id: number) {
  atualizarStatusOrcamento(id, "aprovado");
}

function rejeitarOrcamento(id: number) {
  atualizarStatusOrcamento(id, "rejeitado");
}

function abrirAdicionarItem() {
  // abre modal ou rota para novo item
}

function verConsulta(id: number) {
  // Se for a consulta atual, apenas muda a aba para artigos
  if (id === Number(route.params.consultaId)) {
    activeTab.value = "artigos";
    return;
  }

  // Se for outra consulta, navega para ela
  router.push(`/doctor/consulta/${id}`);
}

async function startProcedimentItem(item: number) {
  if (!currentConsulta.value?.id) {
    toast({
      title: "Erro",
      description:
        "Não foi possível iniciar o procedimento. Consulta não encontrada.",
      variant: "destructive",
    });
    return;
  }

  try {
    toast({
      title: "Processando",
      description: "Iniciando procedimento...",
    });

    const result = await startProcedimento(item, currentConsulta.value.id);

    if (result) {
      toast({
        title: "Sucesso",
        description: "Procedimento iniciado com sucesso",
      });

      await Promise.all([
        getConsulta(currentConsulta.value.id),
        currentConsulta.value.paciente?.id &&
          fetchPlanoAtivo(currentConsulta.value.paciente.id),
      ]);
    } else {
      toast({
        title: "Erro",
        description:
          "Não foi possível iniciar o procedimento. Tente novamente.",
        variant: "destructive",
      });
    }
  } catch (err) {
    const errorMessage =
      err instanceof Error
        ? err.message
        : "Ocorreu um erro ao iniciar o procedimento";

    console.error("Erro ao iniciar procedimento:", err);
    toast({
      title: "Erro",
      description: errorMessage,
      variant: "destructive",
    });
  }
}
</script>
<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
