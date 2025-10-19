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
  CheckCircle,
  BadgePlus,
  Building,
} from "lucide-vue-next";

/** Mirror your User type here (or import it) */
type Categoria = {
  id: number;
  nome: string;
  slug: string;
  ordem: number;
};

const props = defineProps<{
  categorias: Categoria[];
}>();

const emit = defineEmits<{
  (e: "edit", entidade: Categoria): void;
}>();
</script>

<template>
  <div class="w-full overflow-x-auto">
    <Table class="w-full text-sm">
      <TableCaption>Lista de Categorias</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Slug</TableHead>
          <TableHead>Ordem</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow
          v-for="c in props.categorias"
          :key="c.id"
          class="hover:bg-muted/50 transition-colors"
        >
          <TableCell class="font-medium">{{ c.nome }}</TableCell>
          <TableCell>{{ c.slug }}</TableCell>
          <TableCell>{{ c.ordem }}</TableCell>
          <TableCell>
            <div class="flex items-center gap-2">
              <button @click="emit('edit', c)" class="icon-btn" title="Editar">
                <Edit class="h-4 w-4" />
              </button>
            </div>
          </TableCell>
        </TableRow>

        <TableRow v-if="props.categorias.length === 0">
          <TableCell colspan="8" class="p-4 text-center text-muted-foreground">
            Nenhum entidade encontrada.
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
