<!-- filepath: /home/humber/Documents/Escola/ProjetoFinal/clinica-dentaria/front/components/patients/FichaTab.vue -->
<script setup lang="ts">
import { useRoute } from "vue-router";
import { useRuntimeConfig, useCookie } from "#imports";
import { useToast } from "@/components/ui/toast";
import {
  Paperclip,
  PenLine,
  ChevronDown,
  ChevronUp,
  Edit,
} from "lucide-vue-next";

const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false,
  },
  paciente: {
    type: Object,
    required: true,
  },
});

const route = useRoute();
const toast = useToast();
const config = useRuntimeConfig();
const apiBase = config.public.apiBase;
const token = useCookie("token");

// Estado interno
const loading = ref(true);
const template = ref<any[]>([]);
const ficha = ref<any | null>(null);
const showNoteDialog = ref(false);
const submittingNote = ref(false);
const showFileDialog = ref(false);
const uploadingFile = ref(false);
const showImageViewer = ref(false);
const previewImageUrl = ref("");
const previewImageTitle = ref("");
const currentPreviewFile = ref(null);
const previewObjectUrl = ref("");
const previewLoading = ref(false);
const isFormExpanded = ref(false);

function toggleFormExpansion() {
  isFormExpanded.value = !isFormExpanded.value;
}




// Utility functions
function isPdfType(fileType: string | undefined): boolean {
  if (!fileType) return false;
  return (
    ["documento", "laudo"].includes(fileType.toLowerCase()) ||
    fileType.toLowerCase().endsWith(".pdf")
  );
}

// File handling functions
async function downloadWithAuth(url: string, filename?: string): Promise<void> {
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    window.open(objectUrl, "_blank");
    setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
  } catch (error) {
    console.error("Download error:", error);
    toast.toast({
      title: "Erro",
      description: "Não foi possível visualizar o arquivo",
      variant: "destructive",
    });
  }
}

async function fetchAndDisplayPreview(url: string): Promise<void> {
  previewLoading.value = true;
  previewImageUrl.value = "";
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const blob = await response.blob();
    if (previewObjectUrl.value) {
      URL.revokeObjectURL(previewObjectUrl.value);
    }

    previewObjectUrl.value = URL.createObjectURL(blob);
    previewImageUrl.value = previewObjectUrl.value;
  } catch (error) {
    console.error("Preview error:", error);
    toast.toast({
      title: "Erro",
      description: "Não foi possível carregar a visualização",
      variant: "destructive",
    });
  } finally {
    previewLoading.value = false;
  }
}

// Event handlers
function viewFile(ficheiro: any): void {
  if (!ficheiro || !ficheiro.id) {
    toast.toast({
      title: "Erro",
      description: "Arquivo inválido",
      variant: "destructive",
    });
    return;
  }

  const fileUrl = `${apiBase}pacientes/ficha/ficheiros/${ficheiro.id}/view`;
  currentPreviewFile.value = ficheiro;
  previewImageTitle.value = ficheiro.tipo || "";
  showImageViewer.value = true;
  fetchAndDisplayPreview(fileUrl);
}

function handleDownloadCurrentFile() {
  if (!currentPreviewFile.value?.id) return;

  const fileUrl = `${apiBase}pacientes/ficha/ficheiros/${currentPreviewFile.value.id}/view`;
  downloadWithAuth(fileUrl, currentPreviewFile.value.tipo);
}

function handleAddNote() {
  showNoteDialog.value = true;
}

function handleAttachFile() {
  showFileDialog.value = true;
}

// API functions
async function submitNewNote(text: string) {
  if (!text.trim() || !ficha.value?.id) return;

  submittingNote.value = true;
  try {
    const response = await fetch(`${apiBase}pacientes/ficha/anotacoes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.value}`,
      },
      body: JSON.stringify({
        ficha_id: ficha.value.id,
        texto: text,
      }),
    });

    if (!response.ok) {
      throw new Error("Falha ao salvar anotação");
    }

    const data = await response.json();

    if (!ficha.value.anotacoes) {
      ficha.value.anotacoes = [];
    }

    ficha.value.anotacoes.unshift(data);
    showNoteDialog.value = false;

    toast.toast({
      title: "Sucesso",
      description: "Anotação adicionada com sucesso",
    });
  } catch (error: any) {
    toast.toast({
      title: "Erro",
      description: error.message || "Não foi possível adicionar a anotação",
      variant: "destructive",
    });
  } finally {
    submittingNote.value = false;
  }
}

