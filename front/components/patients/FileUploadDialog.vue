<script setup lang="ts">
import { ref } from "vue";
import { XCircle, Upload, FileIcon } from "lucide-vue-next";

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  isUploading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:isOpen", "upload"]);

const fileType = ref("documento");
const selectedFile = ref<File | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0];
  }
}

function resetFileSelection() {
  selectedFile.value = null;
  if (fileInputRef.value) {
    fileInputRef.value.value = "";
  }
}

function handleSubmit() {
  if (!selectedFile.value) return;
  emit("upload", { file: selectedFile.value, type: fileType.value });
  resetFileSelection();
  fileType.value = "documento";
}
</script>

<template>
  <Dialog :open="isOpen" @update:open="$emit('update:isOpen', $event)">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Anexar Documento</DialogTitle>
        <DialogDescription>
          Carregue um documento para a ficha clínica do paciente
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-4 py-4">
        <div class="space-y-2">
          <Label for="file-type">Tipo de Documento</Label>
          <Select v-model="fileType">
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="radiografia">Radiografia</SelectItem>
              <SelectItem value="foto">Fotografia</SelectItem>
              <SelectItem value="documento">Documento</SelectItem>
              <SelectItem value="laudo">Laudo</SelectItem>
              <SelectItem value="exame">Exame</SelectItem>
              <SelectItem value="outro">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-2">
          <Label for="file-upload">Arquivo</Label>
          <div
            class="border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
            @click="() => fileInputRef?.click()"
          >
            <div v-if="!selectedFile" class="flex flex-col items-center">
              <Upload class="h-8 w-8 mb-2 text-muted-foreground" />
              <p>Clique para selecionar um arquivo</p>
              <p class="text-xs text-muted-foreground mt-1">
                Suporta imagens, documentos PDF, e arquivos DICOM
              </p>
            </div>
            <div v-else class="flex items-center justify-center space-x-2">
              <FileIcon class="h-5 w-5" />
              <span class="text-sm font-medium">{{ selectedFile.name }}</span>
              <Button
                variant="ghost"
                size="sm"
                @click.stop="resetFileSelection"
              >
                <XCircle class="h-4 w-4" />
              </Button>
            </div>
            <input
              ref="fileInputRef"
              type="file"
              class="hidden"
              @change="handleFileSelect"
            />
          </div>
          <p v-if="selectedFile" class="text-xs text-muted-foreground mt-1">
            {{ (selectedFile.size / 1024).toFixed(1) }} KB
          </p>
        </div>
      </div>

      <DialogFooter>
        <Button
          variant="outline"
          @click="$emit('update:isOpen', false)"
          :disabled="isUploading"
        >
          Cancelar
        </Button>
        <Button
          @click="handleSubmit"
          :disabled="!selectedFile || isUploading"
          :loading="isUploading"
        >
          Enviar Arquivo
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>