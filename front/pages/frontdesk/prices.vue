<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from "vue";
import { ChevronDown, ChevronLeft, ChevronRight, Check } from "lucide-vue-next";
import { useToast } from "@/components/ui/toast";
import PricesTable from "~/components/prices/TablePrices.vue";
import PricesForm from "@/components/prices/Form.vue";
import type {
  ArtigoBackend,
  ArtigoUI,
  PrecoBackend,
  PrecoUI,
  Categoria,
  Entidade,
} from "@/types/prices";
import { FormField, PricesTablePrices } from "#components";

/* ─── Estado base ──────────────────────────────────────── */
const artigos = ref<ArtigoUI[]>([]);
const categorias = ref<Categoria[]>([]);
const entidades = ref<Entidade[]>([]);

/* UI state */
const selectedCategory = ref<string>("all");
const selectedEntity = ref<string>("all");
const currentPage = ref(1);
const pageSize = ref(10);
const expandedRows = ref<number[]>([]);

const showPriceModal = ref(false);
const isEditing = ref(false);
const currentArtigo = ref<ArtigoUI | null>(null);
const currentPrice = ref<PrecoUI | null>(null);
const originalPrice = ref<PrecoUI | null>(null);

const formattedArtigos = computed(() => {
  return paginatedArtigos.value.map((artigo) => ({
    ...artigo,
    precos: artigo.precos.map((preco) => ({
      valor_entidade: preco.valor_entidade.toString(),
      valor_paciente: preco.valor_paciente.toString(),
      artigo: {
        id: artigo.id,
        descricao: artigo.descricao,
      },
      entidade: {
        id: preco.entidade.id,
        nome:
          entidades.value.find((e) => e.id === preco.entidade.id)?.nome || "",
      },
    })),
  }));
});

/* ─── Utilidades ───────────────────────────────────────── */
const { toast } = useToast();
const baseUrl = useRuntimeConfig().public.apiBase;

function authHeader() {
  const token = useCookie("token").value;
  return { Authorization: `Bearer ${token}` };
}

function formatCurrency(v: number) {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(v);
}

/* ─── Fetchers ─────────────────────────────────────────── */
async function fetchCategorias() {
  try {
    const r = await fetch(`${baseUrl}categorias`, { headers: authHeader() });
    if (!r.ok) throw new Error("Erro ao buscar Categorias");
    categorias.value = await r.json();
  } catch (e) {
    toast({
      title: "Erro ao buscar categorias",
      description: (e as Error).message,
    });
  }
}

async function fetchEntidades() {
  try {
    const r = await fetch(`${baseUrl}entidades`, { headers: authHeader() });
    if (!r.ok) throw new Error("Erro ao buscar Entidades");
    entidades.value = await r.json();
  } catch (e) {
    toast({
      title: "Erro ao buscar entidades",
      description: (e as Error).message,
    });
  }
}

async function fetchArtigos() {
  try {
    const r = await fetch(`${baseUrl}artigos`, { headers: authHeader() });
    if (!r.ok) throw new Error("Erro ao buscar Artigos");
    artigos.value = await r.json();
  } catch (e) {
    toast({
      title: "Erro ao buscar artigos",
      description: (e as Error).message,
    });
  }
}

const categoryOptions = computed(() =>
  [{ value: "all", label: "Todas as categorias" }].concat(
    categorias.value.map((c) => ({
      value: c.nome,
      label: c.nome,
    }))
  )
);
const entityOptions = computed(() =>
  [{ value: "all", label: "Todas as entidades" }].concat(
    entidades.value.map((e) => ({
      value: e.id.toString(),
      label: e.nome,
    }))
  )
);

const entidadeById = computed<Record<number, string>>(() =>
  Object.fromEntries(entidades.value.map((e) => [e.id, e.nome]))
);

const filteredArtigos = computed(() => {
  let list = [...artigos.value];
  if (selectedCategory.value !== "all")
    list = list.filter((a) => a.categoria.nome === selectedCategory.value);

  if (selectedEntity.value !== "all") {
    const eid = Number(selectedEntity.value);
    list = list.filter((a) => a.precos.some((p) => p.entidade.id === eid));
  }
  return list;
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredArtigos.value.length / pageSize.value))
);

const paginatedArtigos = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredArtigos.value.slice(start, start + pageSize.value);
});

watch(
  [selectedCategory, selectedEntity, pageSize],
  () => (currentPage.value = 1)
);
watch(totalPages, (p) => {
  if (currentPage.value > p) currentPage.value = p;
});

function toggleExpanded(id: number) {
  const i = expandedRows.value.indexOf(id);
  i === -1 ? expandedRows.value.push(id) : expandedRows.value.splice(i, 1);
}

function openAddPriceModal(artigo: ArtigoUI) {
  toast({
    title: "Adicionar Preço",
    description: `Defina o preço para ${artigo.descricao}`,
  });
}

