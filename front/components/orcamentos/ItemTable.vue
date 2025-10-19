<script setup lang="ts">
import { ref, computed } from "vue";
import { PencilIcon, TrashIcon } from "lucide-vue-next";
import type { OrcamentoItemRead } from "~/types/orcamento";
import { useDentes } from "~/composables/useDentes";

// Função para formatar valores monetários
const formatCurrency = (value: number | string): string => {
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("cv-CV", {
    style: "currency",
    currency: "CVE",
  }).format(numValue);
};

const props = defineProps<{
  itens: OrcamentoItemRead[];
  readonly?: boolean;
}>();

const emit = defineEmits<{
  (e: "edit", itemId: number): void;
  (e: "delete", itemId: number): void;
}>();

const { faces, fetchFaces, getFaceName } = useDentes();
onMounted(async () => {
  if (faces.value.length === 0) {
    await fetchFaces();
  }
});

const formatFaces = (faceArray: string[] | undefined): string => {
  if (!faceArray || faceArray.length === 0) return "";

  return faceArray.map((face) => getFaceName(face)).join(", ");
};

// Calcular totais
const totalEntidade = computed(() => {
  return props.itens.reduce((sum, item) => {
    const value =
      typeof item.subtotal_entidade === "string"
        ? parseFloat(item.subtotal_entidade)
        : item.subtotal_entidade;
    return sum + value;
  }, 0);
});

const totalPaciente = computed(() => {
  return props.itens.reduce((sum, item) => {
    const value =
      typeof item.subtotal_paciente === "string"
        ? parseFloat(item.subtotal_paciente)
        : item.subtotal_paciente;
    return sum + value;
  }, 0);
});

// Fallback para obter descrições de artigos se não estiver disponível no item expandido
const getArtigoDescricao = (id: number) => {
  return `Artigo ${id}`;
};

// Handlers para ações
const onEdit = (itemId: number) => {
  emit("edit", itemId);
};

const onDelete = (itemId: number) => {
  emit("delete", itemId);
};
</script>

<style scoped>
/* Estilização consistente com o resto da aplicação */
.icon-btn {
  @apply inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted p-0 text-muted-foreground hover:text-foreground transition-colors;
}
</style>

<template>
  <div class="w-full overflow-x-auto">
    <Table class="w-full text-sm">
      <TableCaption>Lista de Procedimentos</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>#</TableHead>
          <TableHead>Código</TableHead>
          <TableHead>Descrição</TableHead>
          <TableHead>Dente/Face</TableHead>
          <TableHead class="text-right">Qtd</TableHead>
          <TableHead class="text-right">Seg. Unit.</TableHead>
          <TableHead class="text-right">Pac. Unit.</TableHead>
          <TableHead v-if="!readonly" class="text-center">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-if="itens.length === 0">
          <TableCell colspan="8" class="p-4 text-center text-muted-foreground">
            Nenhum procedimento adicionado
          </TableCell>
        </TableRow>
        <TableRow
          v-for="(item, index) in itens"
          :key="item.id"
          class="hover:bg-muted/50 transition-colors"
        >
          <TableCell>{{ index + 1 }}</TableCell>
          <TableCell>{{ item.artigo?.codigo || "-" }}</TableCell>
          <TableCell>{{
            item.artigo?.descricao || getArtigoDescricao(item.artigo_id)
          }}</TableCell>
          <TableCell>
            <div v-if="item.numero_dente">
              {{ item.numero_dente }}
              <span v-if="item.face && item.face.length > 0">
                ({{ formatFaces(item.face) }})
              </span>
            </div>
            <div v-else>-</div>
          </TableCell>
          <TableCell class="text-right">{{ item.quantidade }}</TableCell>
          <TableCell class="text-right">{{
            formatCurrency(item.preco_entidade)
          }}</TableCell>
          <TableCell class="text-right">{{
            formatCurrency(item.preco_paciente)
          }}</TableCell>
          <TableCell v-if="!readonly" class="text-center">
            <div class="flex items-center justify-center gap-2">
              <button @click="onEdit(item.id)" class="icon-btn" title="Editar">
                <PencilIcon class="h-4 w-4" />
              </button>
              <button
                @click="onDelete(item.id)"
                class="icon-btn"
                title="Remover"
              >
                <TrashIcon class="h-4 w-4" />
              </button>
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
      <tfoot v-if="itens.length > 0">
        <tr class="border-t font-medium">
          <td colspan="5" class="py-2 px-4 text-right">Total:</td>
          <td class="py-2 px-4 text-right">
            {{ formatCurrency(totalEntidade) }}
          </td>
          <td class="py-2 px-4 text-right">
            {{ formatCurrency(totalPaciente) }}
          </td>
          <td v-if="!readonly"></td>
        </tr>
      </tfoot>
    </Table>
  </div>
</template>
