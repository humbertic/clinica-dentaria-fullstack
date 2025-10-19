<script setup lang="ts">
import { useToast } from "@/components/ui/toast";

// Importar composables reais
import { useArtigos } from "~/composables/useArtigos";
import { useTabelas } from "~/composables/useTabelas";
import {useCategorias } from "~/composables/useCategorias";
import type { Artigo } from "~/types/artigo";
import type { Categoria } from "~/types/categoria";
import type { OrcamentoItemRead, OrcamentoItemCreate } from "~/types/orcamento";

const props = defineProps<{
  show: boolean;
  entidadeId?: number;
  editItem?: OrcamentoItemRead;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "save", item: OrcamentoItemCreate): void;
  (e: "update", itemId: number, data: Partial<OrcamentoItemRead>): void;
}>();

// Estado do formulário
const selectedCategoriaId = ref<number | null>(null);
const selectedArtigoId = ref<number | null>(null);
const selectedDente = ref<number | undefined>(undefined);
const selectedFace = ref<string[] | undefined>(undefined);
const quantidade = ref(1);
const precoEntidade = ref(0);
const precoPaciente = ref(0);
const loading = ref(false);

// Toast para feedback
const { toast } = useToast();

// Composables para dados
const { artigos, fetchArtigos, loadingArtigos } = useArtigos();
const { categorias, fetchCategorias, loading: loadingCategorias } = useCategorias();
const { getPrecoArtigo } = useTabelas();

// Modo de edição
const editMode = computed(() => !!props.editItem);

const filteredArtigos = computed(() => {
  if (!selectedCategoriaId.value) return artigos.value;
  return artigos.value.filter(a => a.categoria.id === selectedCategoriaId.value);
});

// Artigo selecionado
const selectedArtigo = computed(() => {
  if (!selectedArtigoId.value) return null;
  return artigos.value.find((a) => a.id === selectedArtigoId.value) || null;
});

// Resetar formulário - MOVIDO PARA ANTES DO WATCHER
const resetForm = () => {
  selectedCategoriaId.value = null;
  selectedArtigoId.value = null;
  selectedDente.value = undefined;
  selectedFace.value = undefined;
  quantidade.value = 1;
  precoEntidade.value = 0;
  precoPaciente.value = 0;
};

// Carregar dados necessários
onMounted(async () => {
  loading.value = true;
  try {
    await Promise.all([
      fetchArtigos(),
      fetchCategorias()
    ]);
  } catch (error) {
    toast({
      title: "Erro",
      description: "Não foi possível carregar os dados necessários",
      variant: "destructive",
    });
    console.error("Erro ao carregar dados:", error);
  } finally {
    loading.value = false;
  }
});

// Validação do formulário
const isFormValid = computed(() => {
  if (!selectedArtigoId.value || quantidade.value < 1) return false;

  if (selectedArtigo.value) {
    if (selectedArtigo.value.requer_dente && !selectedDente.value) return false;
    if (selectedArtigo.value.requer_face && !selectedFace.value) return false;
  }

  return true;
});


watch(selectedCategoriaId, () => {
  selectedArtigoId.value = null;
});

// Atualizar preços quando o artigo ou entidade mudar
watch(
  [selectedArtigoId, () => props.entidadeId],
  async () => {
    if (selectedArtigoId.value && props.entidadeId) {
      try {
        // Tente encontrar o preço diretamente no artigo selecionado
        if (selectedArtigo.value) {
          const precoDireto = selectedArtigo.value.precos.find(
            (p) => p.entidade.id === props.entidadeId
          );

          if (precoDireto) {
            precoEntidade.value = parseFloat(precoDireto.valor_entidade);
            precoPaciente.value = parseFloat(precoDireto.valor_paciente);
            return;
          }
        }

        // Se não encontrou diretamente, busca via API
        const precoInfo = await getPrecoArtigo(
          selectedArtigoId.value,
          props.entidadeId
        );
        if (precoInfo) {
          precoEntidade.value = precoInfo.preco_entidade;
          precoPaciente.value = precoInfo.preco_paciente;
        } else {
          precoEntidade.value = 0;
          precoPaciente.value = 0;
        }
      } catch (error) {
        toast({
          title: "Aviso",
          description: "Não foi possível obter o preço para este procedimento",
          variant: "destructive",
        });
        precoEntidade.value = 0;
        precoPaciente.value = 0;
      }
    } else {
      precoEntidade.value = 0;
      precoPaciente.value = 0;
    }
  },
  { immediate: true }
);

// Preencher formulário com dados do item em edição
watch(
  () => props.editItem,
  (item) => {
    if (item) {
      selectedArtigoId.value = item.artigo_id;
      selectedDente.value = item.numero_dente || undefined;

      // Handle the face correctly - ensure it's an array
      if (item.face) {
        // If it's already an array, use it, otherwise wrap it in an array
        selectedFace.value = Array.isArray(item.face) ? item.face : [item.face];
      } else {
        selectedFace.value = undefined;
      }

      quantidade.value = 1;
      precoEntidade.value =
        typeof item.preco_entidade === "string"
          ? parseFloat(item.preco_entidade)
          : item.preco_entidade;
      precoPaciente.value =
        typeof item.preco_paciente === "string"
          ? parseFloat(item.preco_paciente)
          : item.preco_paciente;
    } else {
      resetForm();
    }
  },
  { immediate: true }
);

