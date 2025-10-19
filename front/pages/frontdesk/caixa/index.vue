<template>
  <div class="container mx-auto p-6 space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold">Caixa do Dia</h1>
        <p class="text-muted-foreground">
          {{ session ? `Sessão aberto em ${formatDateTime(session.data_inicio)}` : 'Nenhuma sessão ativa' }}
        </p>
      </div>
      
      <div class="flex gap-2">
        <Button 
          v-if="!session" 
          @click="showOpenModal = true"
          class="bg-green-600 hover:bg-green-700"
        >
          <PlusIcon class="w-4 h-4 mr-2" />
          Abrir Caixa
        </Button>
        
        <Button 
          v-if="session && session.status === 'aberto'" 
          @click="showCloseModal = true"
          variant="destructive"
        >
          <XIcon class="w-4 h-4 mr-2" />
          Fechar Caixa
        </Button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center p-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>

    <!-- Session Content -->
    <div v-else-if="session" class="space-y-6">
      <!-- Summary Cards -->
      <CaixaSummaryCards :summary="summary" />
      
      <!-- Pending Tables -->
      <CaixaPendingTable
        :pending-invoices="pendingInvoices"
        :pending-parcels="pendingParcels"
        @pay-invoice="handlePayInvoice"
        @pay-parcela="handlePayParcela"
      />
       <CaixaPaymentHistory
        v-if="payments.length > 0"
        :payments="payments"
      />
    </div>

   

    <!-- No Session State -->
    <Card v-else class="p-8 text-center">
      <CardContent>
        <WalletMinimal class="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h3 class="text-xl font-semibold mb-2">Nenhuma sessão de caixa ativa</h3>
        <p class="text-muted-foreground mb-4">
          Abra uma nova sessão para começar a registrar pagamentos
        </p>
        <Button @click="showOpenModal = true" class="bg-green-600 hover:bg-green-700">
          <PlusIcon class="w-4 h-4 mr-2" />
          Abrir Caixa
        </Button>
      </CardContent>
    </Card>

    <!-- Modals -->
    <CaixaOpenSessionModal
      :open="showOpenModal"
      @close="showOpenModal = false"
      @session-opened="handleSessionOpened"
    />

    <CaixaCloseSessionModal
      :open="showCloseModal"
      :session="session"
      @close="showCloseModal = false"
      @session-closed="handleSessionClosed"
    />

    <CaixaPaymentModal
      :open="showPaymentModal"
      :session-id="session?.id || 0"
      :target-type="paymentTarget.type"
      :target-id="paymentTarget.id"
      :amount-due="paymentTarget.amount"
      :client-name="paymentTarget.clientName"
      @close="showPaymentModal = false"
      @paid="handlePaymentSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { PlusIcon, XIcon, WalletMinimal } from 'lucide-vue-next';
// Composable
const { 
  session, 
  pendingInvoices, 
  pendingParcels, 
  payments,
  loading, 
  summary,
  fetchOpenSession,
  fetchPending
} = useCashier();

// Estado local
const showOpenModal = ref(false);
const showCloseModal = ref(false);
const showPaymentModal = ref(false);
const paymentTarget = ref({
  type: 'fatura' as 'fatura' | 'parcela',
  id: 0,
  amount: 0,
  clientName: ''
});

// Métodos
const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('pt-PT');
};

const handleSessionOpened = async () => {
  showOpenModal.value = false;
  await fetchOpenSession();
  if (session.value) {
    await fetchPending(session.value.id);
  }
};

const handleSessionClosed = () => {
  showCloseModal.value = false;
  // Optionally navigate away or refresh
  fetchOpenSession();
};

const handlePayInvoice = (invoiceId: number) => {
  const invoice = pendingInvoices.value.find(inv => inv.id === invoiceId);
  if (invoice) {
    paymentTarget.value = {
      type: 'fatura',
      id: invoiceId,
      amount: invoice.pendente,
      clientName: invoice.paciente_nome
    };
    showPaymentModal.value = true;
  }
};

const handlePayParcela = (parcelaId: number) => {
  const parcela = pendingParcels.value.find(parc => parc.parcela_id === parcelaId);
  if (parcela) {
    paymentTarget.value = {
      type: 'parcela',
      id: parcelaId,
      amount: parcela.pendente,
      clientName: parcela.paciente_nome
    };
    showPaymentModal.value = true;
  }
};

const handlePaymentSuccess = async () => {
  showPaymentModal.value = false;
  
  if (session.value) {
    await Promise.all([
      fetchOpenSession(),
      fetchPending(session.value.id)
    ]);
  }
};

// Lifecycle
onMounted(async () => {
  const openSession = await fetchOpenSession();
  if (openSession) {
    await fetchPending(openSession.id);
  }
});
</script>