async function uploadFile(data: { file: File; type: string }) {
  if (!data.file || !ficha.value?.id) return;

  uploadingFile.value = true;
  try {
    const formData = new FormData();
    formData.append("ficha_id", ficha.value.id.toString());
    formData.append("tipo", data.type);
    formData.append("ficheiro", data.file);

    const response = await fetch(`${apiBase}pacientes/ficha/ficheiros`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.detail || "Falha ao enviar o arquivo");
    }

    const responseData = await response.json();

    if (!ficha.value.ficheiros) {
      ficha.value.ficheiros = [];
    }

    ficha.value.ficheiros.unshift(responseData);
    showFileDialog.value = false;

    toast.toast({
      title: "Sucesso",
      description: "Arquivo anexado com sucesso",
    });
  } catch (error: any) {
    console.error("Error uploading file:", error);
    toast.toast({
      title: "Erro",
      description: error.message || "Não foi possível anexar o arquivo",
      variant: "destructive",
    });
  } finally {
    uploadingFile.value = false;
  }
}

async function loadFichaTab() {
  loading.value = true;
  try {
    const tplRes = await fetch(`${apiBase}pacientes/template`, {
      headers: token.value ? { Authorization: `Bearer ${token.value}` } : {},
    });
    if (!tplRes.ok) throw new Error("Não foi possível carregar o template");
    template.value = await tplRes.json();

    if (props.paciente.fichas && props.paciente.fichas.length > 0) {
      ficha.value = props.paciente.fichas[0];
    } else {
      ficha.value = null;
    }
  } catch (err: any) {
    toast.toast({
      title: "Erro",
      description: err.message,
      variant: "destructive",
    });
  } finally {
    loading.value = false;
  }
}

// Lifecycle
watch(
  () => props.paciente,
  (newPaciente) => {
    if (newPaciente?.id && !props.isLoading) {
      loadFichaTab();
    }
  },
  { immediate: true }
);

function handleCancel() {
  toast.toast({ title: "Operação cancelada" });
}

onBeforeUnmount(() => {
  if (previewObjectUrl.value) {
    URL.revokeObjectURL(previewObjectUrl.value);
  }
});
</script>

<template>
  <div class="space-y-6">
    <div v-if="loading || props.isLoading" class="space-y-4">
      <Skeleton class="h-10 w-48" />
      <Skeleton class="h-64 rounded-2xl" />
    </div>

    <div v-else>
      <div class="flex justify-end mb-4 space-x-2">
        <Button variant="outline" size="sm" @click="handleAttachFile">
          <Paperclip class="h-4 w-4 mr-1" />
          Anexar Documento
        </Button>
        <Button variant="outline" size="sm" @click="handleAddNote">
          <PenLine class="h-4 w-4 mr-1" />
          Adicionar Anotação
        </Button>
      </div>

      <div
        class="border rounded-lg p-4 mb-6 cursor-pointer hover:bg-muted/50 transition-colors"
        @click="toggleFormExpansion"
      >
        <div class="flex justify-between items-center">
          <div>
            <h3 class="text-lg font-semibold">Ficha Clínica</h3>
            <p v-if="ficha?.id" class="text-sm text-muted-foreground">
              Última atualização:
              {{
                new Date(
                  ficha.data_atualizacao || ficha.data_criacao
                ).toLocaleString("pt-PT")
              }}
            </p>
            <p v-else class="text-sm text-muted-foreground">
              Ainda não existe uma ficha clínica para este paciente
            </p>
          </div>
          <div class="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Edit class="h-4 w-4 mr-1" />
              {{ ficha?.id ? "Editar Ficha" : "Criar Ficha" }}
            </Button>
            <component
              :is="isFormExpanded ? ChevronUp : ChevronDown"
              class="h-5 w-5"
            />
          </div>
        </div>
      </div>

      <Collapsible :open="isFormExpanded" class="mb-6">
        <CollapsibleContent>
          <div class="pt-4">
            <PatientsFicha
              v-if="template.length"
              :template="template"
              :id="ficha?.id"
              :ficha="ficha"
              :paciente="paciente"
              @cancel="handleCancel"
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      <div class="mt-8">
        <PatientsNotesList
          :notes="ficha?.anotacoes"
          :ficha-id="ficha?.id"
          @add-note="handleAddNote"
        />
      </div>

      <div class="mt-8">
        <PatientsFilesList
          :files="ficha?.ficheiros"
          :ficha-id="ficha?.id"
          @attach-file="handleAttachFile"
          @view-file="viewFile"
        />
      </div>
      <div class="mt-8">
        <PatientsProcedimentosHistorico
          :procedimentos="props.paciente?.procedimentos_historico"
        />
      </div>
    </div>

    <PatientsNoteDialog
      v-model:isOpen="showNoteDialog"
      :isSubmitting="submittingNote"
      @submit="submitNewNote"
    />

    <PatientsFileUploadDialog
      v-model:isOpen="showFileDialog"
      :isUploading="uploadingFile"
      @upload="uploadFile"
    />

    <PatientsFilePreviewDialog
      v-model:isOpen="showImageViewer"
      :title="previewImageTitle"
      :url="previewImageUrl"
      :file-type="previewImageTitle"
      :isLoading="previewLoading"
      @download="handleDownloadCurrentFile"
    />
  </div>
</template>
