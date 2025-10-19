<template>
  <Dialog :open="open" @update:open="$emit('close')">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Fechar Caixa</DialogTitle>
        <DialogDescription>
          Confirme os valores recebidos e informe o valor final em dinheiro
        </DialogDescription>
      </DialogHeader>

      <div v-if="session" class="space-y-4">
        <!-- Resumo da sessão -->
        <div class="bg-muted/50 p-4 rounded-lg space-y-3">
          <div class="flex justify-between">
            <span>Valor Inicial:</span>
            <span class="font-medium">{{ formatCurrency(session.valor_inicial) }}</span>
          </div>
          
          <!-- Pagamentos por método -->
          <div class="space-y-1.5">
            <h4 class="text-sm font-medium mb-1">Recebimentos por método:</h4>
            
            <!-- Show all payment methods with counts -->
            <div v-for="(method, index) in paymentMethods" :key="index" 
                 class="flex justify-between items-center text-sm">
              <div class="flex items-center gap-1.5">
                <div class="w-2 h-2 rounded-full" :class="method.color"></div>
                <span>{{ method.label }}</span>
                <Badge v-if="getMethodCount(method.key) > 0" variant="outline" class="ml-1 text-xs">
                  {{ getMethodCount(method.key) }}
                </Badge>
              </div>
              <span>{{ formatCurrency(getMethodTotal(method.key)) }}</span>
            </div>
            
            <div class="flex justify-between font-medium text-sm pt-1 border-t mt-1">
              <span>Total Recebido:</span>
              <span>{{ formatCurrency(summary.totalRecebido) }}</span>
            </div>
          </div>
          
          <div class="flex justify-between border-t pt-2">
            <div class="flex flex-col">
              <span class="font-medium">Dinheiro Esperado:</span>
              <span class="text-xs text-muted-foreground">(Valor inicial + Pagamentos em dinheiro)</span>
            </div>
            <span class="font-bold">{{ formatCurrency(saldoEsperadoDinheiro) }}</span>
          </div>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="space-y-2">
            <Label for="valorFinal">Valor Final em Dinheiro</Label>
            <Input
              id="valorFinal"
              v-model.number="valorFinal"
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              required
              class="text-lg"
            />
          </div>

          <!-- Diferença -->
          <div v-if="valorFinal > 0" class="p-3 rounded-lg" :class="diferencaClass">
            <div class="flex justify-between items-center">
              <span class="font-medium">Diferença:</span>
              <span class="font-bold">{{ formatCurrency(diferenca) }}</span>
            </div>
            <p class="text-sm mt-1">
              {{ diferencaMessage }}
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" @click="$emit('close')">
              Cancelar
            </Button>
            <Button 
              type="submit" 
              :disabled="loading || valorFinal < 0"
              variant="destructive"
            >
              <div v-if="loading" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Fechar Caixa
            </Button>
          </DialogFooter>
        </form>
      </div>
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
import { Badge } from '@/components/ui/badge';
import { useCashier } from '@/composables/useCashier';
import type { CashierSession, CashierSummary } from '@/types/caixa';

const props = defineProps<{
  open: boolean;
  session: CashierSession | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'session-closed'): void;
}>();

// Composable
const { closeSession, loading, summary, paymentSummary, fetchOpenSession } = useCashier();

// Make sure we have the latest data when opening the modal
watch(() => props.open, async (isOpen) => {
  if (isOpen && props.session) {
    // Refresh data to get latest payment summary
    await fetchOpenSession();
    valorFinal.value = saldoEsperadoDinheiro.value;
  }
});

// Estado do formulário
const valorFinal = ref<number>(0);

// Payment method definitions
const paymentMethods = [
  { key: 'dinheiro', label: 'Dinheiro', color: 'bg-green-500' },
  { key: 'cartao', label: 'Cartão', color: 'bg-blue-500' },
  { key: 'transferencia', label: 'Transferência', color: 'bg-purple-500' },
];

// Helper methods to get data from paymentSummary
const getMethodTotal = (method: string): number => {
  return paymentSummary.value.by_method?.[method]?.total || 0;
};

const getMethodCount = (method: string): number => {
  return paymentSummary.value.by_method?.[method]?.count || 0;
};

// Computed
const saldoEsperadoDinheiro = computed(() => {
  return (props.session?.valor_inicial || 0) + getMethodTotal('dinheiro');
});

const diferenca = computed(() => valorFinal.value - saldoEsperadoDinheiro.value);

const diferencaClass = computed(() => {
  if (diferenca.value > 0) return 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200';
  if (diferenca.value < 0) return 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200';
  return 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200';
});

const diferencaMessage = computed(() => {
  if (diferenca.value > 0) return `Sobra de caixa: ${formatCurrency(diferenca.value)}`;
  if (diferenca.value < 0) return `Falta de caixa: ${formatCurrency(Math.abs(diferenca.value))}`;
  return 'Caixa confere exatamente!';
});

// Métodos
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('cv-CV', {
    style: 'currency',
    currency: 'CVE',
  }).format(value);
};

const handleSubmit = async () => {
  if (!props.session) return;
  
  try {
    await closeSession(props.session.id, valorFinal.value);
    emit('session-closed');
  } catch (error) {
    console.error('Erro ao fechar sessão:', error);
  }
};
</script>