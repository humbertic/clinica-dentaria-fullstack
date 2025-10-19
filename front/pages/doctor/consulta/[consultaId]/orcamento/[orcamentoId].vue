<template>
  <div>
    <div class="container p-6 space-y-6">
      <!-- Header com botões de navegação -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-2">
          <Button variant="outline" size="sm" @click="voltarParaConsulta">
            <ArrowLeft class="w-4 h-4 mr-2" />
            Voltar para Consulta
          </Button>
          <h1 class="text-2xl font-bold">
            {{ isLoading ? "Carregando..." : isNew ? "Novo Orçamento" : `Orçamento #${orcamentoId}` }}
          </h1>
        </div>
        
        <div class="flex gap-2">
          
          <Button 
            @click="aprovarOrcamento" 
            :disabled="isLoading || isSaving || orcamento?.estado === 'aprovado'"
          >
            <Check class="w-4 h-4 mr-2" />
            Aprovar
          </Button>
        </div>
      </div>
      
      <!-- Loading state -->
      <div v-if="isLoading" class="flex justify-center p-12">
        <div class="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
      
      <!-- Main content -->
      <div v-else-if="orcamento" class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Coluna 1: Informações do orçamento -->
        <Card class="md:col-span-1">
          <CardHeader>
            <CardTitle>Informações</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div>
              <Label>Paciente</Label>
              <div class="p-2 border rounded-md bg-muted/50">
                {{ getPacienteNome(orcamento) }}
              </div>
            </div>
            
            <div>
              <Label>Entidade</Label>
              <Select v-model="orcamento.entidade_id">
                <SelectTrigger>
                  <SelectValue :placeholder="getEntidadeNome(orcamento)" />
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
              <Label>Data</Label>
              <Input 
                type="date" 
                v-model="orcamento.data" 
                :disabled="orcamento.estado === 'aprovado'"
              />
            </div>
            
            <div>
              <Label>Observações</Label>
              <Textarea 
                v-model="orcamento.observacoes" 
                placeholder="Observações sobre o orçamento"
                :disabled="orcamento.estado === 'aprovado'"
              />
            </div>
            
            <div>
              <Label>Estado</Label>
              <Badge 
                :class="{
                  'bg-gray-100 text-gray-800 ml-2': orcamento.estado === 'rascunho',
                  'bg-green-100 text-green-800 ml-2': orcamento.estado === 'aprovado',
                  'bg-red-100 text-red-800 ml-2': orcamento.estado === 'rejeitado'
                }"
              >
                {{ getEstadoLabel(orcamento.estado) }}
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <!-- Coluna 2: Itens do orçamento -->
        <Card class="md:col-span-2">
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Procedimentos</CardTitle>
            <Button 
              size="sm" 
              @click="abrirModalAdicionarItem"
              :disabled="orcamento.estado === 'aprovado'"
            >
              <Plus class="w-4 h-4 mr-2" />
              Adicionar
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Procedimento</TableHead>
                  <TableHead>Dente</TableHead>
                  <TableHead>Faces</TableHead>
                  <TableHead class="text-right">Qtd</TableHead>
                  <TableHead class="text-right">Seg.</TableHead>
                  <TableHead class="text-right">Pac.</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-if="!orcamento.itens?.length">
                  <TableCell colspan="8" class="text-center py-4 text-muted-foreground">
                    Nenhum procedimento adicionado
                  </TableCell>
                </TableRow>
                <TableRow v-for="item in orcamento.itens" :key="item.id">
                  <TableCell>{{ item.artigo?.codigo }}</TableCell>
                  <TableCell>{{ item.artigo?.descricao }}</TableCell>
                  <TableCell>{{ item.numero_dente || '—' }}</TableCell>
                  <TableCell>{{ item.face?.join(', ') || '—' }}</TableCell>
                  <TableCell class="text-right">{{ item.quantidade }}</TableCell>
                  <TableCell class="text-right">{{ formatCurrency(item.preco_entidade) }}</TableCell>
                  <TableCell class="text-right">{{ formatCurrency(item.preco_paciente) }}</TableCell>
                  <TableCell>
                    <div class="flex gap-1 justify-end">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        @click="editarItem(item)"
                        :disabled="orcamento.estado === 'aprovado'"
                      >
                        <Pencil class="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        @click="removerItem(item.id)"
                        :disabled="orcamento.estado === 'aprovado'"
                      >
                        <Trash2 class="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colspan="5">Total</TableCell>
                  <TableCell class="text-right">{{ formatCurrency(orcamento.total_entidade) }}</TableCell>
                  <TableCell class="text-right">{{ formatCurrency(orcamento.total_paciente) }}</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Componente Modal para adicionar/editar item -->
    <OrcamentosAddProcedureModal
      :show="showAddItemModal"
      :entidade-id="orcamento?.entidade_id"
      :edit-item="itemEmEdicao"
      :disabled="orcamento?.estado === 'aprovado'"
      @close="fecharModalItem"
      @save="adicionarItemComComponente"
      @update="atualizarItemComComponente"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from '@/components/ui/toast';
