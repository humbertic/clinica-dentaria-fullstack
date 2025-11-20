<script setup lang="ts">
import { PencilIcon, CheckIcon, XIcon, CircleIcon } from "lucide-vue-next";
import type { Orcamento } from "~/types/orcamento";
import type { Paciente } from "~/types/pacientes";
import type { Entidade } from "~/types/entidade";
import type { Clinica } from "~/types/clinica";

const props = defineProps<{
  orcamentos: Orcamento[];
  pacientes: Paciente[];
  entidades: Entidade[];
  clinica?: Clinica | null;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: "edit", orcamento: Orcamento): void;
  (e: "delete", id: number): void;
  (e: "approve", id: number): void;
  (e: "reject", id: number): void;
}>();

// Funções auxiliares
const getPacienteNome = (orcamento: Orcamento) => {
  if (orcamento.paciente?.nome) {
    return orcamento.paciente.nome;
  }
  const paciente = props.pacientes.find((p) => p.id === orcamento.paciente_id);
  return paciente ? paciente.nome : `Paciente ${orcamento.paciente_id}`;
};

const getPacienteEmail = (orcamento: Orcamento) => {
  if (orcamento.paciente?.email) {
    return orcamento.paciente.email;
  }
  const paciente = props.pacientes.find((p) => p.id === orcamento.paciente_id);
  return paciente?.email || undefined;
};

const getEntidadeNome = (orcamento: Orcamento) => {
  if (orcamento.entidade?.nome) {
    return orcamento.entidade.nome;
  }
  const entidade = props.entidades.find((e) => e.id === orcamento.entidade_id);
  return entidade ? entidade.nome : `Entidade ${orcamento.entidade_id}`;
};

const formatarData = (data: string) => {
  return new Date(data).toLocaleDateString("pt-PT");
};

// Função para formatar valores monetários
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("cv-CV", {
    style: "currency",
    currency: "CVE",
  }).format(value);
};

const getEstadoLabel = (estado: string) => {
  switch (estado) {
    case "rascunho":
      return "Rascunho";
    case "aprovado":
      return "Aprovado";
    case "rejeitado":
      return "Rejeitado";
    default:
      return estado;
  }
};

const getEstadoClasses = (estado: string) => {
  switch (estado) {
    case "rascunho":
      return "bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400 ring-1 ring-inset ring-gray-600/20";
    case "aprovado":
      return "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 ring-1 ring-inset ring-green-600/20";
    case "rejeitado":
      return "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 ring-1 ring-inset ring-red-600/20";
    default:
      return "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 ring-1 ring-inset ring-blue-600/20";
  }
};
</script>

<template>
  <div class="w-full overflow-x-auto">
    <Table class="w-full text-sm">
      <TableCaption>Lista de Orçamentos</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Nº</TableHead>
          <TableHead>Data</TableHead>
          <TableHead>Paciente</TableHead>
          <TableHead>Entidade</TableHead>
          <TableHead class="text-right">Seg.</TableHead>
          <TableHead class="text-right">Pac.</TableHead>
          <TableHead class="text-center">Estado</TableHead>
          <TableHead class="text-center">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow
          v-for="orcamento in props.orcamentos"
          :key="orcamento.id"
          class="hover:bg-muted/50 transition-colors"
        >
          <TableCell class="font-medium">{{ orcamento.id }}</TableCell>
          <TableCell>{{ formatarData(orcamento.data) }}</TableCell>
          <TableCell>{{ getPacienteNome(orcamento) }}</TableCell>
          <TableCell>{{ getEntidadeNome(orcamento) }}</TableCell>
          <TableCell class="text-right">{{
            formatCurrency(orcamento.total_entidade)
          }}</TableCell>
          <TableCell class="text-right">{{
            formatCurrency(orcamento.total_paciente)
          }}</TableCell>
          <TableCell class="text-center">
            <span
              class="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium"
              :class="getEstadoClasses(orcamento.estado)"
            >
              <CheckIcon
                v-if="orcamento.estado === 'aprovado'"
                class="h-3 w-3 mr-1"
              />
              <XIcon
                v-if="orcamento.estado === 'rejeitado'"
                class="h-3 w-3 mr-1"
              />
              <CircleIcon
                v-if="orcamento.estado === 'rascunho'"
                class="h-3 w-3 mr-1"
              />
              {{ getEstadoLabel(orcamento.estado) }}
            </span>
          </TableCell>
          <TableCell>
            <div class="flex items-center justify-center gap-2 flex-wrap">
              <!-- Document Actions (Download, View, Email) -->
              <DocumentsActions
                type="orcamento"
                :id="orcamento.id"
                :clinica-id="clinica?.id"
                :paciente-email="getPacienteEmail(orcamento)"
              />

              <button
                @click="emit('edit', orcamento)"
                class="icon-btn"
                title="Editar Orçamento"
              >
                <PencilIcon class="h-4 w-4" />
              </button>

              <!-- Botões adicionais dependendo do estado -->
              <template v-if="orcamento.estado === 'rascunho'">
                <button
                  @click="emit('approve', orcamento.id)"
                  class="icon-btn"
                  title="Aprovar Orçamento"
                >
                  <CheckIcon class="h-4 w-4 text-green-500" />
                </button>

                <button
                  @click="emit('reject', orcamento.id)"
                  class="icon-btn"
                  title="Rejeitar Orçamento"
                >
                  <XIcon class="h-4 w-4 text-red-500" />
                </button>
              </template>
            </div>
          </TableCell>
        </TableRow>

        <TableRow v-if="props.orcamentos.length === 0">
          <TableCell colspan="8" class="p-4 text-center text-muted-foreground">
            Nenhum orçamento encontrado.
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
<style scoped>
.icon-btn {
  @apply inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted p-0 text-muted-foreground hover:text-foreground transition-colors;
}

/* Cores específicas para ações */
button[title="Aprovar Orçamento"]:hover .h-4 {
  @apply text-green-600;
}

button[title="Rejeitar Orçamento"]:hover .h-4 {
  @apply text-red-600;
}
</style>