function openEditPriceModal(artigo: ArtigoUI, preco: PrecoUI) {
  currentArtigo.value = artigo;
  originalPrice.value = { ...preco };
  currentPrice.value = { ...preco };
  isEditing.value = true;
  showPriceModal.value = true;
}

function closePriceModal() {
  showPriceModal.value = false;
}

function handleFormUpdate(val: any) {
  if (!currentPrice.value) return;

  currentPrice.value = {
    ...currentPrice.value,
    valor_entidade: val.valor_entidade,
    valor_paciente: val.valor_paciente,
    entidade: {
      ...currentPrice.value.entidade,
      id: val.entidade_id,
    },
  };
}

async function refreshAfterSave() {
  closePriceModal();
  await fetchArtigos();
}

onMounted(() => {
  fetchCategorias();
  fetchEntidades();
  fetchArtigos();
});
</script>

<template>
  <div class="container mx-auto p-4 md:p-6 space-y-6">
    <h1 class="text-2xl font-bold tracking-tight">Gestão de Preços</h1>

    <Form class="bg-card rounded-lg border shadow-sm p-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField name="categoria">
          <FormItem>
            <FormLabel>Categoria</FormLabel>
            <Select v-model="selectedCategory">
              <SelectTrigger as="button" class="w-full justify-between">
                {{
                  categoryOptions.find((o) => o.value === selectedCategory)
                    ?.label
                }}
                <ChevronDown class="ml-2 h-4 w-4 opacity-50" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem
                    v-for="opt in categoryOptions"
                    :key="opt.value"
                    :value="opt.value"
                  >
                    {{ opt.label }}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </FormItem>
        </FormField>

        <div class="space-y-2">
          <FormField name="entidade">
            <FormItem>
              <FormLabel>Entidade</FormLabel>
              <Select v-model="selectedEntity">
                <SelectTrigger as="button" class="w-full justify-between">
                  {{
                    entityOptions.find((o) => o.value === selectedEntity)?.label
                  }}
                  <ChevronDown class="ml-2 h-4 w-4 opacity-50" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem
                      v-for="opt in entityOptions"
                      :key="opt.value"
                      :value="opt.value"
                    >
                      {{ opt.label }}
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </FormItem>
          </FormField>
        </div>
      </div>
    </Form>

    <PricesTablePrices
      :artigos="formattedArtigos"
      :expanded-rows="expandedRows"
      :selected-entity="selectedEntity"
      :entidades="entidades"
      @toggleExpanded="toggleExpanded"
      @addPrice="openAddPriceModal"
      @editPrice="openEditPriceModal"
    />

    <div class="flex items-center justify-between">
      <div class="text-sm text-muted-foreground">
        Mostrando
        {{ (currentPage - 1) * pageSize + 1 }}‑
        {{ Math.min(currentPage * pageSize, filteredArtigos.length) }}
        de {{ filteredArtigos.length }} artigos
      </div>
      <div class="flex items-center space-x-6">
        <div class="flex items-center space-x-2">
          <p class="text-sm font-medium">Registos por página</p>
          <Select v-model="pageSize" :options="[10, 20, 50]">
            <template #trigger>
              <Button variant="outline" class="h-8 w-[70px]">
                {{ pageSize }}
                <ChevronDown class="ml-2 h-4 w-4 opacity-50" />
              </Button>
            </template>
          </Select>
        </div>
        <div class="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            class="h-8 w-8 p-0"
            :disabled="currentPage === 1"
            @click="currentPage--"
          >
            <ChevronLeft class="h-4 w-4" />
          </Button>
          <div class="text-sm font-medium">
            Página {{ currentPage }} de {{ totalPages }}
          </div>
          <Button
            variant="outline"
            size="sm"
            class="h-8 w-8 p-0"
            :disabled="currentPage === totalPages"
            @click="currentPage++"
          >
            <ChevronRight class="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>

    <Dialog v-model:open="showPriceModal">
      <DialogContent class="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>{{
            isEditing ? "Editar Preço" : "Adicionar Preço"
          }}</DialogTitle>
          <DialogDescription>
            {{
              isEditing
                ? "Atualize os valores para este artigo e entidade."
                : "Defina os valores para este artigo e entidade."
            }}
          </DialogDescription>
        </DialogHeader>

        <PricesForm
          v-if="currentPrice && currentArtigo"
          :model-value="{
            entidade_id: currentPrice.entidade.id,
            valor_entidade: Number(currentPrice.valor_entidade),
            valor_paciente: Number(currentPrice.valor_paciente),
            artigo: currentPrice.artigo,
            entidade: currentPrice.entidade,
          }"
          :isEditing="isEditing"
          :entidades="entidades"
          :artigo-descricao="currentArtigo.descricao"
          @update:modelValue="(val) => handleFormUpdate(val)"
          @save="refreshAfterSave"
          @cancel="closePriceModal"
        />
      </DialogContent>
    </Dialog>
  </div>
</template>
