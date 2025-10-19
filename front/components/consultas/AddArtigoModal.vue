<template>
  <Dialog :open="show" @update:open="close">
    <DialogContent
      class="w-[95vw] max-w-[95vw] sm:max-w-[700px] md:max-w-[800px] lg:max-w-[900px] p-0 max-h-[90vh] flex flex-col overflow-hidden"
    >
      <!-- Header remains the same -->
      <DialogHeader class="p-4 sm:p-6">
        <DialogTitle>
          {{ editItem ? "Editar" : "Adicionar" }} Procedimento
        </DialogTitle>
        <DialogDescription class="text-sm sm:text-base">
          {{
            editItem
              ? "Atualize os detalhes do procedimento"
              : "Preencha os detalhes do procedimento a ser adicionado"
          }}
        </DialogDescription>
      </DialogHeader>

      <!-- Scrollable Content Area -->
      <div class="overflow-y-auto flex-1 p-4 sm:p-6 pt-0 sm:pt-0">
        <div class="grid gap-3 sm:gap-4 py-3 sm:py-4">
          <!-- Loading state -->
          <div
            v-if="loading || artigosLoading"
            class="flex flex-col items-center justify-center py-4 sm:py-6"
          >
            <div
              class="animate-spin h-6 w-6 sm:h-8 sm:w-8 border-3 sm:border-4 border-primary border-t-transparent rounded-full mb-3 sm:mb-4"
            ></div>
            <p class="text-sm sm:text-base text-muted-foreground">
              Carregando dados...
            </p>
          </div>

          <div v-else>
            <div
              class="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4 p-4"
            >
              <Label class="sm:text-right mb-1 sm:mb-0" for="categoria"
                >Categoria</Label
              >
              <div class="col-span-1 sm:col-span-3">
                <Select
                  v-model="selectedCategoriaId"
                  :disabled="loading || disabled"
                >
                  <SelectTrigger id="categoria" class="w-full">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem :value="null">Todas as categorias</SelectItem>
                    <SelectGroup>
                      <SelectItem
                        v-for="categoria in categorias"
                        :key="categoria.id"
                        :value="categoria.id"
                      >
                        {{ categoria.nome }}
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <!-- Artigo (Procedimento) -->
            <div
              class="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4 p-4"
            >
              <Label class="sm:text-right mb-1 sm:mb-0" for="artigo"
                >Procedimento</Label
              >
              <div class="col-span-1 sm:col-span-3">
                <Select
                  v-model="form.artigo_id"
                  :disabled="loading || disabled"
                  required
                >
                  <SelectTrigger id="artigo" class="w-full">
                    <SelectValue placeholder="Selecione um procedimento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      v-for="artigo in filteredArtigos"
                      :key="artigo.id"
                      :value="artigo.id"
                    >
                      {{ artigo.codigo }} - {{ artigo.descricao }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <!-- Dente (se necessário) -->
            <div
              v-if="selectedArtigo && selectedArtigo.requer_dente"
              class="grid grid-cols-1 sm:grid-cols-4 items-start gap-2 sm:gap-4 mt-2 sm:mt-0 p-4"
            >
              <Label class="sm:text-right mb-1 sm:mb-0 pt-0 sm:pt-2"
                >Dente</Label
              >
              <div
                class="col-span-1 sm:col-span-3 flex justify-center sm:justify-start"
              >
                <OdontogramaToothMap
                  v-model="form.numero_dente"
                  :disabled="disabled"
                  class="scale-90 sm:scale-100 origin-top"
                />
              </div>
            </div>

            <!-- Face (se necessário) -->
            <div
              v-if="
                selectedArtigo &&
                selectedArtigo.requer_face &&
                form.numero_dente
              "
              class="grid grid-cols-1 sm:grid-cols-4 items-start gap-2 sm:gap-4 mt-2 sm:mt-0 p-4"
            >
              <Label class="sm:text-right mb-1 sm:mb-0 pt-0 sm:pt-2"
                >Face</Label
              >
              <div
                class="col-span-1 sm:col-span-3 flex justify-center sm:justify-start"
              >
                <OdontogramaFaceSelector
                  v-model="selectedFaces"
                  :dente-id="form.numero_dente"
                  :disabled="disabled"
                  multiSelect
                  class="scale-90 sm:scale-100 origin-top"
                />
              </div>
            </div>

            <!-- Preços - atualizado para mostrar ambos os preços -->
            <div
              class="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4 p-4"
            >
              <Label class="sm:text-right mb-1 sm:mb-0"
                >Preço Seguradora (CVE)</Label
              >
              <div class="col-span-1 sm:col-span-3">
                <Input
                  v-model.number="form.preco_entidade"
                  type="number"
                  step="0.01"
                  min="0"
                  readonly
                  class="w-full"
                />
              </div>
            </div>

            <div
              class="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4 p-4"
            >
              <Label class="sm:text-right mb-1 sm:mb-0"
                >Preço Paciente (CVE)</Label
              >
              <div class="col-span-1 sm:col-span-3">
                <Input
                  v-model.number="form.preco_paciente"
                  type="number"
                  step="0.01"
                  min="0"
                  readonly
                  class="w-full"
                />
              </div>
            </div>

            <!-- Observações -->
            <div
              class="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4 p-4"
            >
              <Label class="sm:text-right mb-1 sm:mb-0" for="observacoes"
                >Observações</Label
              >
              <div class="col-span-1 sm:col-span-3">
                <Textarea
                  id="observacoes"
                  v-model="form.observacoes"
                  class="w-full"
                  :disabled="loading || disabled"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Fixed Footer -->
      <DialogFooter
        class="flex-col sm:flex-row gap-2 sm:gap-2 p-4 sm:p-6 border-t"
      >
        <Button
          variant="outline"
          class="w-full sm:w-auto"
          @click="close"
          :disabled="loading"
          >Cancelar</Button
        >
        <Button
          @click="salvar"
          :disabled="!isFormValid || loading || disabled"
          class="w-full sm:w-auto"
        >
          {{ editItem ? "Atualizar" : "Adicionar" }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useArtigos } from "~/composables/useArtigos";
import { useTabelas } from "~/composables/useTabelas";
import { useCategorias } from "~/composables/useCategorias"; 
import { useToast } from "@/components/ui/toast";
import type {
  ConsultaItemRead,
  ConsultaItemCreate,
  ConsultaItemUpdate,
} from "~/types/consulta";
import type { Artigo } from "~/types/artigo";

// Props
interface Props {
  show: boolean;
  editItem?: ConsultaItemRead;
  disabled?: boolean;
  entidadeId?: number; // Nova prop para o ID da entidade
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  editItem: undefined,
  disabled: false,
  entidadeId: undefined,
});

