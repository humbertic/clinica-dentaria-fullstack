<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
    <Card>
      <CardContent class="p-4">
        <div class="text-center">
          <div class="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full mx-auto mb-2">
            <PiggyBankIcon class="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <p class="text-2xl font-bold">{{ formatCurrency(summary.valorInicial) }}</p>
          <p class="text-sm text-muted-foreground">Valor Inicial</p>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardContent class="p-4">
        <div class="text-center">
          <div class="flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full mx-auto mb-2">
            <BanknoteIcon class="w-4 h-4 text-green-600 dark:text-green-400" />
          </div>
          <p class="text-2xl font-bold text-green-600">{{ formatCurrency(summary.totalDinheiro) }}</p>
          <p class="text-sm text-muted-foreground">Total Dinheiro</p>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardContent class="p-4">
        <div class="text-center">
          <div class="flex items-center justify-center w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full mx-auto mb-2">
            <CreditCardIcon class="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <p class="text-2xl font-bold text-purple-600">{{ formatCurrency(summary.totalCartao) }}</p>
          <p class="text-sm text-muted-foreground">Total Cartão</p>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardContent class="p-4">
        <div class="text-center">
          <div class="flex items-center justify-center w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full mx-auto mb-2">
            <ArrowRightLeftIcon class="w-4 h-4 text-orange-600 dark:text-orange-400" />
          </div>
          <p class="text-2xl font-bold text-orange-600">{{ formatCurrency(summary.totalTransferencia) }}</p>
          <p class="text-sm text-muted-foreground">Total Transferência</p>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardContent class="p-4">
        <div class="text-center">
          <div class="flex items-center justify-center w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full mx-auto mb-2">
            <TrendingUpIcon class="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <p class="text-2xl font-bold text-indigo-600">{{ formatCurrency(summary.totalRecebido) }}</p>
          <p class="text-sm text-muted-foreground">Total Recebido</p>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardContent class="p-4">
        <div class="text-center">
          <div class="flex items-center justify-center w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-full mx-auto mb-2">
            <WalletIcon class="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
          </div>
          <p class="text-2xl font-bold text-yellow-600">{{ formatCurrency(summary.saldoEsperado) }}</p>
          <p class="text-sm text-muted-foreground">Saldo Esperado</p>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { 
  PiggyBankIcon, 
  BanknoteIcon, 
  CreditCardIcon, 
  ArrowRightLeftIcon,
  TrendingUpIcon,
  WalletIcon
} from 'lucide-vue-next';
import type { CashierSummary } from '@/types/caixa';

defineProps<{
  summary: CashierSummary;
}>();

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('cv-CV', {
    style: 'currency',
    currency: 'CVE',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};
</script>