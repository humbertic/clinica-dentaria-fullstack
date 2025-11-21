<script setup lang="ts">
import { Search, Plus } from "lucide-vue-next";
import { ref, onMounted } from "vue";
import { useToast } from "@/components/ui/toast";
import type { Categoria } from "@/types/categoria";
import { useCategorias } from "~/composables/useCategorias";


const showCreateDialog = ref(false);
const showEditDialog = ref(false);
const searchQuery = ref("");
const loading = ref(false);

const { toast } = useToast();

const { categorias, fetchCategorias } = useCategorias();

const filteredCategorias = computed(() => {
  if (!searchQuery.value) return categorias.value;
  return categorias.value.filter(
    (e) =>
      e.nome.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      e.slug.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// Use pagination composable
const {
  currentPage,
  pageSize,
  paginatedItems: paginatedCategorias,
  totalItems,
} = usePagination(filteredCategorias);

const editingCategoria = ref<Categoria | null>(null);

// Clean mapping: always convert to primitives


function openCreateDialog() {
  editingCategoria.value = null;
  showCreateDialog.value = true;
}

function openEditDialog(Categoria: Categoria) {
  editingCategoria.value = Categoria;
  showEditDialog.value = true;
}

function handleSave() {
  showCreateDialog.value = false;
  showEditDialog.value = false;
  fetchCategorias();
}
function handleCancel() {
  showCreateDialog.value = false;
  showEditDialog.value = false;
}

async function loadCategorias() {
  loading.value = true;
  try {
    await fetchCategorias();
  } catch (e) {
    toast({
      title: "Erro ao buscar Categorias",
      description: e instanceof Error ? e.message : String(e),
      variant: "destructive",
    });
  } finally {
    loading.value = false;
  }
}

onMounted(loadCategorias);

</script>

<template>
  <div class="flex flex-col gap-8 p-6 max-w-screen-xl mx-auto w-full">
    <div class="sticky top-0 z-10 bg-background pt-2 pb-4 border-b">
      <div
        class="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <h1 class="text-2xl font-bold tracking-tight">Categorias</h1>
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
          <CardTitle>Lista de Categorias</CardTitle>
          <CardDescription>
            Gerencie todos os Categorias da plataforma
          </CardDescription>
          <div class="relative w-full mt-2">
            <Input
              v-model="searchQuery"
              type="text"
              placeholder="Pesquisar Categorias..."
              class="w-full pl-9"
            />
            <Search
              class="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            />
          </div>
        </CardHeader>
        <CardContent>
          <CategoriesTable
            :categorias="paginatedCategorias"
            @edit="openEditDialog"
          />
          <Dialog v-model:open="showCreateDialog">
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Categoria</DialogTitle>
              </DialogHeader>
              <CategoriesForm @save="handleSave" @cancel="handleCancel" />
            </DialogContent>
          </Dialog>
          <Dialog v-model:open="showEditDialog">
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar Categoria</DialogTitle>
              </DialogHeader>
              <CategoriesForm
                :id="editingCategoria?.id"
                :Categoria="editingCategoria"
                @save="handleSave"
                @cancel="handleCancel"
              />
            </DialogContent>
          </Dialog>

          <!-- Pagination -->
          <TablePagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total-items="totalItems"
          />
        </CardContent>
      </Card>
    </div>
  </div>
</template>
