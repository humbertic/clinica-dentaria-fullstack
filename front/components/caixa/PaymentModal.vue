<template>
  <Dialog :open="open" @update:open="$emit('close')">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Registrar Pagamento</DialogTitle>
        <DialogDescription>
          {{ targetType === 'fatura' ? 'Fatura' : 'Parcela' }} - {{ clientName }}
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Valor devido -->
        <div class="bg-muted/50 p-3 rounded-lg">
          <div class="flex justify-between items-center">
            <span class="text-sm text-muted-foreground">Valor devido:</span>
            <span class="font-bold text-lg">{{ formatCurrency(amountDue) }}</span>
          </div>
        </div>

        <!-- Valor a pagar -->
        <div class="space-y-2">
          <Label for="valorPagar">Valor a Pagar (CVE)</Label>
          <Input
            id="valorPagar"
            v-model.number="valorPagar"
            type="number"
            step="0.01"
            min="0"
            :max="amountDue"
            placeholder="0,00"
            required
            class="text-lg"
          />
        </div>

        <!-- Método de pagamento -->
        <div class="space-y-2">
          <Label for="metodo">Método de Pagamento</Label>
          <Select v-model="metodoPagamento">
            <SelectTrigger>
              <SelectValue placeholder="Selecione o método" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dinheiro">
                <div class="flex items-center gap-2">
                  <BanknoteIcon class="w-4 h-4" />
                  Dinheiro
                </div>
              </SelectItem>
              <SelectItem value="cartao">
                <div class="flex items-center gap-2">
                  <CreditCardIcon class="w-4 h-4" />
                  Cartão
                </div>
              </SelectItem>
              <SelectItem value="transferencia">
                <div class="flex items-center gap-2">
                  <ArrowRightLeftIcon class="w-4 h-4" />
                  Transferência
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Data do pagamento -->
        <div class="space-y-2">
          <Label for="data">Data do Pagamento</Label>
          <Input
            id="data"
            v-model="dataPagamento"
            type="datetime-local"
            required
          />
        </div>

        <!-- Observações -->
        <div class="space-y-2">
          <Label for="observacoes">Observações (opcional)</Label>
          <Textarea
            id="observacoes"
            v-model="observacoes"
            placeholder="Observações sobre o pagamento..."
            rows="3"
          />
        </div>

        <!-- Troco (apenas para dinheiro) -->
        <div v-if="metodoPagamento === 'dinheiro' && valorRecebido > valorPagar" class="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
          <div class="space-y-2">
            <Label for="valorRecebido">Valor Recebido (CVE)</Label>
            <Input
              id="valorRecebido"
              v-model.number="valorRecebido"
              type="number"
              step="0.01"
              :min="valorPagar"
              placeholder="0,00"
              class="text-lg"
            />
            <div v-if="troco > 0" class="flex justify-between items-center font-medium">
              <span>Troco:</span>
              <span class="text-lg">{{ formatCurrency(troco) }}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" @click="$emit('close')">
            Cancelar
          </Button>
          <Button 
            type="submit" 
            :disabled="loading || !isFormValid"
          >
            <div v-if="loading" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Confirmar Pagamento
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { BanknoteIcon, CreditCardIcon, ArrowRightLeftIcon } from 'lucide-vue-next';
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
  sessionId: number;
  targetType: 'fatura' | 'parcela';
  targetId: number;
  amountDue: number;
  clientName: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'paid'): void;
}>();

// Estado do formulário
const valorPagar = ref<number>(0);
const valorRecebido = ref<number>(0);
const metodoPagamento = ref<string>('');
const dataPagamento = ref<string>('');
const observacoes = ref<string>('');

// Computed
const troco = computed(() => Math.max(0, valorRecebido.value - valorPagar.value));

const isFormValid = computed(() => {
  return valorPagar.value > 0 && 
         valorPagar.value <= props.amountDue && 
         metodoPagamento.value && 
         dataPagamento.value;
});

// Composable
const { pay, loading } = useCashier();

// Watchers
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    resetForm();
  }
});

watch(() => valorPagar.value, (newValue) => {
  if (metodoPagamento.value === 'dinheiro' && newValue > 0) {
    valorRecebido.value = newValue;
  }
});

// Métodos
const resetForm = () => {
  valorPagar.value = props.amountDue;
  valorRecebido.value = props.amountDue;
  metodoPagamento.value = '';
  dataPagamento.value = new Date().toISOString().slice(0, 16);
  observacoes.value = '';
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('cv-CV', {
    style: 'currency',
    currency: 'CVE'
  }).format(value);
};

const handleSubmit = async () => {
  if (!isFormValid.value) return;

  try {
    await pay(props.sessionId, {
      targetType: props.targetType,
      targetId: props.targetId,
      valorPago: valorPagar.value,
      metodo: metodoPagamento.value as 'dinheiro' | 'cartao' | 'transferencia',
      observacoes: observacoes.value || undefined
    });
    
    emit('paid');
  } catch (error) {
    console.error('Erro ao processar pagamento:', error);
  }
};
</script>