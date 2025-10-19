<script setup lang="ts">
import { Paperclip, ExternalLink, FileIcon, FileText, FileSpreadsheet, ImageIcon } from "lucide-vue-next";
import { useToast } from "@/components/ui/toast";

const props = defineProps({
  files: {
    type: Array,
    default: () => [],
  },
  fichaId: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(["attach-file", "view-file"]);

const toast = useToast();

function handleAttachFile() {
  if (!props.fichaId) {
    toast.toast({
      title: "Aviso",
      description: "É necessário salvar a ficha clínica primeiro.",
    });
    return;
  }

  emit("attach-file");
}

function getFileIcon(fileType: string) {
  if (!fileType) return FileIcon;
  
  switch (fileType.toLowerCase()) {
    case "radiografia":
    case "foto":
    case "imagem":
      return ImageIcon;
    case "documento":
    case "laudo":
      return FileText;
    case "planilha":
    case "tabela":
      return FileSpreadsheet;
    default:
      return FileIcon;
  }
}
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-semibold">Documentos</h3>
      <Button variant="outline" size="sm" @click="handleAttachFile">
        <Paperclip class="h-4 w-4 mr-1" />
        Anexar Documento
      </Button>
    </div>

    <div v-if="files?.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="ficheiro in files"
        :key="ficheiro.id"
        class="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
      >
        <div class="flex items-center mb-2">
          <component
            :is="getFileIcon(ficheiro.tipo)"
            class="h-6 w-6 mr-2 text-primary"
          />
          <div class="flex-1">
            <p class="font-medium">{{ ficheiro.tipo }}</p>
            <p class="text-xs text-muted-foreground">
              {{ new Date(ficheiro.data_upload).toLocaleString("pt-PT") }}
            </p>
          </div>
        </div>

        <div class="flex justify-end mt-2">
          <Button variant="outline" size="sm" @click="$emit('view-file', ficheiro)">
            <ExternalLink class="h-4 w-4 mr-1" />
            Visualizar
          </Button>
        </div>
      </div>
    </div>
    <div v-else class="text-center py-8 border rounded-lg">
      <p class="text-muted-foreground">Nenhum documento anexado</p>
      <Button variant="outline" size="sm" class="mt-4" @click="handleAttachFile">
        <Paperclip class="h-4 w-4 mr-1" />
        Anexar Documento
      </Button>
    </div>
  </div>
</template>