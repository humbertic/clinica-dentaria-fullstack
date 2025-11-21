<template>
  <div class="space-y-6">
    <!-- Header com estatísticas - updated with clearer information -->
     <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent class="p-4">
          <div class="text-center">
            <p class="text-2xl font-bold">{{ estatisticas.quantidade }}</p>
            <p class="text-sm text-muted-foreground">Total de Faturas</p>
            <div class="mt-1 text-xs flex justify-center space-x-2">
              <span class="text-green-600">{{ estatisticas.pagas }} pagas</span>
              <span class="text-orange-500">{{ estatisticas.parciais }} parciais</span>
              <span class="text-red-500">{{ estatisticas.pendentes }} pendentes</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent class="p-4">
          <div class="text-center">
            <p class="text-2xl font-bold text-green-600">{{ formatCurrency(Number(totalPago)) }}</p>
            <p class="text-sm text-muted-foreground">Valor Pago</p>
            <div class="mt-1 text-xs">
              <span v-if="valorPagoParcelas > 0 && valorPagoDireto > 0">
                {{ formatCurrency(valorPagoParcelas) }} parcelas + {{ formatCurrency(valorPagoDireto) }} direto
              </span>
              <span v-else-if="valorPagoParcelas > 0">
                {{ formatCurrency(valorPagoParcelas) }} via parcelas
              </span>
              <span v-else-if="valorPagoDireto > 0">
                {{ formatCurrency(valorPagoDireto) }} pagamento direto
              </span>
              <span v-else>&nbsp;</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent class="p-4">
          <div class="text-center">
            <p class="text-2xl font-bold text-orange-600">{{ formatCurrency(valorPendente) }}</p>
            <p class="text-sm text-muted-foreground">Valor Pendente</p>
            <div class="mt-1 text-xs">
              <span v-if="valorPendente > 0">
                {{ percentualPendente }}% do total
              </span>
              <span v-else>&nbsp;</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent class="p-4">
          <div class="text-center">
            <p class="text-2xl font-bold">{{ formatCurrency(Number(estatisticas.total)) }}</p>
            <p class="text-sm text-muted-foreground">Valor Total</p>
            <div class="mt-1 text-xs">
              <span v-if="estatisticas.comParcelas && estatisticas.comPagamentosDiretos">
                {{ estatisticas.comParcelas }} parceladas, 
                {{ estatisticas.comPagamentosDiretos }} diretas
              </span>
              <span v-else-if="estatisticas.comParcelas">
                {{ estatisticas.comParcelas }} com parcelas
              </span>
              <span v-else-if="estatisticas.comPagamentosDiretos">
                {{ estatisticas.comPagamentosDiretos }} com pagamento direto
              </span>
              <span v-else>&nbsp;</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center p-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>

    <!-- Error state -->
    <Card v-else-if="error" class="border-red-200">
      <CardContent class="p-6 text-center">
        <p class="text-red-600">{{ error }}</p>
        <Button @click="loadFaturas" class="mt-4">Tentar Novamente</Button>
      </CardContent>
    </Card>

    <!-- Lista de faturas -->
    <FaturasList 
      v-else
      :faturas="faturas"
      @view-details="handleViewDetails"
      @pay="handlePay"
    />

    <!-- Modal de detalhes -->
    <Dialog :open="showDetails" @update:open="showDetails = $event">
      <DialogContent class="max-w-[95vw] sm:max-w-4xl max-h-[80vh] overflow-y-auto">
        <FaturasDetail 
          v-if="selectedFatura"
          :fatura="selectedFatura"
          @pay-parcela="handlePaymentParcela"
          @refresh="refreshFatura"
        />
        
        <DialogFooter>
          <Button @click="showDetails = false" variant="outline">Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Modal de pagamento -->
    <FaturasPaymentModal
      :open="showPayment"
      :fatura-id="selectedFaturaId"
      :parcela-id="selectedParcelaId"
      :parcelas="selectedParcelas"
      @close="showPayment = false"
      @payment-success="handlePaymentSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { useFaturacao,formatCurrency } from '@/composables/useFaturacao';
import type { FaturaRead } from '@/types/fatura';

const props = defineProps<{
  pacienteId: number;
}>();

