<template>
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center gap-2">
        <HistoryIcon class="w-5 h-5" />
        Histórico de Pagamentos
        <Badge variant="secondary">{{ payments.length }}</Badge>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div class="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hora</TableHead>
              <TableHead>Paciente</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Método</TableHead>
              <TableHead class="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="payment in sortedPayments" :key="payment.id">
              <TableCell>{{ formatTime(payment.data) }}</TableCell>
              <TableCell>{{ payment.paciente_nome || 'N/A' }}</TableCell>
              <TableCell>
                <Badge :variant="payment.fatura_id ? 'default' : 'secondary'">
                  {{ payment.fatura_id ? 'Fatura' : 'Parcela' }}
                </Badge>
              </TableCell>
              <TableCell>
                <CaixaBadge :method="payment.metodo" />
              </TableCell>
              <TableCell class="text-right font-medium">
                {{ formatCurrency(payment.valor) }}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { HistoryIcon } from 'lucide-vue-next';
import type { CashierPayment } from '@/types/caixa';

const props = defineProps<{
  payments: CashierPayment[]
}>();

const sortedPayments = computed(() => {
  return [...props.payments].sort((a, b) => 
    new Date(b.data).getTime() - new Date(a.data).getTime()
  );
});

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('cv-CV', {
    style: 'currency',
    currency: 'CVE',
  }).format(value);
};

const formatTime = (dateString: string): string => {
  return new Date(dateString).toLocaleTimeString('pt-PT', {
    hour: '2-digit',
    minute: '2-digit'
  });
};
</script>