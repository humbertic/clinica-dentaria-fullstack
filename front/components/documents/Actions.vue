<script setup lang="ts">
import { Download, Mail, Eye, Loader2 } from "lucide-vue-next";
import { computed, ref } from "vue";
import type { Clinica } from "~/types/clinica";

type DocumentType = "fatura" | "orcamento" | "plano";

const props = defineProps<{
  type: DocumentType;
  id: number;
  clinicaId?: number;
  pacienteEmail?: string;
}>();

// Composables
const { viewPdf, downloadPdf, loading: pdfLoading } = usePdf();
const {
  enviarFatura,
  enviarOrcamento,
  enviarPlano,
  loading: emailLoading,
} = useEmail();

// State
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
    fatura: `pdf/fatura/${props.id}`,
    orcamento: `pdf/orcamento/${props.id}`,
    plano: `pdf/plano/${props.id}`,
  };
  return endpoints[props.type];
});

// Methods
async function handleDownload() {
  await downloadPdf(pdfEndpoint.value, `${props.type}_${props.id}.pdf`);
}

async function handleView() {
  await viewPdf(pdfEndpoint.value, `${documentLabel.value} ${props.id}`);
}

function openEmailDialog() {
  customEmail.value = props.pacienteEmail || "";
  showEmailDialog.value = true;
}

async function sendEmail() {
  if (!customEmail.value && !props.pacienteEmail) {
    return;
  }

  if (!props.clinicaId) {
    return;
  }

  const emailPara = customEmail.value || props.pacienteEmail;
  let success = false;

  // Use the appropriate composable method based on document type
  switch (props.type) {
    case "fatura":
      success = await enviarFatura(props.id, props.clinicaId, emailPara);
      break;
    case "orcamento":
      success = await enviarOrcamento(props.id, props.clinicaId, emailPara);
      break;
    case "plano":
      success = await enviarPlano(props.id, props.clinicaId, emailPara);
      break;
  }

  if (success) {
    showEmailDialog.value = false;
  }
}
</script>

<template>
  <div class="flex items-center gap-2">
    <!-- Download Button -->
    <Button
      variant="outline"
      size="sm"
      @click="handleDownload"
      :disabled="pdfLoading"
      title="Baixar PDF"
    >
      <Loader2 v-if="pdfLoading" class="h-4 w-4 animate-spin" />
      <Download v-else class="h-4 w-4" />
      <span class="ml-1 hidden sm:inline">Baixar</span>
    </Button>

    <!-- View Button -->
    <Button
      variant="outline"
      size="sm"
      @click="handleView"
      :disabled="pdfLoading"
      title="Visualizar PDF"
    >
      <Loader2 v-if="pdfLoading" class="h-4 w-4 animate-spin" />
      <Eye v-else class="h-4 w-4" />
      <span class="ml-1 hidden sm:inline">Ver</span>
    </Button>

    <!-- Email Button -->
    <Button
      variant="outline"
      size="sm"
      @click="openEmailDialog"
      :disabled="emailLoading"
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
              :disabled="emailLoading"
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
            :disabled="emailLoading"
          >
            Cancelar
          </Button>
          <Button @click="sendEmail" :disabled="emailLoading">
            <Loader2 v-if="emailLoading" class="h-4 w-4 mr-2 animate-spin" />
            <Mail v-else class="h-4 w-4 mr-2" />
            Enviar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
