<script setup lang="ts">
import {
  Search,
  Filter,
  Calendar,
  User,
  FileText,
  ChevronLeft,
  ChevronRight,
  Download,
  FileSpreadsheet,
  FileType,
  Check,
  CheckSquare,
  Square,
} from "lucide-vue-next";

import { useToast } from "@/components/ui/toast";
import { useAuditoria } from "@/composables/useAuditoria";
import type { AuditoriaFilters } from "@/types/auditoria";
import { ExportFormat } from "@/types/auditoria";

const { toast } = useToast();

// Export format constants for template
const EXCEL_FORMAT: ExportFormat = ExportFormat.EXCEL;
const PDF_FORMAT: ExportFormat = ExportFormat.PDF;

const {
  auditoriaRecords,
  loading,
  error,
  totalRecords,
  totalPages,
  currentPage,
  filterOptions,
  metadata,
  selectedIds,
  exportLoading,
  fetchAuditoriaRecords,
  fetchMetadata,
  formatDate,
  getActionBadgeClass,
  clearData,
  toggleSelection,
  selectAll,
  clearSelection,
  isSelected,
  isAllSelected,
  exportCurrentPage,
  exportAllRecords,
  exportSelectedRecords,
} = useAuditoria();

// Filter state
const searchQuery = ref("");
const selectedAcao = ref("");
const selectedObjeto = ref("");
const selectedUtilizador = ref("");
const dataInicio = ref("");
const dataFim = ref("");

// Pagination
const pageSize = ref(10);

// Computed for pagination info
const startRecord = computed(() => (currentPage.value - 1) * pageSize.value + 1);
const endRecord = computed(() => Math.min(currentPage.value * pageSize.value, totalRecords.value));

// Build filters object
const buildFilters = (): AuditoriaFilters => {
  const filters: AuditoriaFilters = {
    skip: (currentPage.value - 1) * pageSize.value,
    limit: pageSize.value,
  };

  if (searchQuery.value.trim()) filters.search = searchQuery.value.trim();
  if (selectedAcao.value) filters.acao = selectedAcao.value;
  if (selectedObjeto.value) filters.objeto = selectedObjeto.value;
  if (selectedUtilizador.value) filters.utilizador_id = parseInt(selectedUtilizador.value);
  if (dataInicio.value) filters.data_inicio = new Date(dataInicio.value).toISOString();
  if (dataFim.value) filters.data_fim = new Date(dataFim.value).toISOString();

  return filters;
};

// Fetch records with current filters
async function loadRecords() {
  try {
    await fetchAuditoriaRecords(buildFilters());
  } catch (err) {
    toast({
      title: "Erro",
      description: error.value || "Erro ao carregar registos de auditoria",
      variant: "destructive",
    });
  }
}

// Reset filters
function resetFilters() {
  searchQuery.value = "";
  selectedAcao.value = "";
  selectedObjeto.value = "";
  selectedUtilizador.value = "";
  dataInicio.value = "";
  dataFim.value = "";
  currentPage.value = 1;
  clearSelection();
  loadRecords();
}

// Apply filters
function applyFilters() {
  currentPage.value = 1;
  clearSelection();
  loadRecords();
}

// Pagination functions
function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    loadRecords();
  }
}

function previousPage() {
  if (currentPage.value > 1) {
    goToPage(currentPage.value - 1);
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    goToPage(currentPage.value + 1);
  }
}

// Watch for filter changes with debounce for search
let searchTimeout: NodeJS.Timeout;
watch(searchQuery, () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    applyFilters();
  }, 500);
});

// Watch other filters for immediate application
watch([selectedAcao, selectedObjeto, selectedUtilizador, dataInicio, dataFim], () => {
  applyFilters();
});

// Export functions
async function handleExport(format: ExportFormat, type: 'current' | 'all' | 'selected') {
  try {
    const filters = buildFilters();

    if (type === 'current') {
      await exportCurrentPage(format, filters);
    } else if (type === 'all') {
      await exportAllRecords(format, filters);
    } else if (type === 'selected') {
      await exportSelectedRecords(format);
    }

    toast({
      title: "Sucesso",
      description: "Exportação realizada com sucesso",
      variant: "default",
    });
  } catch (err: any) {
    toast({
      title: "Erro",
      description: err.message || "Erro ao exportar dados",
      variant: "destructive",
    });
  }
}

// Selection helpers
function handleSelectAll() {
  if (isAllSelected()) {
    clearSelection();
  } else {
    selectAll();
  }
}

