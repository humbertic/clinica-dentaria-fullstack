<template>
  <div class="space-y-6">
    <DialogHeader>
      <DialogTitle>Detalhes da Fatura {{ localFatura.id }}</DialogTitle>
      <div
        v-if="localFatura.estado === 'paga'"
        class="flex items-center justify-end space-x-3 mt-2"
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" class="flex items-center gap-2">
              <FileTextIcon class="h-4 w-4" />
              <span>Documento</span>
              <ChevronDownIcon class="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem @click="viewPdf" class="cursor-pointer">
              <EyeIcon class="h-4 w-4 mr-2" />
              <span>Visualizar PDF</span>
            </DropdownMenuItem>
            <DropdownMenuItem @click="downloadPdf" class="cursor-pointer">
              <DownloadIcon class="h-4 w-4 mr-2" />
              <span>Download PDF</span>
            </DropdownMenuItem>
            <DropdownMenuItem @click="sendEmail" class="cursor-pointer">
              <MailIcon class="h-4 w-4 mr-2" />
              <span>Enviar por Email</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </DialogHeader>

    <!-- Informações gerais -->
    <Card>
      <CardHeader>
        <CardTitle>Informações Gerais</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <Label>Data de Emissão</Label>
            <p class="font-medium">
              {{ formatDate(localFatura.data_emissao) }}
            </p>
          </div>
          <div v-if="localFatura.tipo === 'plano'">
            <Label>Data de Vencimento</Label>
            <p class="font-medium">
              {{ formatDate(lastParcelaDate) }}
            </p>
          </div>
          <div>
            <Label>Tipo</Label>
            <Badge :variant="getTipoBadgeVariant(localFatura.tipo)">
              {{ getTipoLabel(localFatura.tipo) }}
            </Badge>
          </div>
          <div>
            <Label>Estado</Label>
            <Badge :variant="getEstadoBadgeVariant(localFatura.estado)">
              {{ getEstadoLabel(localFatura.estado) }}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Itens da fatura -->
    <Card>
      <CardHeader>
        <CardTitle>Itens da Fatura</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead class="text-center">Quantidade</TableHead>
              <TableHead class="text-right">Valor Unitário</TableHead>
              <TableHead class="text-right">Valor Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="item in localFatura.itens" :key="item.id">
              <TableCell>{{ item.descricao }}</TableCell>
              <TableCell class="text-center">{{ item.quantidade }}</TableCell>
              <TableCell class="text-right">
                {{ formatCurrency(item.preco_unitario) }}
              </TableCell>
              <TableCell class="text-right">
                {{ formatCurrency(item.total) }}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <!-- Parcelas (só para fatura de plano) -->
    <Card v-if="localFatura.tipo === 'plano'">
      <CardHeader>
        <CardTitle>Parcelas</CardTitle>
      </CardHeader>
      <CardContent>
        <!-- já existem parcelas? só exibe tabela -->
        <div v-if="localFatura.parcelas.length > 0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Parcela</TableHead>
                <TableHead class="text-right">Valor Previsto</TableHead>
                <TableHead class="text-right">Valor Pago</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead>Estado</TableHead>
                <!-- <TableHead>Ações</TableHead> -->
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow
                v-for="parcela in localFatura.parcelas"
                :key="parcela.id"
              >
                <TableCell> {{ parcela.numero }}ª parcela </TableCell>
                <TableCell class="text-right">
                  {{ formatCurrency(parcela.valor_planejado) }}
                </TableCell>
                <TableCell class="text-right">
                  {{ formatCurrency(parcela.valor_pago || 0) }}
                </TableCell>
                <TableCell>
                  {{ formatDate(parcela.data_vencimento) }}
                </TableCell>
                <TableCell>
                  {{
                    parcela.data_pagamento
                      ? formatDate(parcela.data_pagamento)
                      : "-"
                  }}
                </TableCell>
                <TableCell>
                  <Badge
                    :variant="getParcelaEstadoBadgeVariant(parcela.estado)"
                  >
                    {{ getParcelaEstadoLabel(parcela.estado) }}
                  </Badge>
                </TableCell>
                <!-- <TableCell>
                  <Button 
                    v-if="parcela.estado !== 'paga'"
                    size="sm" 
                    variant="outline" 
                    @click="handlePayParcela(parcela)"
                  >
                    Pagar
                  </Button>
                </TableCell> -->
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <!-- não há parcelas → inputs para gerar -->
        <div v-else class="space-y-4">
          <FormField name="numeroParcelas">
            <FormLabel>Número de Parcelas</FormLabel>
            <FormControl>
              <Input type="number" v-model.number="numeroParcelas" min="1" />
            </FormControl>
          </FormField>

          <div
            v-for="(dt, idx) in datasVencimento"
            :key="idx"
            class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
          >
            <FormField :name="`parcela-${idx + 1}`">
              <FormLabel>Parcela {{ idx + 1 }}</FormLabel>
              <FormControl>
                <Input type="date" v-model="datasVencimento[idx]" />
              </FormControl>
            </FormField>
          </div>

          <Button
            class="w-full"
            :disabled="!canGenerateParcelas"
            @click="onGenerateParcelas"
          >
            Gerar Parcelas
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- Pagamentos diretos -->
    <Card v-if="localFatura.pagamentos && localFatura.pagamentos.length > 0">
      <CardHeader>
        <CardTitle>Pagamentos Diretos</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead class="text-right">Valor</TableHead>
              <TableHead>Método</TableHead>
              <TableHead>Observações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="pagamento in localFatura.pagamentos"
              :key="pagamento.id"
            >
              <TableCell>{{ formatDate(pagamento.data_pagamento) }}</TableCell>
              <TableCell class="text-right">
                {{ formatCurrency(pagamento.valor) }}
              </TableCell>
              <TableCell>{{
                getMetodoPagamentoLabel(pagamento.metodo_pagamento)
              }}</TableCell>
              <TableCell>{{ pagamento.observacoes || "-" }}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <!-- Resumo financeiro -->
    <Card>
      <CardHeader>
        <CardTitle>Resumo Financeiro</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="text-center p-4 bg-muted/50 rounded-lg">
            <p class="text-2xl font-bold">
              {{ formatCurrency(localFatura.total) }}
            </p>
            <p class="text-sm text-muted-foreground">Valor Total</p>
          </div>
          <div
            class="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg"
          >
            <p class="text-2xl font-bold text-green-600">
              {{ formatCurrency(totalPago) }}
            </p>
            <p class="text-sm text-muted-foreground">Valor Pago</p>
            <div class="mt-1 text-xs">
              <span v-if="valorPagoParcelas > 0 && valorPagoDireto > 0">
                {{ formatCurrency(valorPagoParcelas) }} parcelas +
                {{ formatCurrency(valorPagoDireto) }} direto
              </span>
              <span v-else-if="valorPagoParcelas > 0">
                {{ formatCurrency(valorPagoParcelas) }} via parcelas
              </span>
              <span v-else-if="valorPagoDireto > 0">
                {{ formatCurrency(valorPagoDireto) }} pagamento direto
              </span>
            </div>
          </div>
          <div
            class="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg"
          >
            <p class="text-2xl font-bold text-orange-600">
              {{ formatCurrency(valorPendente) }}
            </p>
            <p class="text-sm text-muted-foreground">Valor Pendente</p>
            <div class="mt-1 text-xs" v-if="valorPendente > 0">
              {{ percentualPendente }}% do total
            </div>
          </div>
          <div
            class="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
          >
            <p class="text-2xl font-bold text-blue-600">
              {{ parcelasStats.pendentes + parcelasStats.parciais }}
            </p>
            <p class="text-sm text-muted-foreground">Parcelas Pendentes</p>
            <div class="mt-1 text-xs" v-if="parcelasStats.total > 0">
              {{ parcelasStats.pendentes }} pendentes,
              {{ parcelasStats.parciais }} parciais
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import {
  formatCurrency,
  formatDate,
  getValorPago,
  getValorPendente,
  useFaturacao,
} from "@/composables/useFaturacao";
import { usePdf } from "@/composables/usePdf";
import type { FaturaRead, ParcelaRead } from "@/types/fatura";
import type { Clinica } from "@/types/clinica";
import { useToast } from "@/components/ui/toast/use-toast";
import { FileTextIcon, EyeIcon, DownloadIcon, MailIcon, ChevronDownIcon } from 'lucide-vue-next';

