<script setup lang="ts">
import {
  Search,
  Plus,
  FileInput,
  ChevronLeft,
  ChevronRight,
  FileBarChart2,
} from "lucide-vue-next";
import { useToast } from "@/components/ui/toast";



type Item = {
  id: number;
  nome: string;
  descricao: string;
  lote_proximo: string;
  quantidade_atual: number;
  quantidade_minima: number;
  validade_proxima: string;
  tipo_medida: string;
  fornecedor: string;
  ativo: boolean;
};

type Clinic = {
  id: number;
  nome: string;
  morada?: string;
  email_envio?: string;
};

const { toast } = useToast();
const selectedClinic = useState<Clinic | null>("selectedClinic");

const showItemDialog = ref(false);
const showMovementDialog = ref(false);
const isNew = ref(true);
const selectedItemId = ref<number | null>(null);
const transfer = ref(<string>"");

const config = useRuntimeConfig();
const baseUrl = config.public.apiBase;

const items = ref<Item[]>([]);

async function fetchItems() {
  const token = useCookie("token").value;
  try {
    if (!selectedClinic.value) {
      throw new Error("Nenhuma clínica selecionada");
    }
    const res = await fetch(
      `${baseUrl}stock/items/${selectedClinic.value.id}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      }
    );
    if (!res.ok) throw new Error("Erro ao buscar itens");
    items.value = await res.json();
  } catch (e) {
    items.value = [];
    toast({
      title: "Erro ao buscar itens",
      description: e instanceof Error ? e.message : String(e),
      variant: "destructive",
    });
  }
}



function openItemDialog(create = true, item?: Item) {
  isNew.value = create;
  showItemDialog.value = true;
  selectedItemId.value = create ? null : item?.id ?? null;
}

function closeItemDialog() {
  showItemDialog.value = false;
  selectedItemId.value = null;
}

function openMovementDialog(isTransfer = false, item: Item) {
  if (isTransfer) {
    selectedItemId.value = item?.id ?? null;
    transfer.value = "transferencia";
  }
  showMovementDialog.value = true;
}

function onSelectItem(item: Item) {
  selectedItemId.value = item?.id ?? null;
}

watch(selectedClinic, () => {
  fetchItems();
});

onMounted(fetchItems);
</script>

<template>
  <div class="flex flex-col gap-8 p-6">
    <!-- Header -->
    <div
      class="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4"
    >
      <h1 class="text-2xl font-semibold">Gestão de Stock</h1>
      <div class="flex gap-2">
        <Button variant="default" @click="openItemDialog(true)">
          <Plus class="mr-2 h-4 w-4" />
          Novo Item
        </Button>
        <Button variant="secondary" @click="openMovementDialog">
          <FileInput class="mr-2 h-4 w-4" />
          Movimento Manual
        </Button>
      </div>
    </div>

    <!-- Main Grid -->
    <div class="grid gap-8 lg:grid-cols-3">
      <!-- Stock List -->
      <Card class="lg:col-span-2 shadow-md">
        <CardHeader>
          <CardTitle>Inventário</CardTitle>
          <CardDescription>Gerencie todos os itens em stock</CardDescription>
        </CardHeader>
        <CardContent class="p-6 space-y-4">
          <!-- Search Bar -->
          <div class="flex flex-col sm:flex-row items-center gap-2">
            <div class="relative w-full">
              <Search
                class="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input placeholder="Pesquisar item…" class="w-full pl-9" />
            </div>
            <div class="flex gap-2 w-full sm:w-auto">
              <Select defaultValue="todos">
                <SelectTrigger class="w-[180px]">
                  <SelectValue placeholder="Filtrar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os itens</SelectItem>
                  <SelectItem value="baixo">Stock baixo</SelectItem>
                  <SelectItem value="vencido">Próximo do vencimento</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Search class="mr-2 h-4 w-4" />
                Pesquisar
              </Button>
            </div>
          </div>

          <!-- Stock Table -->
          <StockTable
            :items="items"
            @edit="(item) => openItemDialog(false, item)"
            @selectItem="onSelectItem"
            @transfer="openMovementDialog(true, $event)"
          />

          <!-- Pagination -->
          <div class="flex items-center justify-between">
            <div class="text-sm text-muted-foreground">
              Mostrando 1-3 de 50 itens
            </div>
            <div class="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled>
                <ChevronLeft class="h-4 w-4" />
                <span class="sr-only">Página anterior</span>
              </Button>
              <div class="text-sm">Página 1 de 17</div>
              <Button variant="outline" size="sm">
                <ChevronRight class="h-4 w-4" />
                <span class="sr-only">Próxima página</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Movements Panel -->
      <StockMovementsPanel :item-id="selectedItemId" />
    </div>

    <StockItemDialog
      :open="showItemDialog"
      :item-id="selectedItemId"
      @close="closeItemDialog"
      @saved="fetchItems"
    />

    <StockMovementDialog
      :open="showMovementDialog"
      :items="items"
      :defaultItemId="selectedItemId"
      :defaultTipo="transfer"
      @close="showMovementDialog = false"
      @saved="fetchItems"
    />
  </div>
</template>
