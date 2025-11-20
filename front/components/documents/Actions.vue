<script setup lang="ts">
import { Download, Mail, Eye, Loader2 } from "lucide-vue-next";
import { useToast } from "@/components/ui/toast";
import { computed, ref } from "vue";

type DocumentType = "fatura" | "orcamento" | "plano";

const props = defineProps<{
  type: DocumentType;
  id: number;
  clinicaId?: number;
  pacienteEmail?: string;
}>();

const { toast } = useToast();
const config = useRuntimeConfig();
const baseUrl = config.public.apiBase;
const token = useCookie("token").value;

const loading = ref({
  download: false,
  view: false,
  email: false,
});

const showEmailDialog = ref(false);
const customEmail = ref("");

// Computed
const documentLabel = computed(() => {
  const labels: Record<DocumentType, string> = {
    fatura: "Fatura",
    orcamento: "Orçamento",
    plano: "Plano de Tratamento",
  };
  return labels[props.type];
});

const pdfEndpoint = computed(() => {
  const endpoints: Record<DocumentType, string> = {
    fatura: `faturacao/faturas/${props.id}/pdf`,
    orcamento: `orcamento/${props.id}/pdf`,
    plano: `planos/${props.id}/pdf`,
  };
  return endpoints[props.type];
});

const emailEndpoint = computed(() => {
  const endpoints: Record<DocumentType, string> = {
    fatura: `email/fatura/${props.id}`,
    orcamento: `email/orcamento/${props.id}`,
    plano: `email/plano/${props.id}`,
  };
  return endpoints[props.type];
});

// Methods
async function downloadPDF() {
  loading.value.download = true;
  try {
    const response = await fetch(`${baseUrl}${pdfEndpoint.value}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!response.ok) {
      throw new Error(`Erro ao baixar PDF: ${response.statusText}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${props.type}_${props.id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Sucesso",
      description: `${documentLabel.value} baixado com sucesso`,
    });
  } catch (error) {
    console.error("Erro ao baixar PDF:", error);
    toast({
      title: "Erro",
      description:
        error instanceof Error ? error.message : "Erro ao baixar PDF",
      variant: "destructive",
    });
  } finally {
    loading.value.download = false;
  }
}

async function viewPDF() {
  loading.value.view = true;
  try {
    const response = await fetch(`${baseUrl}${pdfEndpoint.value}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!response.ok) {
      throw new Error(`Erro ao visualizar PDF: ${response.statusText}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    window.open(url, "_blank");
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Erro ao visualizar PDF:", error);
    toast({
      title: "Erro",
      description:
        error instanceof Error ? error.message : "Erro ao visualizar PDF",
      variant: "destructive",
    });
  } finally {
    loading.value.view = false;
  }
}

function openEmailDialog() {
  customEmail.value = props.pacienteEmail || "";
  showEmailDialog.value = true;
}

async function sendEmail() {
  if (!customEmail.value && !props.pacienteEmail) {
    toast({
      title: "Erro",
      description: "É necessário um endereço de email",
      variant: "destructive",
    });
    return;
  }

  if (!props.clinicaId) {
    toast({
      title: "Erro",
      description: "ID da clínica não fornecido",
      variant: "destructive",
    });
    return;
  }

  loading.value.email = true;
  try {
    const emailParam = customEmail.value || props.pacienteEmail;
    const url = `${baseUrl}${emailEndpoint.value}?clinica_id=${props.clinicaId}${
      emailParam ? `&email_para=${encodeURIComponent(emailParam)}` : ""
    }`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || `Erro ao enviar email: ${response.statusText}`
      );
    }

    toast({
      title: "Sucesso",
      description: `${documentLabel.value} enviado por email para ${emailParam}`,
    });

    showEmailDialog.value = false;
  } catch (error) {
    console.error("Erro ao enviar email:", error);
    toast({
      title: "Erro",
      description:
        error instanceof Error ? error.message : "Erro ao enviar email",
      variant: "destructive",
    });
  } finally {
    loading.value.email = false;
  }
}
</script>

<template>
  <div class="flex items-center gap-2">
    <!-- Download Button -->
    <Button
      variant="outline"
      size="sm"
      @click="downloadPDF"
      :disabled="loading.download"
      title="Baixar PDF"
    >
      <Loader2 v-if="loading.download" class="h-4 w-4 animate-spin" />
      <Download v-else class="h-4 w-4" />
      <span class="ml-1 hidden sm:inline">Baixar</span>
    </Button>

    <!-- View Button -->
    <Button
      variant="outline"
      size="sm"
      @click="viewPDF"
      :disabled="loading.view"
      title="Visualizar PDF"
    >
      <Loader2 v-if="loading.view" class="h-4 w-4 animate-spin" />
      <Eye v-else class="h-4 w-4" />
      <span class="ml-1 hidden sm:inline">Ver</span>
    </Button>

    <!-- Email Button -->
    <Button
      variant="outline"
      size="sm"
      @click="openEmailDialog"
      :disabled="loading.email"
      title="Enviar por Email"
    >
      <Mail class="h-4 w-4" />
      <span class="ml-1 hidden sm:inline">Email</span>
    </Button>

    <!-- Email Dialog -->
    <Dialog v-model:open="showEmailDialog">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enviar {{ documentLabel }} por Email</DialogTitle>
          <DialogDescription>
            Digite o endereço de email para enviar o documento.
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-4 py-4">
          <div class="space-y-2">
            <Label for="email">Email do Destinatário</Label>
            <Input
              id="email"
              v-model="customEmail"
              type="email"
              placeholder="email@exemplo.com"
              :disabled="loading.email"
            />
            <p v-if="pacienteEmail" class="text-xs text-muted-foreground">
              Email padrão do paciente: {{ pacienteEmail }}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            @click="showEmailDialog = false"
            :disabled="loading.email"
          >
            Cancelar
          </Button>
          <Button @click="sendEmail" :disabled="loading.email">
            <Loader2 v-if="loading.email" class="h-4 w-4 mr-2 animate-spin" />
            <Mail v-else class="h-4 w-4 mr-2" />
            Enviar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