// Emits
const emit = defineEmits<{
  close: [];
  save: [item: ConsultaItemCreate];
  update: [id: number, item: ConsultaItemUpdate];
}>();

// Composables
const { artigos, fetchArtigos, loading: artigosLoading } = useArtigos();
const { categorias, fetchCategorias, loading: categoriasLoading } = useCategorias(); 
const { getPrecoArtigo } = useTabelas();
const { toast } = useToast();

// Local state
const selectedCategoriaId = ref<number | null>(null);
const loading = ref(false);
const form = ref<{
  artigo_id: number | null;
  numero_dente: number | undefined;
  quantidade: number | null;
  preco_entidade: number;
  preco_paciente: number;
  observacoes?: string;
}>({
  artigo_id: null,
  numero_dente: undefined,
  quantidade: 1,
  preco_entidade: 0,
  preco_paciente: 0,
  observacoes: "",
});



// Para o odontograma
const selectedFaces = ref<string[]>([]);

const filteredArtigos = computed(() => {
  if (!selectedCategoriaId.value) return artigos.value;
  return artigos.value.filter(a => a.categoria?.id === selectedCategoriaId.value);
});

// Computed
const isFormValid = computed(() => {
  if (!form.value.artigo_id) return false;
  if (form.value.quantidade < 1) return false;

  // Validar campos obrigatórios baseados no artigo selecionado
  if (selectedArtigo.value) {
    if (selectedArtigo.value.requer_dente && !form.value.numero_dente)
      return false;
    if (selectedArtigo.value.requer_face && !selectedFaces.value.length)
      return false;
  }

  return true;
});

// Artigo selecionado para validações
const selectedArtigo = computed<Artigo | undefined>(() => {
  if (!form.value.artigo_id) return undefined;
  return artigos.value.find((a) => a.id === form.value.artigo_id);
});

