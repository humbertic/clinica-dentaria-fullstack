<script setup lang="ts">
import { ref } from "vue";

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  isSubmitting: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:isOpen", "submit"]);

const noteText = ref("");

function handleSubmit() {
  if (!noteText.value.trim()) return;
  emit("submit", noteText.value);
  noteText.value = "";
}
</script>

<template>
  <Dialog :open="isOpen" @update:open="$emit('update:isOpen', $event)">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Adicionar Anotação Clínica</DialogTitle>
        <DialogDescription>
          Adicione informações relevantes sobre o paciente ou tratamento
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-4 py-4">
        <Textarea
          v-model="noteText"
          placeholder="Digite aqui a anotação clínica..."
          :disabled="isSubmitting"
          rows="5"
          class="w-full"
        />
      </div>

      <DialogFooter>
        <Button
          variant="outline"
          @click="$emit('update:isOpen', false)"
          :disabled="isSubmitting"
        >
          Cancelar
        </Button>
        <Button
          @click="handleSubmit"
          :disabled="!noteText.trim() || isSubmitting"
          :loading="isSubmitting"
        >
          Salvar Anotação
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>