// Props
const props = defineProps<{ fatura: FaturaRead }>();
const emit = defineEmits<{
  (e: "refresh"): void;
  (e: "pay-parcela", parcela: ParcelaRead): void;
}>();
const { toast } = useToast();
const { get, post } = useApiService();

const { fatura: pdfFatura } = usePdf();
const { enviarFatura } = useEmail();
const selectedClinic = useState<Clinica | null>("selectedClinic");
// Formatters and labels
const getTipoLabel = (t: string) =>
  ({ consulta: "Consulta", plano: "Plano de Tratamento" }[t] || t);

const getTipoBadgeVariant = (t: string) =>
  ({ consulta: "secondary", plano: "default" }[t] as any);

const getEstadoLabel = (e: string) =>
  ({
    pendente: "Pendente",
    paga: "Pago",
    parcial: "Parcial",
    cancelada: "Cancelada",
  }[e] || e);

const getEstadoBadgeVariant = (e: string) =>
  ({
    pendente: "secondary",
    paga: "default",
    parcial: "outline",
    cancelada: "destructive",
  }[e] as any);

const getParcelaEstadoLabel = (e: string) =>
  ({ pendente: "Pendente", paga: "Paga", parcial: "Parcial" }[e] || e);

const getParcelaEstadoBadgeVariant = (e: string) =>
  ({ pendente: "secondary", paga: "default", parcial: "outline" }[e] as any);

