import { ref } from "vue";
import type {
  AuditoriaRecord,
  AuditoriaFilters,
  AuditoriaPaginatedResponse,
  AuditoriaFilterOptions,
  AuditoriaMetadata,
  ExportRequest,
} from "@/types/auditoria";
import { ExportFormat } from "@/types/auditoria";
import { useApiService } from "@/composables/apiService";

export function useAuditoria() {
  const { get, post } = useApiService();
  const auditoriaRecords = ref<AuditoriaRecord[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const totalRecords = ref(0);
  const totalPages = ref(0);
  const currentPage = ref(1);
  const metadata = ref<AuditoriaMetadata | null>(null);
  const selectedIds = ref<Set<number>>(new Set());
  const exportLoading = ref(false);

  // Legacy filter options (kept for compatibility)
  const filterOptions = ref<AuditoriaFilterOptions>({
    acoes: [],
    objetos: []
  });

  async function fetchAuditoriaRecords(filters: AuditoriaFilters = {}) {
    loading.value = true;
    error.value = null;

    try {
      // Remove undefined values from filters
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
      );

      const response: AuditoriaPaginatedResponse = await get("auditoria/", {
        params: cleanFilters
      });

      auditoriaRecords.value = response.items;
      totalRecords.value = response.total;
      totalPages.value = response.total_pages;
      currentPage.value = response.page;

      return response;
    } catch (e: any) {
      error.value = e.message || "Erro ao carregar registos de auditoria";
      auditoriaRecords.value = [];
      totalRecords.value = 0;
      totalPages.value = 0;
      currentPage.value = 1;
      throw e;
    } finally {
      loading.value = false;
    }
  }

  // Helper function to format date for display
  function formatDate(dateString: string): string {
    try {
      return new Date(dateString).toLocaleString('pt-PT', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return dateString; // Return original if formatting fails
    }
  }

  // Helper function to get badge color for action type
  function getActionBadgeClass(acao: string): string {
    const colors: Record<string, string> = {
      'Criação': 'bg-green-100 text-green-800',
      'Atualização': 'bg-blue-100 text-blue-800',
      'Remoção': 'bg-red-100 text-red-800',
      'Login': 'bg-purple-100 text-purple-800',
      'Logout': 'bg-gray-100 text-gray-800',
      'Bloqueio': 'bg-orange-100 text-orange-800',
      'Desbloqueio': 'bg-emerald-100 text-emerald-800'
    };
    return colors[acao] || 'bg-gray-100 text-gray-800';
  }

  // Helper function to clear all data
  function clearData() {
    auditoriaRecords.value = [];
    totalRecords.value = 0;
    totalPages.value = 0;
    currentPage.value = 1;
    error.value = null;
    selectedIds.value.clear();
  }

  // Fetch metadata for filters
  async function fetchMetadata(clinica_id?: number) {
    try {
      const params = clinica_id ? { clinica_id } : {};
      const response: AuditoriaMetadata = await get("auditoria/metadata", { params });
      metadata.value = response;

      // Update legacy filterOptions for backward compatibility
      filterOptions.value.acoes = response.acoes;
      filterOptions.value.objetos = response.objetos;

      return response;
    } catch (e: any) {
      error.value = e.message || "Erro ao carregar metadados";
      throw e;
    }
  }

  // Selection management
  function toggleSelection(id: number) {
    if (selectedIds.value.has(id)) {
      selectedIds.value.delete(id);
    } else {
      selectedIds.value.add(id);
    }
  }

  function selectAll() {
    auditoriaRecords.value.forEach(record => {
      selectedIds.value.add(record.id);
    });
  }

  function clearSelection() {
    selectedIds.value.clear();
  }

  function isSelected(id: number): boolean {
    return selectedIds.value.has(id);
  }

  function isAllSelected(): boolean {
    return auditoriaRecords.value.length > 0 &&
           auditoriaRecords.value.every(record => selectedIds.value.has(record.id));
  }

  // Export functionality
  async function exportAuditoria(
    format: ExportFormat,
    clinica_id: number,
    filters?: AuditoriaFilters,
    exportType: 'current' | 'all' | 'selected' = 'current'
  ): Promise<void> {
    exportLoading.value = true;

    try {
      const exportRequest: ExportRequest = {
        format,
        filters: filters || {},
        export_all: exportType === 'all',
        selected_ids: exportType === 'selected' ? Array.from(selectedIds.value) : undefined
      };

      const response = await post(`auditoria/export?clinica_id=${clinica_id}`, exportRequest, {
        responseType: 'blob'
      });

      // Create download link
      const blob = new Blob([response], {
        type: format === ExportFormat.EXCEL
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : 'application/pdf'
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
      const extension = format === ExportFormat.EXCEL ? 'xlsx' : 'pdf';
      link.download = `auditoria_export_${timestamp}.${extension}`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (e: any) {
      error.value = e.message || "Erro ao exportar dados";
      throw e;
    } finally {
      exportLoading.value = false;
    }
  }

  // Export current page
  async function exportCurrentPage(format: ExportFormat, clinica_id: number, filters?: AuditoriaFilters) {
    return exportAuditoria(format, clinica_id, filters, 'current');
  }

  // Export all records with filters
  async function exportAllRecords(format: ExportFormat, clinica_id: number, filters?: AuditoriaFilters) {
    return exportAuditoria(format, clinica_id, filters, 'all');
  }

  // Export selected records
  async function exportSelectedRecords(format: ExportFormat, clinica_id: number) {
    if (selectedIds.value.size === 0) {
      throw new Error('Nenhum registo selecionado para exportação');
    }
    return exportAuditoria(format, clinica_id, {}, 'selected');
  }

  return {
    // Reactive data
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

    // Methods
    fetchAuditoriaRecords,
    fetchMetadata,
    formatDate,
    getActionBadgeClass,
    clearData,

    // Selection methods
    toggleSelection,
    selectAll,
    clearSelection,
    isSelected,
    isAllSelected,

    // Export methods
    exportCurrentPage,
    exportAllRecords,
    exportSelectedRecords,
  };
}