// Load initial data and metadata
onMounted(async () => {
  try {
    await fetchMetadata();
    console.log('Export Format', ExportFormat);
  } catch (err) {
    // Metadata is optional, continue loading records
    console.warn('Failed to load metadata:', err);
  }
  loadRecords();
});


</script>

<template>
  <div class="flex flex-col gap-8 p-6 max-w-screen-xl mx-auto w-full">
    <!-- Header -->
    <div class="sticky top-0 z-10 bg-background pt-2 pb-4 border-b">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">Auditoria do Sistema</h1>
          <p class="text-sm text-muted-foreground">Registo de atividades e alterações no sistema</p>
        </div>
        <div class="text-sm text-muted-foreground">
          {{ totalRecords }} registos encontrados
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Filters Section -->
      <div class="lg:col-span-12">
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Filter class="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <!-- Search -->
              <div>
                <Label for="search">Pesquisar</Label>
                <div class="relative">
                  <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="search"
                    v-model="searchQuery"
                    placeholder="Pesquisar em detalhes, ação..."
                    class="pl-10"
                  />
                </div>
              </div>

              <!-- User Filter -->
              <div>
                <Label for="utilizador">Utilizador</Label>
                <div class="flex gap-2">
                  <Select v-model="selectedUtilizador">
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os utilizadores" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem v-for="utilizador in metadata?.utilizadores || []" :key="utilizador.id" :value="utilizador.id.toString()">
                        {{ utilizador.nome }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Button v-if="selectedUtilizador" variant="outline" size="sm" @click="selectedUtilizador = ''">
                    ✕
                  </Button>
                </div>
              </div>

              <!-- Action Filter -->
              <div>
                <Label for="acao">Ação</Label>
                <div class="flex gap-2">
                  <Select v-model="selectedAcao">
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as ações" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem v-for="acao in metadata?.acoes || filterOptions.acoes" :key="acao" :value="acao">
                        {{ acao }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Button v-if="selectedAcao" variant="outline" size="sm" @click="selectedAcao = ''">
                    ✕
                  </Button>
                </div>
              </div>

              <!-- Object Filter -->
              <div>
                <Label for="objeto">Objeto</Label>
                <div class="flex gap-2">
                  <Select v-model="selectedObjeto">
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os objetos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem v-for="objeto in metadata?.objetos || filterOptions.objetos" :key="objeto" :value="objeto">
                        {{ objeto }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Button v-if="selectedObjeto" variant="outline" size="sm" @click="selectedObjeto = ''">
                    ✕
                  </Button>
                </div>
              </div>

              <!-- Date Range Start -->
              <div>
                <Label for="data-inicio">Data Início</Label>
                <Input
                  id="data-inicio"
                  v-model="dataInicio"
                  type="date"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <!-- Date Range End -->
              <div>
                <Label for="data-fim">Data Fim</Label>
                <Input
                  id="data-fim"
                  v-model="dataFim"
                  type="date"
                />
              </div>

              <!-- Action Buttons -->
              <div class="flex items-end gap-2">
                <Button @click="applyFilters" :disabled="loading">
                  Aplicar Filtros
                </Button>
                <Button variant="outline" @click="resetFilters" :disabled="loading">
                  Limpar
                </Button>
              </div>

              <!-- Export Buttons -->
              <div class="flex items-end gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" :disabled="exportLoading">
                      <Download class="h-4 w-4 mr-2" />
                      Exportar
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" class="w-64">
                    <DropdownMenuLabel>Exportar página atual ({{ auditoriaRecords.length }} registos)</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem @click="handleExport(EXCEL_FORMAT, 'current')">
                      <FileSpreadsheet class="h-4 w-4 mr-2" />
                      Excel (.xlsx)
                    </DropdownMenuItem>
                    <DropdownMenuItem @click="handleExport(PDF_FORMAT, 'current')">
                      <FileType class="h-4 w-4 mr-2" />
                      PDF
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Exportar todos ({{ totalRecords }} registos)</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem @click="handleExport(EXCEL_FORMAT, 'all')">
                      <FileSpreadsheet class="h-4 w-4 mr-2" />
                      Todos - Excel
                    </DropdownMenuItem>
                    <DropdownMenuItem @click="handleExport(PDF_FORMAT, 'all')">
                      <FileType class="h-4 w-4 mr-2" />
                      Todos - PDF
                    </DropdownMenuItem>

                    <template v-if="selectedIds.size > 0">
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel>Exportar selecionados ({{ selectedIds.size }} registos)</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem @click="handleExport(EXCEL_FORMAT, 'selected')">
                        <FileSpreadsheet class="h-4 w-4 mr-2" />
                        Selecionados - Excel
                      </DropdownMenuItem>
                      <DropdownMenuItem @click="handleExport(PDF_FORMAT, 'selected')">
                        <FileType class="h-4 w-4 mr-2" />
                        Selecionados - PDF
                      </DropdownMenuItem>
                    </template>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Results Section -->
      <div class="lg:col-span-12">
        <Card>
          <CardHeader>
            <div class="flex items-center justify-between">
              <CardTitle>Registos de Auditoria</CardTitle>
              <div v-if="auditoriaRecords.length > 0" class="flex items-center gap-2 text-sm text-muted-foreground">
                <Button
                  variant="ghost"
                  size="sm"
                  @click="handleSelectAll"
                  class="p-1 h-auto"
                >
                  <component :is="isAllSelected() ? CheckSquare : Square" class="h-4 w-4" />
                </Button>
                <span v-if="selectedIds.size > 0">{{ selectedIds.size }} selecionado(s)</span>
                <span v-else>Selecionar todos</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <!-- Loading State -->
            <div v-if="loading" class="flex justify-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>

            <!-- Error State -->
            <Alert v-else-if="error" variant="destructive">
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{{ error }}</AlertDescription>
            </Alert>

            <!-- Table -->
            <div v-else-if="auditoriaRecords.length > 0" class="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead class="w-12">
                      <Button
                        variant="ghost"
                        size="sm"
                        @click="handleSelectAll"
                        class="p-1 h-auto"
                      >
                        <component :is="isAllSelected() ? CheckSquare : Square" class="h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Utilizador</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Objeto</TableHead>
                    <TableHead>Detalhes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="record in auditoriaRecords" :key="record.id">
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        @click="toggleSelection(record.id)"
                        class="p-1 h-auto"
                      >
                        <component :is="isSelected(record.id) ? CheckSquare : Square" class="h-4 w-4" />
                      </Button>
                    </TableCell>
                    <TableCell class="font-mono text-sm">
                      {{ formatDate(record.data) }}
                    </TableCell>
                    <TableCell>
                      <div class="flex items-center gap-2">
                        <User class="h-4 w-4 text-gray-400" />
                        {{ record.utilizador_nome || `ID: ${record.utilizador_id}` }}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge :class="getActionBadgeClass(record.acao)">
                        {{ record.acao }}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div class="space-y-1">
                        <div class="font-medium">{{ record.objeto }}</div>
                        <div v-if="record.objeto_nome" class="text-sm text-gray-600">
                          {{ record.objeto_nome }}
                        </div>
                        <div v-else-if="record.objeto_id" class="text-sm text-gray-600">
                          ID: {{ record.objeto_id }}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell class="max-w-md">
                      <div class="truncate" :title="record.detalhes || ''">
                        {{ record.detalhes || '-' }}
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <!-- Pagination -->
              <div class="flex items-center justify-between">
                <div class="text-sm text-gray-600">
                  Mostrando {{ startRecord }} a {{ endRecord }} de {{ totalRecords }} registos
                </div>

                <div class="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    @click="previousPage"
                    :disabled="currentPage <= 1"
                  >
                    <ChevronLeft class="h-4 w-4" />
                    Anterior
                  </Button>

                  <!-- Page numbers -->
                  <div class="flex gap-1">
                    <template v-if="totalPages <= 5">
                      <Button
                        v-for="page in totalPages"
                        :key="page"
                        variant="outline"
                        size="sm"
                        :class="{ 'bg-primary text-primary-foreground': page === currentPage }"
                        @click="goToPage(page)"
                      >
                        {{ page }}
                      </Button>
                    </template>
                    <template v-else>
                      <!-- Show first few pages and current page area -->
                      <Button
                        v-for="page in Math.min(5, totalPages)"
                        :key="page"
                        variant="outline"
                        size="sm"
                        :class="{ 'bg-primary text-primary-foreground': page === currentPage }"
                        @click="goToPage(page)"
                      >
                        {{ page }}
                      </Button>
                    </template>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    @click="nextPage"
                    :disabled="currentPage >= totalPages"
                  >
                    Próxima
                    <ChevronRight class="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div v-else class="text-center py-8">
              <FileText class="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p class="text-gray-600">Nenhum registo de auditoria encontrado</p>
              <p class="text-sm text-gray-500">Tente ajustar os filtros de pesquisa</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>