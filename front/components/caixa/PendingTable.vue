<template>
  <div class="space-y-6">
    <!-- Faturas de Consulta -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <FileTextIcon class="w-5 h-5" />
          Faturas de Consulta Pendentes
          <Badge variant="secondary">{{ pendingInvoices.length }}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº Fatura</TableHead>
                <TableHead>Emissão</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead class="text-right">Valor Total</TableHead>
                <TableHead class="text-right">Valor Pendente</TableHead>
                <TableHead class="text-center">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-if="pendingInvoices.length === 0">
                <TableCell colspan="7" class="text-center py-8 text-muted-foreground">
                  Nenhuma fatura pendente
                </TableCell>
              </TableRow>
              <TableRow v-for="invoice in pendingInvoices" :key="invoice.id">
                <TableCell class="font-medium">{{ invoice.id }}</TableCell>
                <TableCell>{{ formatDate(invoice.data_emissao) }}</TableCell>
                <TableCell>{{ invoice.paciente_nome }}</TableCell>
                <TableCell>
                  <Badge :variant="invoice.tipo === 'consulta' ? 'secondary' : 'default'">
                    {{ invoice.tipo === 'consulta' ? 'Consulta' : 'Tratamento' }}
                  </Badge>
                </TableCell>
                <TableCell class="text-right">{{ formatCurrency(invoice.total) }}</TableCell>
                <TableCell class="text-right font-medium">{{ formatCurrency(invoice.pendente) }}</TableCell>
                <TableCell class="text-center">
                  <Button
                    size="sm"
                    @click="$emit('pay-invoice', invoice.id)"
                    :disabled="invoice.pendente <= 0"
                    :variant="invoice.pendente <= 0 ? 'outline' : 'default'"
                  >
                   <CreditCardIcon class="w-4 h-4 mr-1" />
                    {{ invoice.pendente <= 0 ? 'Pago' : 'Pagar' }}
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>

    <!-- Parcelas de Plano -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <CalendarIcon class="w-5 h-5" />
          Parcelas de Plano Pendentes
          <Badge variant="secondary">{{ pendingParcels.length }}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº Fatura</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Parcela</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead class="text-right">Valor</TableHead>
                <TableHead class="text-right">Pendente</TableHead>
                <TableHead class="text-center">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-if="pendingParcels.length === 0">
                <TableCell colspan="7" class="text-center py-8 text-muted-foreground">
                  Nenhuma parcela pendente
                </TableCell>
              </TableRow>
              <TableRow v-for="parcela in pendingParcels" :key="parcela.parcela_id">
                <TableCell class="font-medium">{{ parcela.fatura_id }}</TableCell>
                <TableCell>{{ parcela.paciente_nome }}</TableCell>
                <TableCell>
                  <Badge variant="outline">{{ parcela.numero }}ª parcela</Badge>
                </TableCell>
                <TableCell>
                  <span :class="isOverdue(parcela.data_vencimento) ? 'text-red-600 font-medium' : ''">
                    {{ formatDate(parcela.data_vencimento) }}
                    <Badge v-if="isOverdue(parcela.data_vencimento)" variant="destructive" class="ml-2">
                      Vencida
                    </Badge>
                  </span>
                </TableCell>
                <TableCell class="text-right">{{ formatCurrency(parcela.valor) }}</TableCell>
                <TableCell class="text-right font-medium">{{ formatCurrency(parcela.pendente) }}</TableCell>
                <TableCell class="text-center">
                 <Button
                    size="sm"
                    @click="$emit('pay-parcela', parcela.parcela_id)"
                    :disabled="parcela.pendente <= 0"
                    :variant="parcela.pendente <= 0 ? 'outline' : 
                              isOverdue(parcela.data_vencimento) ? 'destructive' : 'default'"
                  >
                    <CreditCardIcon class="w-4 h-4 mr-1" />
                    {{ parcela.pendente <= 0 ? 'Pago' : 'Pagar' }}
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { FileTextIcon, CalendarIcon, CreditCardIcon } from 'lucide-vue-next';
import type { PendingInvoice, PendingParcel } from '@/types/caixa';

defineProps<{
  pendingInvoices: PendingInvoice[];
  pendingParcels: PendingParcel[];
}>();

defineEmits<{
  (e: 'pay-invoice', invoiceId: number): void;
  (e: 'pay-parcela', parcelaId: number): void;
}>();

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('cv-CV', {
    style: 'currency',
    currency: 'CVE',
    
  }).format(value);
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('pt-PT');
};

const isOverdue = (dateString: string): boolean => {
  return new Date(dateString) < new Date();
};
</script>