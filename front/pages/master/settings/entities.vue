<script setup lang="ts">
import {
  Search,
  Plus,
  Edit,
  ShieldOff,
  CheckCircle,
  BadgePlus,
  Building,
  ChevronLeft,
  ChevronRight,
} from "lucide-vue-next";
import { ref, onMounted } from "vue";
import { useToast } from "@/components/ui/toast";

type Entidade = {
  id: number;
  nome: string;
  slug: string;
};

const showCreateDialog = ref(false);
const showEditDialog = ref(false);
const searchQuery = ref("");

const { toast } = useToast();
const config = useRuntimeConfig();
const baseUrl = config.public.apiBase;

const currentPage = ref(1);
const pageSize = ref(10);

const filteredEntidades = computed(() => {
  if (!searchQuery.value) return entidades.value;
  return entidades.value.filter(
    (e) =>
      e.nome.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      e.slug.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const pageCount = computed(() =>
  Math.ceil(filteredEntidades.value.length / pageSize.value)
);

const paginatedEntidades = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredEntidades.value.slice(start, start + pageSize.value);
});

const entidades = ref<Entidade[]>([]);
const editingEntidade = ref<Entidade | null>(null);

// Clean mapping: always convert to primitives
function mapEntidade(e: any): Entidade {
  return {
    id: Number(e.id),
    nome: String(e.nome),
    slug: String(e.slug),
  };
}

function openCreateDialog() {
  editingEntidade.value = null;
  showCreateDialog.value = true;
}

function openEditDialog(entidade: Entidade) {
  editingEntidade.value = entidade;
  showEditDialog.value = true;
}

function handleSave() {
  showCreateDialog.value = false;
  showEditDialog.value = false;
  fetchEntidades();
}
function handleCancel() {
  showCreateDialog.value = false;
  showEditDialog.value = false;
}

async function fetchEntidades() {
  const token = useCookie("token").value;
  try {
    const res = await fetch(`${baseUrl}entidades`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error("Erro ao buscar Entidades");
    const data = await res.json();
    entidades.value = Array.isArray(data) ? data.map(mapEntidade) : [];
  } catch (e) {
    toast({
      title: "Erro ao buscar entidades",
      description: e instanceof Error ? e.message : String(e),
    });
  }
}

watch(searchQuery, () => {
  currentPage.value = 1;
});

onMounted(fetchEntidades);
</script>

<template>
  <div class="flex flex-col gap-8 p-6 max-w-screen-xl mx-auto w-full">
    <div class="sticky top-0 z-10 bg-background pt-2 pb-4 border-b">
      <div
        class="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <h1 class="text-2xl font-bold tracking-tight">Entidades</h1>
        <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button
            @click="openCreateDialog"
            class="w-full sm:w-auto inline-flex items-center h-9 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium shadow hover:bg-primary/90"
          >
            <Plus class="mr-2 h-4 w-4" />
            Nova
          </Button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <Card class="lg:col-span-12 rounded-2xl shadow-md">
        <CardHeader>
          <CardTitle>Lista de Entidades</CardTitle>
          <CardDescription>
            Gerencie todos os entidades da plataforma
          </CardDescription>
          <div class="relative w-full mt-2">
            <Input
              v-model="searchQuery"
              type="text"
              placeholder="Pesquisar entidades..."
              class="w-full pl-9"
            />
            <Search
              class="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            />
          </div>
        </CardHeader>
        <CardContent>
          <EntitiesTable
            :entidades="paginatedEntidades"
            @edit="openEditDialog"
          />
          <Dialog v-model:open="showCreateDialog">
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Entidade</DialogTitle>
              </DialogHeader>
              <EntitiesForm @save="handleSave" @cancel="handleCancel" />
            </DialogContent>
          </Dialog>
          <Dialog v-model:open="showEditDialog">
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar Entidade</DialogTitle>
              </DialogHeader>
              <EntitiesForm
                :id="editingEntidade?.id"
                :entidade="editingEntidade"
                @save="handleSave"
                @cancel="handleCancel"
              />
            </DialogContent>
          </Dialog>

          <div class="flex items-center justify-between mt-4">
            <div class="text-sm text-muted-foreground">
              Mostrando
              {{ (currentPage - 1) * pageSize + 1 }}‑
              {{ Math.min(currentPage * pageSize, filteredEntidades.length) }}
              de {{ filteredEntidades.length }} entidades
            </div>
            <div class="flex flex-wrap items-center space-x-2">
              <button
                class="icon-btn"
                :disabled="currentPage === 1"
                @click="currentPage = Math.max(1, currentPage - 1)"
              >
                <ChevronLeft class="h-4 w-4" />
              </button>
              <span class="text-sm font-medium">
                Página {{ currentPage }} de {{ pageCount }}
              </span>
              <button
                class="icon-btn"
                :disabled="currentPage === pageCount"
                @click="currentPage = Math.min(pageCount, currentPage + 1)"
              >
                <ChevronRight class="h-4 w-4" />
              </button>
              <select
                v-model.number="pageSize"
                class="h-8 w-[70px] rounded-md border border-input bg-background px-2 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option :value="5">5</option>
                <option :value="10">10</option>
                <option :value="20">20</option>
                <option :value="50">50</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
