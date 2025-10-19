<template>
  <Dialog :open="open" @update:open="$emit('close')">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Abrir Caixa</DialogTitle>
        <DialogDescription>
          Informe o valor inicial em dinheiro para abrir a sessão de caixa
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="space-y-2">
          <Label for="valorInicial">Valor Inicial (CVE)</Label>
          <Input
            id="valorInicial"
            v-model.number="valorInicial"
            type="number"
            step="0.01"
            min="0"
            placeholder="0,00"
            required
            class="text-lg"
          />
          <p class="text-sm text-muted-foreground">
            Valor em dinheiro disponível no início do dia
          </p>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" @click="$emit('close')">
            Cancelar
          </Button>
          <Button 
            type="submit" 
            :disabled="loading || valorInicial < 0"
            class="bg-green-600 hover:bg-green-700"
          >
            <div v-if="loading" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Abrir Caixa
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/components/ui/dialog';
import { useCashier } from '@/composables/useCashier';

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'session-opened'): void;
}>();

// Composable
const { openSession, loading } = useCashier();

// Estado do formulário
const valorInicial = ref<number>(0);

// Reset form when modal opens
onMounted(() => {
  watch(() => props.open, (isOpen) => {
    if (isOpen) {
      valorInicial.value = 0;
    }
  });
})


// Métodos
const handleSubmit = async () => {
  try {
    await openSession(valorInicial.value);
    emit('session-opened');
  } catch (error) {
    console.error('Erro ao abrir sessão:', error);
  }
};
</script>