// Fechar modal
const onClose = () => {
  emit("close");
  resetForm();
};

// Salvar procedimento
const handleSave = () => {
  if (!isFormValid.value) return;

  if (editMode.value && props.editItem) {
    // Modo de edição
    emit("update", props.editItem.id, {
      artigo_id: selectedArtigoId.value!,
      numero_dente: selectedDente.value || undefined,
      face: selectedFace.value || undefined,
      quantidade: 1,
      preco_entidade: precoEntidade.value,
      preco_paciente: precoPaciente.value,
    });
  } else {
    // Modo de adição
    emit("save", {
      artigo_id: selectedArtigoId.value!,
      numero_dente: selectedDente.value || undefined,
      face: selectedFace.value || undefined,
      quantidade: 1,
      preco_entidade: precoEntidade.value,
      preco_paciente: precoPaciente.value,
    });
  }

  onClose();
};
</script>

<template>
  <Dialog :open="show" @update:open="onClose">
    <DialogContent
      class="w-[95vw] max-w-[95vw] sm:max-w-[700px] md:max-w-[800px] lg:max-w-[900px] p-0 max-h-[90vh] flex flex-col overflow-hidden"
    >
      <!-- Fixed Header -->
      <DialogHeader class="p-4 sm:p-6">
        <DialogTitle
          >{{ editMode ? "Editar" : "Adicionar" }} Procedimento</DialogTitle
        >
        <DialogDescription class="text-sm sm:text-base">
          Preencha os detalhes do procedimento a
          {{ editMode ? "editar no" : "adicionar ao" }} orçamento.
        </DialogDescription>
      </DialogHeader>

      <!-- Scrollable Content Area -->
      <div class="overflow-y-auto flex-1 p-4 sm:p-6 pt-0 sm:pt-0">
        <div class="grid gap-3 sm:gap-4 py-3 sm:py-4">
          <!-- Loading state -->
          <div
            v-if="loading"
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
            <!-- Form content (unchanged) -->
              <!-- Categoria (new) -->
          <div class="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4 p-4">
            <Label for="categoria" class="sm:text-right mb-1 sm:mb-0">Categoria</Label>
            <div class="col-span-1 sm:col-span-3">
              <Select
                v-model="selectedCategoriaId"
                :disabled="editMode || disabled || loadingCategorias"
              >
                <SelectTrigger class="w-full">
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
            <!-- Artigo -->
            <div
              class="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4 p-4"
            >
              <Label for="artigo" class="sm:text-right mb-1 sm:mb-0"
                >Artigo</Label
              >
              <div class="col-span-1 sm:col-span-3">
                <Select
                v-model="selectedArtigoId"
                :disabled="editMode || disabled || loadingArtigos"
              >
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Selecione um procedimento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem
                      v-for="artigo in filteredArtigos"
                      :key="artigo.id"
                      :value="artigo.id"
                    >
                      {{ artigo.codigo }} - {{ artigo.descricao }}
                    </SelectItem>
                  </SelectGroup>
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
                  v-model="selectedDente"
                  :disabled="disabled"
                  class="scale-90 sm:scale-100 origin-top"
                />
              </div>
            </div>

            <!-- Face (se necessário) -->
            <div
              v-if="
                selectedArtigo && selectedArtigo.requer_face && selectedDente
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
                  v-model="selectedFace"
                  :dente-id="selectedDente"
                  :disabled="disabled"
                  multiSelect
                  class="scale-90 sm:scale-100 origin-top"
                />
              </div>
            </div>

            <!-- Preços unitários -->
            <div
              class="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4 mt-2 sm:mt-0 p-2"
            >
              <Label class="sm:text-right mb-1 sm:mb-0"
                >Preço Seguradora (CVE)</Label
              >
              <div class="col-span-1 sm:col-span-3">
                <Input
                  v-model.number="precoEntidade"
                  type="number"
                  step="0.01"
                  min="0"
                  readonly
                  class="w-full"
                />
              </div>
            </div>

            <div
              class="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4 mt-2 sm:mt-0 p-2"
            >
              <Label class="sm:text-right mb-1 sm:mb-0"
                >Preço Paciente (CVE)</Label
              >
              <div class="col-span-1 sm:col-span-3">
                <Input
                  v-model.number="precoPaciente"
                  type="number"
                  step="0.01"
                  min="0"
                  readonly
                  class="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Fixed Footer -->
      <DialogFooter
        class="flex-col sm:flex-row gap-2 sm:gap-2 p-4 sm:p-6 border-t "
      >
        <Button variant="outline" class="w-full sm:w-auto" @click="onClose"
          >Cancelar</Button
        >
        <Button
          @click="handleSave"
          :disabled="!isFormValid || disabled || loading"
          class="w-full sm:w-auto"
        >
          {{ editMode ? "Atualizar" : "Adicionar" }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
