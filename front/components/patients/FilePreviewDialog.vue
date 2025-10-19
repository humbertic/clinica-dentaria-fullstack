<script setup lang="ts">
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: "",
  },
  url: {
    type: String,
    default: "",
  },
  fileType: {
    type: String,
    default: "",
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:isOpen", "download"]);

function isPdfType(fileType: string) {
  if (!fileType) return false;
  return (
    ["documento", "laudo"].includes(fileType.toLowerCase()) ||
    fileType.toLowerCase().endsWith(".pdf")
  );
}
</script>

<template>
  <Dialog :open="isOpen" @update:open="$emit('update:isOpen', $event)">
    <DialogContent class="sm:max-w-3xl">
      <DialogHeader>
        <DialogTitle>{{ title }}</DialogTitle>
      </DialogHeader>

      <div class="py-4 flex justify-center">
        <!-- Loading indicator -->
        <div v-if="isLoading" class="text-center py-8">
          <div
            class="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
          ></div>
          <p>Carregando visualização...</p>
        </div>

        <!-- Image preview -->
        <img
          v-else-if="!isPdfType(fileType) && url"
          :src="url"
          :alt="title"
          class="max-h-[70vh] object-contain"
        />

        <!-- PDF preview -->
        <iframe
          v-else-if="isPdfType(fileType) && url"
          :src="url"
          class="w-full h-[70vh]"
          frameborder="0"
        ></iframe>

        <!-- No preview available -->
        <div v-else class="text-center py-8">
          <p>Não foi possível carregar a visualização</p>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="$emit('update:isOpen', false)">
          Fechar
        </Button>
        <Button
          variant="outline"
          @click="$emit('download')"
        >
          Baixar
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>