const getMetodoPagamentoLabel = (m: string) =>
  ({
    dinheiro: "Dinheiro",
    cartao: "Cartão",
    transferencia: "Transferência",
  }[m] || m);

// Local state
const localFatura = ref<FaturaRead>(props.fatura);

// Enhanced statistics calculations
const valorPagoParcelas = computed(() => {
  if (!localFatura.value?.parcelas?.length) return 0;

  // Sum all valor_pago values, ensuring null/undefined values are treated as 0
  return localFatura.value.parcelas.reduce((sum, p) => {
    const valorPago =
      p.valor_pago !== null && p.valor_pago !== undefined ? p.valor_pago : 0;
    return sum + valorPago;
  }, 0);
});

const valorPagoDireto = computed(() => {
  if (!localFatura.value?.pagamentos?.length) return 0;

  return localFatura.value.pagamentos.reduce((sum, p) => {
    const valor = p.valor !== null && p.valor !== undefined ? p.valor : 0;
    return sum + valor;
  }, 0);
});

const totalPago = computed(
  () => valorPagoParcelas.value + valorPagoDireto.value
);

const percentualPendente = computed(() => {
  if (localFatura.value.total <= 0) return 0;
  return Math.round(
    (getValorPendente(localFatura.value) / localFatura.value.total) * 100
  );
});

const valorPendente = computed(() => {
  const total = localFatura.value.total || 0;
  return Math.max(0, total - totalPago.value);
});

const parcelasStats = computed(() => {
  const parcelas = localFatura.value?.parcelas || [];
  return {
    total: parcelas.length,
    pagas: parcelas.filter((p) => p.estado === "paga").length,
    parciais: parcelas.filter((p) => p.estado === "parcial").length,
    pendentes: parcelas.filter((p) => p.estado === "pendente").length,
  };
});

const lastParcelaDate = computed(() => {
  if (!localFatura.value?.parcelas?.length) return "";

  const lastParcela = [...localFatura.value.parcelas].sort(
    (a, b) => b.numero - a.numero
  )[0];

  return lastParcela?.data_vencimento || "";
});

// new parcel‐generation state
const numeroParcelas = ref(1);
const datasVencimento = ref<string[]>([
  props.fatura.data_emissao?.slice(0, 10) || "",
]);

// Update local fatura when prop changes
watch(
  () => props.fatura,
  (newFatura) => {
    localFatura.value = newFatura;
  },
  { immediate: true }
);

// whenever user changes number, reset dates array
watch(
  numeroParcelas,
  (n) => {
    // fill with the invoice date as a sensible default
    const defaultDate = props.fatura.data_emissao?.slice(0, 10) || "";
    datasVencimento.value = Array(n).fill(defaultDate);
  },
  { immediate: true }
);

// validity: must have at least one, and each date non empty
const canGenerateParcelas = computed(
  () =>
    numeroParcelas.value > 0 &&
    datasVencimento.value.length === numeroParcelas.value &&
    datasVencimento.value.every((d) => !!d.trim())
);

// composable call
const { generateParcelas, getFatura } = useFaturacao();

// handle pay parcela
function handlePayParcela(parcela: ParcelaRead) {
  emit("pay-parcela", parcela);
}

// on click → generate + reload fatura
async function onGenerateParcelas() {
  if (!canGenerateParcelas.value) return;

  try {
    const success = await generateParcelas(
      props.fatura.id,
      numeroParcelas.value,
      datasVencimento.value
    );

    if (success) {
      // Show success toast
      toast({
        title: "Parcelas geradas com sucesso",
        description: `Foram criadas ${numeroParcelas.value} parcelas para esta fatura.`,
      });

      // Fetch updated fatura data and update local state
      const updatedFatura = await getFatura(props.fatura.id);
      if (updatedFatura) {
        localFatura.value = updatedFatura;
      }

      // Emit event to parent to refresh fatura data
      emit("refresh");
    } else {
      // Show error toast
      toast({
        title: "Erro ao gerar parcelas",
        description: "Não foi possível gerar as parcelas. Tente novamente.",
        variant: "destructive",
      });
    }
  } catch (error) {
    // Show error toast with error message
    toast({
      title: "Erro ao gerar parcelas",
      description:
        error instanceof Error ? error.message : "Ocorreu um erro inesperado",
      variant: "destructive",
    });
  }
}

async function viewPdf() {
  await pdfFatura.view(localFatura.value.id);
}
async function downloadPdf() {
  await pdfFatura.download(localFatura.value.id);
}

async function sendEmail() {
  if (!selectedClinic.value) {
    toast({
      title: "Erro",
      description: "Nenhuma clínica selecionada",
      variant: "destructive",
    });
    return;
  }
  await enviarFatura(localFatura.value.id, selectedClinic.value.id);
}
</script>
