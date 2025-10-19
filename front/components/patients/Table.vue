<script setup lang="ts">
import { Edit, Trash2, User, Eye } from "lucide-vue-next"

const props = defineProps<{
  rows: {
    id: number
    nome: string
    telefone?: string
    email?: string
    data_nascimento?: string | null
    clinica: string
  }[]
}>()

const emit = defineEmits<{
  (e: "edit", paciente: any): void
  (e: "delete", paciente: any): void
  (e: "rowClick", paciente: any): void
  // (e: "selectPaciente", paciente: any): void
  (e: "details", paciente: any): void
}>()


</script>

<template>
  <div class="overflow-x-auto">
    <Table :rows="rows">
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead class="hidden md:table-cell">Telefone</TableHead>
          <TableHead class="hidden lg:table-cell">Email</TableHead>
          <TableHead class="hidden lg:table-cell">Data Nasc.</TableHead>
          <TableHead class="hidden xl:table-cell">Clínica</TableHead>
          <TableHead class="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        <TableRow
          v-for="p in rows"
          :key="p.id"
          @click="emit('rowClick', p)"
          class="cursor-pointer hover:bg-muted/40"
        >
          <TableCell class="font-medium flex items-center gap-2">
            <User class="h-4 w-4 text-muted-foreground" /> {{ p.nome }}
          </TableCell>

          <TableCell class="hidden md:table-cell">{{ p.telefone || "—" }}</TableCell>
          <TableCell class="hidden lg:table-cell">{{ p.email || "—" }}</TableCell>

          <TableCell class="hidden lg:table-cell">
            {{ p.data_nascimento || "—" }}
          </TableCell>

          <TableCell class="hidden xl:table-cell">{{ p.clinica }}</TableCell>

          <TableCell class="text-right">
            <div class="flex items-center justify-end gap-2">
              <Button
                @click.stop="emit('details', p)"
                variant="ghost"
                size="icon"
                title="Ver detalhes"
              >
                <Eye class="h-4 w-4" />
              </Button>
              <Button
                @click.stop="emit('edit', p)"
                variant="ghost"
                size="icon"
                title="Editar"
              >
                <Edit class="h-4 w-4" />
              </Button>

              <Button
                @click.stop="emit('delete', p)"
                variant="ghost"
                size="icon"
                title="Eliminar"
              >
                <Trash2 class="h-4 w-4" />
              </Button>
            </div>
          </TableCell>
        </TableRow>

        <TableRow v-if="rows.length === 0">
          <TableCell colspan="6" class="text-center py-6 text-muted-foreground">
            Nenhum paciente encontrado.
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
