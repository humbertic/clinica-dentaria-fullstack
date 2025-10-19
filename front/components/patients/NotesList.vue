<script setup lang="ts">
import { PenLine } from "lucide-vue-next";
import { useToast } from "@/components/ui/toast";

const props = defineProps({
  notes: {
    type: Array,
    default: () => [],
  },
  fichaId: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(["add-note"]);

const toast = useToast();

function handleAddNote() {
  if (!props.fichaId) {
    toast.toast({
      title: "Aviso",
      description: "É necessário salvar a ficha clínica primeiro.",
    });
    return;
  }

  emit("add-note");
}
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-semibold">Anotações Clínicas</h3>
      <Button variant="outline" size="sm" @click="handleAddNote">
        <PenLine class="h-4 w-4 mr-1" />
        Adicionar Anotação
      </Button>
    </div>

    <div v-if="notes?.length" class="space-y-3">
      <div
        v-for="anotacao in notes"
        :key="anotacao.id"
        class="border rounded-lg p-4"
      >
        <div class="flex justify-between mb-2">
          <span class="text-sm font-medium">{{
            anotacao.autor || "Usuário do sistema"
          }}</span>
          <span class="text-sm text-muted-foreground">
            {{ new Date(anotacao.data).toLocaleString("pt-PT") }}
          </span>
        </div>
        <p class="text-sm">{{ anotacao.texto }}</p>
      </div>
    </div>
    <div v-else class="text-center py-8 border rounded-lg">
      <p class="text-muted-foreground">Nenhuma anotação clínica registrada</p>
      <Button variant="outline" size="sm" class="mt-4" @click="handleAddNote">
        <PenLine class="h-4 w-4 mr-1" />
        Adicionar primeira anotação
      </Button>
    </div>
  </div>
</template>