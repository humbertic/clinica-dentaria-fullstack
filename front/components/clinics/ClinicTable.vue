<script setup lang="ts">
import { Edit, Mail, Settings2, Trash2 } from "lucide-vue-next";

const props = defineProps<{
  clinics: {
    id: number;
    name: string;
    email: string;
    partilha_dados: boolean;
    morada: string;
    parentId: number | null;
  }[];
}>();

const emit = defineEmits<{
  (e: "edit", clinic: any): void;
  (e: "delete", clinic: any): void;
  (e: "config", clinic: any): void;
  (e: "email", clinic: any): void;
  (e: "selectClinic", clinic: any): void;
}>();
</script>

<template>
  <div class="overflow-x-auto">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Email Envio</TableHead>
          <TableHead>Morada</TableHead>
          <TableHead>Partilha de Dados</TableHead>
          <TableHead class="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="clinic in clinics" :key="clinic.id" @click="emit('selectClinic', clinic)">
          <TableCell class="font-medium">{{ clinic.name }}</TableCell>
          <TableCell>{{ clinic.email }}</TableCell>
          <TableCell>{{ clinic.morada }}</TableCell>
          <TableCell>
            <span
              :class="[
                'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1',
                clinic.partilha_dados
                  ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 ring-green-600/20'
                  : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 ring-red-600/20',
              ]"
            >
              {{ clinic.partilha_dados ? "Ativo" : "Inativo" }}
            </span>
          </TableCell>
          <TableCell class="text-right">
            <div class="flex items-center justify-end gap-2">
              <Button
                @click.stop="emit('edit', clinic)"
                variant="ghost"
                size="icon"
                title="Editar"
              >
                <Edit class="h-4 w-4" />
              </Button>
              <Button
                @click.stop="emit('email', clinic)"
                variant="ghost"
                size="icon"
                title="Configurar Email"
              >
                <Mail class="h-4 w-4" />
              </Button>
              <Button
                @click.stop="emit('config', clinic)"
                variant="ghost"
                size="icon"
                title="Configurações"
              >
                <Settings2 class="h-4 w-4" />
              </Button>
              <Button
                @click.stop="emit('delete', clinic)"
                variant="ghost"
                size="icon"
                title="Eliminar"
              >
                <Trash2 class="h-4 w-4" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
        <TableRow v-if="clinics.length === 0">
          <TableCell colspan="4" class="text-center py-6 text-muted-foreground">
            Nenhuma clínica encontrada.
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
