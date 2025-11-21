<script setup lang="ts">
import {
  Search,
  Plus,
  FileInput,
  ChevronLeft,
  ChevronRight,
  FileBarChart2,
  Bell,
} from "lucide-vue-next";
import type { StockItem } from "@/types/stock";
import type { Clinica } from "@/types/clinica";

// Composables
const { items, loading, fetchItems } = useStock();
const { enviarAlertasStock, loading: sendingAlerts } = useEmail();

// State
const selectedClinic = useState<Clinica | null>("selectedClinic");
const showItemDialog = ref(false);
const showMovementDialog = ref(false);
const isNew = ref(true);
const selectedItemId = ref<number | null>(null);
const transfer = ref<string>("");

// Load items when clinic changes
async function loadItems() {
  if (selectedClinic.value) {
    await fetchItems(selectedClinic.value.id);
  }
}

// Dialog handlers
function openItemDialog(create = true, item?: StockItem) {
  isNew.value = create;
  showItemDialog.value = true;
  selectedItemId.value = create ? null : item?.id ?? null;
}

function closeItemDialog() {
  showItemDialog.value = false;
  selectedItemId.value = null;
}

function openMovementDialog(isTransfer = false, item?: StockItem) {
  if (isTransfer && item) {
    selectedItemId.value = item.id;
    transfer.value = "transferencia";
  }
  showMovementDialog.value = true;
}

function onSelectItem(item: StockItem) {
  selectedItemId.value = item?.id ?? null;
}

// Send stock alerts using composable
async function handleEnviarAlertas() {
  if (!selectedClinic.value) return;
  await enviarAlertasStock(selectedClinic.value.id);
}

// Watch for clinic changes
watch(selectedClinic, loadItems);

// Initial load
onMounted(loadItems);
</script>

<template>
  <div class="flex flex-col gap-8 p-6">
    <!-- Header -->
    <div
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4"
    >
      <h1 class="text-2xl font-semibold">Gestão de Stock</h1>
      <div class="flex flex-wrap gap-2 w-full sm:w-auto">
        <Button
          variant="outline"
          @click="handleEnviarAlertas"
          :disabled="sendingAlerts"
          class="flex-1 sm:flex-none"
        >
          <Bell class="mr-2 h-4 w-4" />
          <span class="hidden xs:inline">{{ sendingAlerts ? 'Enviando...' : 'Enviar Alertas' }}</span>
          <span class="xs:hidden">{{ sendingAlerts ? '...' : 'Alertas' }}</span>
        </Button>
        <Button variant="default" @click="openItemDialog(true)" class="flex-1 sm:flex-none">
          <Plus class="mr-2 h-4 w-4" />
          <span class="hidden xs:inline">Novo Item</span>
          <span class="xs:hidden">Novo</span>
        </Button>
        <Button variant="secondary" @click="openMovementDialog(false)" class="flex-1 sm:flex-none">
          <FileInput class="mr-2 h-4 w-4" />
          <span class="hidden xs:inline">Movimento Manual</span>
          <span class="xs:hidden">Movimento</span>
        </Button>
      </div>
    </div>

    <!-- Main Grid -->
    <div class="grid gap-6 md:gap-8 grid-cols-1 lg:grid-cols-3">
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
            <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Select defaultValue="todos">
                <SelectTrigger class="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filtrar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os itens</SelectItem>
                  <SelectItem value="baixo">Stock baixo</SelectItem>
                  <SelectItem value="vencido">Próximo do vencimento</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" class="w-full sm:w-auto">
                <Search class="mr-2 h-4 w-4" />
                Pesquisar
              </Button>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="flex justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>

          <!-- Stock Table -->
          <StockTable
            v-else
            :items="items"
            @edit="(item) => openItemDialog(false, item)"
            @selectItem="onSelectItem"
            @transfer="openMovementDialog(true, $event)"
          />

          <!-- Pagination -->
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div class="text-sm text-muted-foreground">
              Mostrando 1-{{ Math.min(items.length, 10) }} de {{ items.length }} itens
            </div>
            <div class="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled>
                <ChevronLeft class="h-4 w-4" />
                <span class="sr-only">Página anterior</span>
              </Button>
              <div class="text-sm whitespace-nowrap">Página 1 de {{ Math.ceil(items.length / 10) || 1 }}</div>
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
      @saved="loadItems"
    />

    <StockMovementDialog
      :open="showMovementDialog"
      :items="items"
      :defaultItemId="selectedItemId"
      :defaultTipo="transfer"
      @close="showMovementDialog = false"
      @saved="loadItems"
    />
  </div>
</template>
