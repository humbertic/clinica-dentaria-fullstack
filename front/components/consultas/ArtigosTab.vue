<template>
  <div class="space-y-4">
    <!-- Cabeçalho com botão para adicionar novo artigo -->
    <div class="flex justify-between items-center">
      <h3 class="text-lg font-medium">Procedimentos da Consulta</h3>
      <Button size="sm" @click="abrirModalAdicionarArtigo" :disabled="disabled">
        <Plus class="w-4 h-4 mr-2" />
        Adicionar Procedimento
      </Button>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="py-8 text-center text-muted-foreground">
      <div
        class="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"
      ></div>
      Carregando procedimentos...
    </div>

    <!-- Estado vazio -->
    <Card v-else-if="!itens?.length" class="py-8 text-center">
      <CardContent>
        <div class="flex flex-col items-center justify-center space-y-3">
          <ClipboardList class="h-10 w-10 text-muted-foreground" />
          <p class="text-muted-foreground">
            Nenhum procedimento registrado nesta consulta
          </p>
          <Button
            size="sm"
            @click="abrirModalAdicionarArtigo"
            :disabled="disabled"
          >
            <Plus class="w-4 h-4 mr-2" />
            Adicionar Procedimento
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- Tabela com os artigos/procedimentos -->
    <Table v-else>
      <TableHeader>
        <TableRow>
          <TableHead>Código</TableHead>
          <TableHead>Procedimento</TableHead>
          <TableHead>Dente</TableHead>
          <TableHead>Faces</TableHead>
          <TableHead class="text-right">Qtd</TableHead>
          <TableHead class="text-right">Valor</TableHead>
          <TableHead class="text-right">Total</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="item in itens" :key="item.id">
          <TableCell>{{ item.artigo?.codigo }}</TableCell>
          <TableCell>{{ item.artigo?.descricao }}</TableCell>
          <TableCell>{{ item.numero_dente || "—" }}</TableCell>
          <TableCell>{{ item.face?.join(", ") || "—" }}</TableCell>
          <TableCell class="text-right">{{ item.quantidade }}</TableCell>
          <TableCell class="text-right">{{
            formatCurrency(item.preco_unitario)
          }}</TableCell>
          <TableCell class="text-right">{{
            formatCurrency(item.total)
          }}</TableCell>
          <TableCell>
            <div class="flex gap-1 justify-end">
              <Button
                variant="ghost"
                size="icon"
                @click="editarArtigo(item)"
                :disabled="disabled"
              >
                <Pencil class="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                @click="removerArtigo(item.id)"
                :disabled="disabled"
              >
                <Trash2 class="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colspan="6">Total</TableCell>
          <TableCell class="text-right">{{ formatCurrency(total) }}</TableCell>
          <TableCell></TableCell>
        </TableRow>
      </TableFooter>
    </Table>

    <!-- Modal para adicionar/editar artigo -->
    <ConsultasAddArtigoModal
      :show="showAddArtigoModal"
      :edit-item="itemEmEdicao"
      :disabled="disabled"
      :entidadeId="props.entidadeId"
      @close="fecharModalArtigo"
      @save="adicionarArtigoComComponente"
      @update="atualizarArtigoComComponente"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { Plus, Pencil, Trash2, ClipboardList } from "lucide-vue-next";
import { useToast } from "@/components/ui/toast";
import type {
  ConsultaItemRead,
  ConsultaItemCreate,
  ConsultaItemUpdate,
} from "~/types/consulta";

// Props
interface Props {
  itens?: ConsultaItemRead[];
  loading?: boolean;
  disabled?: boolean;
  consultaId?: number;
  entidadeId?: number | undefined;
}

const props = withDefaults(defineProps<Props>(), {
  itens: () => [],
  loading: false,
  disabled: false,
  consultaId: 0,
  entidadeId: undefined,
});

// Emits
const emit = defineEmits<{
  "add-item": [item: ConsultaItemCreate];
  "update-item": [id: number, item: ConsultaItemUpdate];
  "delete-item": [id: number];
}>();

// Local state
const { toast } = useToast();
const showAddArtigoModal = ref(false);
const itemEmEdicao = ref<ConsultaItemRead | undefined>(undefined);

// Computed
const total = computed(() => {
  if (!props.itens?.length) return 0;
  return props.itens.reduce((sum, item) => sum + (item.total || 0), 0);
});

// Helper functions
function formatCurrency(value?: number | string) {
  if (value === undefined || value === null) return "CVE 0,00";
  const num = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("cv-CV", {
    style: "currency",
    currency: "CVE",
  }).format(num);
}

// Modal functions
function abrirModalAdicionarArtigo() {
  itemEmEdicao.value = undefined;
  showAddArtigoModal.value = true;
}

function fecharModalArtigo() {
  showAddArtigoModal.value = false;
  itemEmEdicao.value = undefined;
}

function editarArtigo(item: ConsultaItemRead) {
  itemEmEdicao.value = item;
  showAddArtigoModal.value = true;
}

async function adicionarArtigoComComponente(item: ConsultaItemCreate) {
  emit("add-item", item);
  fecharModalArtigo();
}

async function atualizarArtigoComComponente(
  id: number,
  item: ConsultaItemUpdate
) {
  emit("update-item", id, item);
  fecharModalArtigo();
}

async function removerArtigo(id: number) {
    emit("delete-item", id);
}
</script>
