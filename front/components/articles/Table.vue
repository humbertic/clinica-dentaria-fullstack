<script setup lang="ts">
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Edit,
  ShieldOff,
  Trash2,
} from "lucide-vue-next";

type Artigo = {
  id: number;
  codigo: string;
  descricao: string;
  categoria: {
    id: number;
    nome: string;
  };
};

const props = defineProps<{
  artigos: Artigo[];
}>();

const emit = defineEmits<{
  (e: "edit", artigo: Artigo): void;
  (e: "delete", artigo: Artigo): void;
}>();
</script>

<template>
  <div class="w-full overflow-x-auto">
    <Table class="w-full text-sm">
      <TableCaption>Lista de Artigos</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Codigo</TableHead>
          <TableHead>Descricao</TableHead>
          <TableHead>Categoria</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow
          v-for="a in props.artigos"
          :key="a.id"
          class="hover:bg-muted/50 transition-colors"
        >
          <TableCell class="font-medium">{{ a.codigo }}</TableCell>
          <TableCell>{{ a.descricao }}</TableCell>
          <TableCell class="hidden md:table-cell">{{ a.categoria.nome }}</TableCell>
          <TableCell>
            <div class="flex items-center gap-2">
              <button @click="emit('edit', a)" class="icon-btn" title="Editar">
                <Edit class="h-4 w-4" />
              </button>
              <button @click="emit('delete', a)" class="icon-btn" title="Excluir">
                <Trash2 class="h-4 w-4" />
              </button>
            </div>
          </TableCell>
        </TableRow>

        <TableRow v-if="props.artigos.length === 0">
          <TableCell colspan="4" class="p-4 text-center text-muted-foreground">
            Nenhum artigo encontrado.
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>