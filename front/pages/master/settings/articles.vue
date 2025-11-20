<script setup lang="ts">
import { Search, Plus } from "lucide-vue-next";
import { ref, onMounted } from "vue";
import { useToast } from "@/components/ui/toast";
import ArticlesTable from "@/components/articles/Table.vue";
import ArticlesForm from "@/components/articles/Form.vue";

type Artigo = {
  id: number;
  codigo: string;
  descricao: string;
  categoria: {
    id: number;
    nome: string;
  };
};

const showCreateDialog = ref(false);
const showEditDialog = ref(false);
const editingArtigo = ref<Artigo | null>(null);
const searchQuery = ref("");

const filteredArtigos = computed(() => {
  if (!searchQuery.value) return artigos.value;
  return artigos.value.filter(
    (a) =>
      a.codigo.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      a.descricao.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      a.categoria.nome.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// Use pagination composable
const {
  currentPage,
  pageSize,
  paginatedItems: paginatedArtigos,
  totalItems,
} = usePagination(filteredArtigos);

const { toast } = useToast();
const config = useRuntimeConfig();
const baseUrl = config.public.apiBase;

const artigos = ref<Artigo[]>([]);

async function fetchArtigos() {
  const token = useCookie("token").value;
  try {
    const res = await fetch(`${baseUrl}artigos`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error("Erro ao buscar Artigos");
    const data = await res.json();
    artigos.value = data;
  } catch (e) {
    toast({
      title: "Erro ao buscar artigos",
      description: e instanceof Error ? e.message : String(e),
    });
  }
}

function openCreateDialog() {
  editingArtigo.value = null;
  showCreateDialog.value = true;
}

function openEditDialog(artigo: Artigo) {
  editingArtigo.value = artigo;
  showEditDialog.value = true;
}
 function handleDelete(artigo: Artigo) {
  const token = useCookie("token").value;
  fetch(`${baseUrl}artigos/${artigo.id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => {
      if (!res.ok) throw new Error("Erro ao deletar artigo");
      toast({
        title: "Sucesso",
        description: "Artigo deletado com sucesso.",
      });
      fetchArtigos();
    })
    .catch((e) => {
      toast({
        title: "Erro ao deletar artigo",
        description: e instanceof Error ? e.message : String(e),
        variant: "destructive",
      });
    });

 }

function handleSave() {
  showCreateDialog.value = false;
  showEditDialog.value = false;
  fetchArtigos();
}
function handleCancel() {
  showCreateDialog.value = false;
  showEditDialog.value = false;
}

onMounted(fetchArtigos);
</script>

<template>
  <div class="flex flex-col gap-8 p-6 max-w-screen-xl mx-auto w-full">
    <div class="sticky top-0 z-10 bg-background pt-2 pb-4 border-b">
      <div
        class="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <h1 class="text-2xl font-bold tracking-tight">Artigos</h1>
        <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button
            @click="openCreateDialog"
            class="w-full sm:w-auto inline-flex items-center h-9 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium shadow hover:bg-primary/90"
          >
            <Plus class="mr-2 h-4 w-4" />
            Novo
          </Button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <Card class="lg:col-span-12 rounded-2xl shadow-md">
        <CardHeader>
          <CardTitle>Lista de Artigos</CardTitle>
          <CardDescription>
            Gerencie todos os artigos da plataforma
          </CardDescription>
          <div class="relative w-full mt-2">
            <Input
              v-model="searchQuery"
              type="text"
              placeholder="Pesquisar artigos..."
              class="w-full pl-9"
            />
            <Search
              class="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            />
          </div>
        </CardHeader>
        <CardContent>
          <ArticlesTable :artigos="paginatedArtigos" @edit="openEditDialog" @delete="handleDelete"/>
          <!-- Pagination -->
          <UiTablePagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total-items="totalItems"
          />

          <!-- Create Dialog -->
          <Dialog v-model:open="showCreateDialog">
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo Artigo</DialogTitle>
              </DialogHeader>
              <ArticlesForm @save="handleSave" @cancel="handleCancel" />
            </DialogContent>
          </Dialog>
          <!-- Edit Dialog -->
          <Dialog v-model:open="showEditDialog">
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar Artigo</DialogTitle>
              </DialogHeader>
              <ArticlesForm
                :id="editingArtigo?.id"
                :artigo="
                  editingArtigo
                    ? {
                        ...editingArtigo,
                        categoria_id: editingArtigo.categoria.id,
                      }
                    : null
                "
                @save="handleSave"
                @cancel="handleCancel"
              />
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
