<script setup lang="ts">
import { Edit, Trash2, MoveRight } from "lucide-vue-next";

const props = defineProps<{
  items: {
    id: number;
    nome: string;
    descricao: string;
    lote_proximo: string;
    quantidade_atual: number;
    quantidade_minima: number;
    tipo_medida: string;
    fornecedor: string;
    validade_proxima: string;
    ativo: boolean;
  }[];
}>();

const emit = defineEmits<{
  (e: "edit", item: any): void;
  (e: "delete", item: any): void;
  (e: "transfer", item: any): void;
  (e: "selectItem", item: any): void;
}>();
</script>

<template>
  <div class="overflow-x-auto">
    <Table :items="items">
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Lote</TableHead>
          <TableHead>Medida</TableHead>
          <TableHead>Qtd.</TableHead>
          <TableHead>Mínimo</TableHead>
          <TableHead>Validade</TableHead>
          <TableHead>Fornecedor</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead class="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow
          v-for="item in items"
          :key="item.id"
          @click="emit('selectItem', item)"
          class="cursor-pointer hover:bg-muted/50"
        >
          <TableCell class="font-medium">{{ item.nome }}</TableCell>
          <TableCell>{{ item.lote_proximo }}</TableCell>
          <TableCell>{{ item.tipo_medida }}</TableCell>
          <TableCell>
            <span
              :class="[
                'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1',
                item.quantidade_atual <= item.quantidade_minima
                  ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 ring-red-600/20'
                  : 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 ring-green-600/20',
              ]"
            >
              {{ item.quantidade_atual }}
            </span>
          </TableCell>
          <TableCell>{{ item.quantidade_minima }}</TableCell>
          <TableCell>{{ item.validade_proxima }}</TableCell>
          <TableCell>{{ item.fornecedor }}</TableCell>
          <TableCell>
            <span
              :class="[
                'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1',
                item.quantidade_atual <= item.quantidade_minima
                  ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 ring-red-600/20'
                  : 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 ring-green-600/20',
              ]"
            >
              {{ item.ativo ? 'Ativo' : 'Inativo' }}
            </span>
          </TableCell>
          <TableCell class="text-right">
            <div class="flex items-center justify-end gap-2">
              <Button
                @click.stop="emit('edit', item)"
                variant="ghost"
                size="icon"
                title="Editar"
              >
                <Edit class="h-4 w-4" />
              </Button>
              <Button
                @click.stop="emit('delete', item)"
                variant="ghost"
                size="icon"
                title="Eliminar"
              >
                <Trash2 class="h-4 w-4" />
              </Button>
              <Button
                @click.stop="emit('transfer', item)"
                variant="ghost"
                size="icon"
                title="Transferir"
                :disabled="!item.ativo || item.quantidade_atual < 1"
              >
                <MoveRight class="h-4 w-4" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
        <TableRow v-if="items.length === 0">
          <TableCell colspan="7" class="text-center py-6 text-muted-foreground">
            Nenhum item em stock encontrado.
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>