import { useOrcamentos } from '~/composables/useOrcamentos';
import { usePacientes } from '~/composables/usePacientes';
import { useEntidades } from '~/composables/useEntidades';
import { useArtigos } from '~/composables/useArtigos';
import { 
  ArrowLeft, 
  Check, 
  Save, 
  Plus, 
  Trash2,
  Pencil
} from 'lucide-vue-next';
import type { Orcamento, AddItemOrcamentoDTO, OrcamentoItemRead } from '~/types/orcamento';
import OrcamentosAddProcedureModal from '@/components/orcamentos/AddProcedureModal.vue';

// Route and navigation
const route = useRoute();
const router = useRouter();
const { toast } = useToast();

// Extract route params
const consultaId = computed(() => Number(route.params.consultaId));
const orcamentoId = computed(() => Number(route.params.orcamentoId));
const isNew = computed(() => orcamentoId.value === 0);

// Inicializar composables - usando o composable useOrcamentos
const { 
  fetchOrcamentoById, 
  updateOrcamento,
  updateOrcamentoStatus,
  addItemToOrcamento,
  deleteItemFromOrcamento,
  loading: loadingOrcamento,
  error: errorOrcamento
} = useOrcamentos();

const { pacientes, fetchPacientes } = usePacientes();
const { entidades, fetchEntidades } = useEntidades();
const { artigos, fetchArtigos } = useArtigos();

// Estado local
const orcamento = ref<Orcamento | null>(null);
const isLoading = ref(true);
const isSaving = ref(false);
const showAddItemModal = ref(false);
const itemEmEdicao = ref<OrcamentoItemRead | undefined>(undefined);

// Form state for new item (mantido para compatibilidade)
const novoItem = ref({
  artigo_id: null as number | null,
  numero_dente: null as number | null,
  quantidade: 1,
  preco_entidade: 0,
  preco_paciente: 0,
  observacoes: ''
});

const facesSelecionadas = ref({
  V: false,
  L: false,
  M: false,
  D: false,
  O: false,
  I: false
});

const facesDescricao = {
  V: 'Vestibular',
  L: 'Lingual',
  M: 'Mesial',
  D: 'Distal',
  O: 'Oclusal',
  I: 'Incisal'
};

// Load data
onMounted(async () => {
  try {
    isLoading.value = true;
    
    // Load master data
    await Promise.all([
      fetchEntidades(),
      fetchPacientes(),
      fetchArtigos()
    ]);
    
    // Load the orçamento
    if (!isNew.value) {
      const data = await fetchOrcamentoById(orcamentoId.value);
      if (data) {
        orcamento.value = data;
      } else {
        toast({
          title: "Erro",
          description: "Orçamento não encontrado",
          variant: "destructive"
        });
        voltarParaConsulta();
      }
    }
  } catch (error) {
    console.error("Erro ao carregar dados:", error);
    toast({
      title: "Erro",
      description: "Ocorreu um erro ao carregar os dados",
      variant: "destructive"
    });
  } finally {
    isLoading.value = false;
  }
});

// Helper functions
function formatCurrency(value: number | string) {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('cv-CV', {
    style: 'currency',
    currency: 'CVE',
  }).format(num);
}

function getPacienteNome(orcamento: Orcamento) {
  if (orcamento.paciente?.nome) {
    return orcamento.paciente.nome;
  }
  const paciente = pacientes.value.find(p => p.id === orcamento.paciente_id);
  return paciente ? paciente.nome : `Paciente ID: ${orcamento.paciente_id}`;
}

function getEntidadeNome(orcamento: Orcamento) {
  if (orcamento.entidade?.nome) {
    return orcamento.entidade.nome;
  }
  const entidade = entidades.value.find(e => e.id === orcamento.entidade_id);
  return entidade ? entidade.nome : `Entidade ID: ${orcamento.entidade_id}`;
}

function getEstadoLabel(estado: string) {
  switch (estado) {
    case 'rascunho': return 'Rascunho';
    case 'aprovado': return 'Aprovado';
    case 'rejeitado': return 'Rejeitado';
    default: return estado;
  }
}

// Action handlers
function voltarParaConsulta() {
  router.push(`/doctor/consulta/${consultaId.value}`);
}

async function salvarComoRascunho() {
  if (!orcamento.value) return;
  
  try {
    isSaving.value = true;
    
    // Update the orçamento with current values
    await updateOrcamento(orcamentoId.value, {
      entidade_id: orcamento.value.entidade_id,
      data: orcamento.value.data,
      observacoes: orcamento.value.observacoes
    });
    
    toast({
      title: "Sucesso",
      description: "Orçamento salvo como rascunho"
    });
  } catch (error) {
    console.error("Erro ao salvar orçamento:", error);
    toast({
      title: "Erro",
      description: "Ocorreu um erro ao salvar o orçamento",
      variant: "destructive"
    });
  } finally {
    isSaving.value = false;
  }
}

