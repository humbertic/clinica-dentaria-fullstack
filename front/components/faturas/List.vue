<template>
  <Card>
    <CardHeader>
      <CardTitle>Faturas do Paciente</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Data Emissão</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead class="text-right">Valor Total</TableHead>
              <TableHead class="text-right">Valor Pago</TableHead>
              <TableHead class="text-right">Pendente</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead class="text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="faturas.length === 0">
              <TableCell colspan="8" class="text-center py-8 text-muted-foreground">
                Nenhuma fatura encontrada
              </TableCell>
            </TableRow>
            <TableRow v-for="fatura in faturas" :key="fatura.id">
              <TableCell class="font-medium">{{ fatura.id }}</TableCell>
              <TableCell>{{ formatDate(fatura.data_emissao) }}</TableCell>
              <TableCell>
                <Badge :variant="getTipoBadgeVariant(fatura.tipo)">
                  {{ getTipoLabel(fatura.tipo) }}
                </Badge>
              </TableCell>
              <TableCell class="text-right">{{ formatCurrency(fatura.total) }}</TableCell>
              <TableCell class="text-right">{{ formatCurrency(getValorPago(fatura)) }}</TableCell>
              <TableCell class="text-right">{{ formatCurrency(getValorPendente(fatura)) }}</TableCell>
              <TableCell>
                <Badge :variant="getEstadoBadgeVariant(fatura.estado)">
                  {{ getEstadoLabel(fatura.estado) }}
                </Badge>
              </TableCell>
              <TableCell class="text-center">
                <div class="flex justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    @click="$emit('view-details', fatura.id)"
                  >
                    <EyeIcon class="w-4 h-4 mr-1" />
                    Ver
                  </Button>
                  <Button
                    v-if="getValorPendente(fatura) > 0 && fatura.estado !== 'paga' && fatura.estado !== 'pago'"
                    variant="default"
                    size="sm"
                    @click="$emit('pay', fatura.id)"
                  >
                    <CreditCardIcon class="w-4 h-4 mr-1" />
                    Pagar
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { EyeIcon, CreditCardIcon } from 'lucide-vue-next';
import { formatCurrency,formatDate } from '@/composables/useFaturacao';
import type { FaturaRead } from '@/types/fatura';


defineProps<{
  faturas: FaturaRead[];
}>();

defineEmits<{
  (e: 'view-details', faturaId: number): void;
  (e: 'pay', faturaId: number): void;
}>();


// Calcula quanto já foi pago numa fatura
function getValorPago(fatura: FaturaRead): number {
  if (fatura.tipo === 'consulta') {
    // se for consulta única, só está pago se o estado for 'paga'
    return fatura.estado === 'paga' ? fatura.total : 0;
  } else {
    // se for plano, soma todas as parcelas pagas
    return (fatura.parcelas ?? []).reduce((sum, p) => sum + (p.valor_pago ?? 0), 0);
  }
}

// Calcula quanto ainda está em aberto
function getValorPendente(fatura: FaturaRead): number {
  return fatura.total - getValorPago(fatura);
}


// Funções auxiliares para badges
const getTipoLabel = (tipo: string) => {
  const labels = {
    consulta: 'Consulta',
    tratamento: 'Tratamento',
    orcamento: 'Orçamento'
  };
  return labels[tipo as keyof typeof labels] || tipo;
};

const getTipoBadgeVariant = (tipo: string): "secondary" | "default" | "outline" | "destructive" | null | undefined => {
  const variants: Record<string, "secondary" | "default" | "outline" | "destructive"> = {
    consulta: 'secondary',
    tratamento: 'default',
    orcamento: 'outline'
  };
  return variants[tipo as keyof typeof variants] || 'secondary';
};

const getEstadoLabel = (estado: string) => {
  const labels = {
    pendente: 'Pendente',
    pago: 'Pago',
    parcial: 'Parcial',
    vencido: 'Vencido'
  };
  return labels[estado as keyof typeof labels] || estado;
};

const getEstadoBadgeVariant = (
  estado: string
): "secondary" | "default" | "outline" | "destructive" | null | undefined => {
  const variants: Record<string, "secondary" | "default" | "outline" | "destructive"> = {
    pendente: 'secondary',
    pago: 'secondary', // Use only allowed values
    parcial: 'default',
    vencido: 'destructive'
  };
  return variants[estado as keyof typeof variants] || 'secondary';
};
</script>