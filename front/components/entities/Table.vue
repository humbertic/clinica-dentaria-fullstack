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

type Entidade = {
  id: number;
  nome: string;
  slug: string;
};

const props = defineProps<{
  entidades: Entidade[];
}>();

const emit = defineEmits<{
  (e: "edit", entidade: Entidade): void;
}>();
</script>

<template>
  <div class="w-full overflow-x-auto">
    <Table class="w-full text-sm">
      <TableCaption>Lista de Entidades</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Slug</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow
          v-for="e in props.entidades"
          :key="e.id"
          class="hover:bg-muted/50 transition-colors"
        >
          <TableCell class="font-medium">{{ e.nome }}</TableCell>
          <TableCell>{{ e.slug }}</TableCell>
          <TableCell>
            <div class="flex items-center gap-2">
              <button @click="emit('edit', e)" class="icon-btn" title="Editar">
                <Edit class="h-4 w-4" />
              </button>
            </div>
          </TableCell>
        </TableRow>

        <TableRow v-if="props.entidades.length === 0">
          <TableCell colspan="8" class="p-4 text-center text-muted-foreground">
            Nenhum entidade encontrada.
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