async function aprovarOrcamento() {
  if (!orcamento.value) return;
  
  try {
    isSaving.value = true;
    
    // First save any changes
    await updateOrcamento(orcamentoId.value, {
      entidade_id: orcamento.value.entidade_id,
      data: orcamento.value.data,
      observacoes: orcamento.value.observacoes
    });
    
    // Then update status
    await updateOrcamentoStatus(orcamentoId.value, 'aprovado');
    
    // Refresh the orçamento data
    const updated = await fetchOrcamentoById(orcamentoId.value);
    if (updated) {
      orcamento.value = updated;
    }
    
    toast({
      title: "Sucesso",
      description: "Orçamento aprovado com sucesso"
    });
  } catch (error) {
    console.error("Erro ao aprovar orçamento:", error);
    toast({
      title: "Erro",
      description: "Ocorreu um erro ao aprovar o orçamento",
      variant: "destructive"
    });
  } finally {
    isSaving.value = false;
  }
}

// Funções para o novo componente de modal
function abrirModalAdicionarItem() {
  itemEmEdicao.value = undefined;
  showAddItemModal.value = true;
}

function fecharModalItem() {
  showAddItemModal.value = false;
  itemEmEdicao.value = undefined;
}

function editarItem(item: OrcamentoItemRead) {
  itemEmEdicao.value = item;
  showAddItemModal.value = true;
}

async function adicionarItemComComponente(item: AddItemOrcamentoDTO) {
  if (!orcamento.value) return;
  
  try {
    await addItemToOrcamento(orcamentoId.value, item);
    
    // Refresh the orçamento data
    const updated = await fetchOrcamentoById(orcamentoId.value);
    if (updated) {
      orcamento.value = updated;
    }
    
    toast({
      title: "Sucesso",
      description: "Item adicionado ao orçamento"
    });
  } catch (error) {
    console.error("Erro ao adicionar item:", error);
    toast({
      title: "Erro",
      description: "Ocorreu um erro ao adicionar o item",
      variant: "destructive"
    });
  }
}

async function atualizarItemComComponente(itemId: number, data: Partial<OrcamentoItemRead>) {
  if (!orcamento.value) return;
  
  try {
    // Como não vimos uma função específica para atualizar um item,
    // vamos remover e adicionar novamente
    await deleteItemFromOrcamento(orcamentoId.value, itemId);
    
    const newItem: AddItemOrcamentoDTO = {
      artigo_id: data.artigo_id!,
      numero_dente: data.numero_dente,
      face: data.face,
      quantidade: data.quantidade || 1,
      preco_entidade: data.preco_entidade!,
      preco_paciente: data.preco_paciente!,
      observacao: data.observacao || undefined
    };
    
    await addItemToOrcamento(orcamentoId.value, newItem);
    
    // Refresh the orçamento data
    const updated = await fetchOrcamentoById(orcamentoId.value);
    if (updated) {
      orcamento.value = updated;
    }
    
    toast({
      title: "Sucesso",
      description: "Item atualizado com sucesso"
    });
  } catch (error) {
    console.error("Erro ao atualizar item:", error);
    toast({
      title: "Erro",
      description: "Ocorreu um erro ao atualizar o item",
      variant: "destructive"
    });
  }
}

// Função original mantida para compatibilidade
async function adicionarItem() {
  if (!orcamento.value || !novoItem.value.artigo_id) return;
  
  try {
    // Prepare faces array
    const faces = Object.entries(facesSelecionadas.value)
      .filter(([_, selected]) => selected)
      .map(([face]) => face);
    
    // Usar o método do composable
    const payload: AddItemOrcamentoDTO = {
      artigo_id: novoItem.value.artigo_id,
      numero_dente: novoItem.value.numero_dente || undefined,
      quantidade: novoItem.value.quantidade || 1,
      face: faces.length ? faces : undefined,
      preco_entidade: novoItem.value.preco_entidade,
      preco_paciente: novoItem.value.preco_paciente,
      observacao: novoItem.value.observacoes || undefined
    };
    
    await addItemToOrcamento(orcamentoId.value, payload);
    
    // Refresh the orçamento data
    const updated = await fetchOrcamentoById(orcamentoId.value);
    if (updated) {
      orcamento.value = updated;
    }
    
    showAddItemModal.value = false;
    toast({
      title: "Sucesso",
      description: "Item adicionado ao orçamento"
    });
  } catch (error) {
    console.error("Erro ao adicionar item:", error);
    toast({
      title: "Erro",
      description: "Ocorreu um erro ao adicionar o item",
      variant: "destructive"
    });
  }
}

async function removerItem(itemId: number) {
  
  try {
    // Usar o método do composable
    await deleteItemFromOrcamento(orcamentoId.value, itemId);
    
    // Refresh the orçamento data
    const updated = await fetchOrcamentoById(orcamentoId.value);
    if (updated) {
      orcamento.value = updated;
    }
    
    toast({
      title: "Sucesso",
      description: "Item removido do orçamento"
    });
  } catch (error) {
    console.error("Erro ao remover item:", error);
    toast({
      title: "Erro",
      description: "Ocorreu um erro ao remover o item",
      variant: "destructive"
    });
  }
}
</script>