// Estado local
const showDetails = ref(false);
const showPayment = ref(false);
const selectedParcelaId = ref<number | null>(null);
const selectedFaturaId = ref<number | null>(null);
const selectedFatura = ref<FaturaRead | null>(null);
import type { ParcelaRead } from '@/types/fatura';
const selectedParcelas = ref<ParcelaRead[]>([]); // Initialize with an empty array

// Composable
const { faturas, loading, error, estatisticas, fetchFaturasPaciente, getFatura } = useFaturacao();

// Computed para parcelas da fatura selecionada
// const selectedParcelas = computed(() => {
//   if (!selectedFaturaId.value) return [];
//   const fatura = getFatura(selectedFaturaId.value);
//   return fatura?.parcelas || [];
// });


const valorPagoParcelas = computed(() => {
  if (!faturas.value?.length) return 0;
  
  // Sum all valor_pago values from parcelas across all faturas
  return faturas.value.reduce((total, fatura) => {
    if (!fatura.parcelas?.length) return total;
    
    const parcelasTotal = fatura.parcelas.reduce((sum, p) => {
      const valorPago = p.valor_pago !== null && p.valor_pago !== undefined 
        ? Number(p.valor_pago) 
        : 0;
      return sum + valorPago;
    }, 0);
    
    return total + parcelasTotal;
  }, 0);
});


const valorPagoDireto = computed(() => {
  if (!faturas.value?.length) return 0;
  
  // Sum all direct payments across all faturas
  return faturas.value.reduce((total, fatura) => {
    if (!fatura.pagamentos?.length) return total;
    
    const pagamentosTotal = fatura.pagamentos.reduce((sum, p) => {
      const valor = p.valor !== null && p.valor !== undefined 
        ? Number(p.valor) 
        : 0;
      return sum + valor;
    }, 0);
    
    return total + pagamentosTotal;
  }, 0);
});

const calculaPercentualPendente = computed(() => {
  if (estatisticas.value.total <= 0) return 0;
  return Math.round((estatisticas.value.pendente / estatisticas.value.total) * 100);
});

const totalPago = computed(() => valorPagoParcelas.value + valorPagoDireto.value);

const valorPendente = computed(() => {
  const total = Number(estatisticas.value.total || 0);
  return Math.max(0, total - totalPago.value);
});

const percentualPendente = computed(() => {
  const total = Number(estatisticas.value.total || 0);
  if (total <= 0) return 0;
  return Math.round((valorPendente.value / total) * 100);
});


// Carregar faturas
const loadFaturas = async () => {
  await fetchFaturasPaciente(props.pacienteId);
};

// Handlers
const handleViewDetails = async (faturaId: number) => {
  selectedFatura.value = (await getFatura(faturaId)) || null;
  showDetails.value = true;
};

const handlePay = async (faturaId: number) => {
  selectedFaturaId.value = faturaId;
  const fatura = await getFatura(faturaId);
  selectedParcelas.value = fatura?.parcelas || [];
  showPayment.value = true;
};

const handlePaymentParcela = async (parcela: ParcelaRead) => {
  // Set the selected fatura ID based on the parcela's parent fatura
 selectedParcelaId.value = parcela.id;
 showPayment.value = true;
  
 
};
const handlePaymentSuccess = async () => {
  // Refresh all faturas to update the statistics at the top
  await loadFaturas();
  
  // If a fatura is being viewed in the details modal, refresh it too
  if (showDetails.value && selectedFatura.value) {
    selectedFatura.value = await getFatura(selectedFatura.value.id);
  }
  
  // If we were just paying for the currently selected fatura, refresh its data
  if (selectedFaturaId.value) {
    const updatedFatura = await getFatura(selectedFaturaId.value);
    
    // If the details modal is showing this fatura, update it there too
    if (showDetails.value && selectedFatura.value?.id === selectedFaturaId.value) {
      selectedFatura.value = updatedFatura;
    }
    
    // Update parcelas in case we need them again
    selectedParcelas.value = updatedFatura?.parcelas || [];
  }
  
  // Close payment modal
  showPayment.value = false;
};

async function refreshFatura() {
  if (selectedFaturaId.value) {
    selectedFatura.value = await getFatura(selectedFaturaId.value);
  }
}


// Lifecycle
onMounted(() => {
  loadFaturas();
});
</script>