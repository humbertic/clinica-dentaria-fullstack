<!-- src/components/UserTableComponent.vue -->
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
  Mail,
} from "lucide-vue-next";

/** Mirror your User type here (or import it) */
type User = {
  id: number;
  username: string;
  nome: string;
  email: string;
  telefone: string;
  ativo: boolean;
  bloqueado: boolean;
  perfil: {
    id: number;
    nome: string;
    perfil: string;
  } | null;
  clinicas: {
    clinica: {
      id: number;
      nome: string;
    };
  }[];
};

const props = defineProps<{
  users: User[];
}>();

const emit = defineEmits<{
  (e: "edit", user: User): void;
  (e: "toggle-active", user: User): void;
  (e: "assign-profiles", user: User): void;
  (e: "assign-clinic", user: User): void;
  (e: "unblock", user: User): void;
  (e: "send-email", user: User): void;
}>();
</script>

<template>
  <div class="w-full overflow-x-auto">
    <Table class="w-full text-sm">
      <TableCaption>Lista de utilizadores</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Username</TableHead>
          <TableHead>Nome</TableHead>
          <TableHead class="hidden md:table-cell">Email</TableHead>
          <TableHead class="hidden md:table-cell">Telefone</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead class="hidden lg:table-cell">Clínica</TableHead>
          <TableHead class="hidden lg:table-cell">Perfis</TableHead>
          <TableHead>Bloqueado</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow
          v-for="u in props.users"
          :key="u.id"
          class="hover:bg-muted/50 transition-colors"
        >
          <TableCell class="font-medium">{{ u.username }}</TableCell>
          <TableCell>{{ u.nome }}</TableCell>
          <TableCell class="hidden md:table-cell">{{ u.email }}</TableCell>
          <TableCell class="hidden md:table-cell">{{ u.telefone }}</TableCell>
          <TableCell>
            <span
              :class="[
                'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1',
                u.ativo
                  ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 ring-1 ring-inset ring-green-600/20'
                  : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 ring-1 ring-inset ring-red-600/20',
              ]"
            >
              {{ u.ativo ? "Ativo" : "Inativo" }}
            </span>
          </TableCell>
          <TableCell class="hidden lg:table-cell">
            <div class="flex flex-wrap gap-1">
              <span
                v-for="c in u.clinicas"
                :key="c.clinica.id"
                class="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-600/20 dark:bg-gray-900/20 dark:text-gray-400"
              >
                {{ c.clinica.nome }}
              </span>
            </div>
          </TableCell>
          <TableCell class="hidden lg:table-cell">
            <span
              v-if="u.perfil"
              class="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20 dark:bg-blue-900/20 dark:text-blue-400"
            >
              {{ u.perfil.nome }}
            </span>
          </TableCell>
          <TableCell>
            <span v-if="u.bloqueado" class="text-red-500 font-bold">Sim</span>
            <span v-else class="text-green-500">Não</span>
          </TableCell>
          <TableCell>
            <div class="flex items-center gap-2 flex-wrap">
              <button @click="emit('send-email', u)" class="icon-btn" title="Enviar Email">
                <Mail class="h-4 w-4" />
              </button>
              <button @click="emit('edit', u)" class="icon-btn" title="Editar">
                <Edit class="h-4 w-4" />
              </button>
              <button
                @click="emit('toggle-active', u)"
                class="icon-btn"
                :title="u.ativo ? 'Suspender' : 'Ativar'"
              >
                <component
                  :is="u.ativo ? ShieldOff : CheckCircle"
                  class="h-4 w-4"
                />
              </button>
              <button
                @click="emit('assign-profiles', u)"
                class="icon-btn"
                title="Perfil"
              >
                <BadgePlus class="h-4 w-4" />
              </button>
              <button
                @click="emit('assign-clinic', u)"
                class="icon-btn"
                title="Clínicas"
              >
                <Building class="h-4 w-4" />
              </button>
              <button
                v-if="u.bloqueado"
                @click="emit('unblock', u)"
                class="icon-btn"
                title="Desbloquear"
              >
                <!-- You can use an icon or just text -->
                <ShieldOff class="h-4 w-4 text-red-500" />
              </button>
            </div>
          </TableCell>
          
        </TableRow>

        <TableRow v-if="props.users.length === 0">
          <TableCell colspan="8" class="p-4 text-center text-muted-foreground">
            Nenhum utilizador encontrado.
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>

<style scoped>
.icon-btn {
  @apply inline-flex items-center justify-center h-8 w-8 p-0 rounded-md border
         border-input bg-background text-sm transition-colors
         hover:bg-accent hover:text-accent-foreground
         focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring
         disabled:pointer-events-none disabled:opacity-50;
}
</style>