// Watch for changes in edit item
watch(
  () => props.editItem,
  (newItem) => {
    if (newItem) {
      // Set form data from edit item
      console.log("Edit item:", newItem);
      form.value = {
        artigo_id: newItem.artigo_id,
        numero_dente: newItem.numero_dente || undefined,
        quantidade: newItem.quantidade || 1,
        preco_entidade: newItem.preco_entidade || 0,
        preco_paciente: newItem.preco_paciente || 0,
        observacoes: newItem.observacoes || "",
      };

      // Set selected faces for odontograma
      selectedFaces.value = newItem.face || [];
    } else {
      // Reset form for new item
      resetForm();
    }
  },
  { immediate: true }
);

watch(
  [() => form.value.artigo_id, () => props.entidadeId],
  async ([artigoId, entidadeId]) => {
    console.log("Watch triggered with:", { artigoId, entidadeId }); // Debug log

    if (artigoId && entidadeId) {
      loading.value = true;
      try {
        // Tente encontrar o preço diretamente no artigo selecionado
        if (selectedArtigo.value) {
          console.log("Selected artigo:", selectedArtigo.value); // Debug log
          console.log("Searching for price with entidade:", entidadeId);

          const precoDireto = selectedArtigo.value.precos?.find(
            (p) => p.entidade.id === entidadeId
          );

          if (precoDireto) {
            console.log("Found direct price:", precoDireto); // Debug log
            form.value.preco_entidade = parseFloat(
              String(precoDireto.valor_entidade)
            );
            form.value.preco_paciente = parseFloat(
              String(precoDireto.valor_paciente)
            );
            return;
          }
        }

        // Se não encontrou diretamente, busca via API
        console.log(
          "Fetching price from API for artigo:",
          artigoId,
          "entidade:",
          entidadeId
        );
        const precoInfo = await getPrecoArtigo(artigoId, entidadeId);
        console.log("API response:", precoInfo); // Debug log

        if (precoInfo) {
          form.value.preco_entidade = precoInfo.preco_entidade;
          form.value.preco_paciente = precoInfo.preco_paciente;
        } else {
          form.value.preco_entidade = 0;
          form.value.preco_paciente = 0;
          toast({
            title: "Aviso",
            description: "Preço não definido para este procedimento e entidade",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Erro ao obter preço:", error);
        toast({
          title: "Aviso",
          description: "Não foi possível obter o preço para este procedimento",
          variant: "destructive",
        });
        form.value.preco_entidade = 0;
        form.value.preco_paciente = 0;
      } finally {
        loading.value = false;
      }
    } else {
      console.log("Missing required values for price fetch"); // Debug log
      form.value.preco_entidade = 0;
      form.value.preco_paciente = 0;
    }
  },
  { immediate: true } // This ensures it runs when the component mounts
);

// Methods
function resetForm() {
  form.value = {
    artigo_id: null,
    numero_dente: undefined,
    quantidade: 1,
    preco_entidade: 0,
    preco_paciente: 0,
    observacoes: "",
  };

  // Reset selected faces
  selectedFaces.value = [];
  selectedCategoriaId.value = null;
}

function close() {
  emit("close");
}

watch(selectedCategoriaId, () => {
  form.value.artigo_id = null;
});


function salvar() {
  if (!isFormValid.value) return;

  loading.value = true;

  try {
    const itemData = {
      artigo_id: form.value.artigo_id!,
      numero_dente: form.value.numero_dente,
      face: selectedFaces.value.length > 0 ? selectedFaces.value : undefined,
      quantidade: form.value.quantidade,
      preco_unitario: form.value.preco_paciente,
      preco_entidade: form.value.preco_entidade,
      preco_paciente: form.value.preco_paciente,
      observacoes: form.value.observacoes,
    };

    if (props.editItem) {
      // Update existing item
      emit("update", props.editItem.id, itemData);
    } else {
      // Create new item
      emit("save", itemData as ConsultaItemCreate);
    }
  } finally {
    loading.value = false;
  }
}

// Load data
onMounted(async () => {
  loading.value = true;
  try {
    await Promise.all([
      fetchArtigos(), 
      fetchCategorias()
    ]);
  } catch (error) {
    console.error("Erro ao carregar dados:", error);
    toast({
      title: "Erro",
      description: "Não foi possível carregar os dados necessários",
      variant: "destructive",
    });
  } finally {
    loading.value = false;
  }
});
</script>
