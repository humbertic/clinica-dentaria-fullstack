<script setup lang="ts">
const props = defineProps<{
  clinic: {
    id: number;
    nome: string;
    email_envio: string;
    partilha_dados: boolean;
    morada: string;
    parent_id: number | null;
  } | null;
  clinics: {
    id: number;
    nome: string;
  }[];
}>();
</script>

<template>
  <div v-if="clinic" class="space-y-2 p-6">
    <div><strong>Nome:</strong> {{ clinic.nome }}</div>
    <div><strong>Email:</strong> {{ clinic.email_envio }}</div>
    <div><strong>Morada:</strong> {{ clinic.morada }}</div>
    <div>
      <strong>Partilha de Dados:</strong>
      <span
        :class="[
          'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 mx-2',
          clinic.partilha_dados
            ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 ring-green-600/20'
            : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 ring-red-600/20',
        ]"
      >
        {{ clinic.partilha_dados ? "Ativo" : "Inativo" }}
      </span>
    </div>
    <div>
      <strong>Clínica-Pai:</strong>
      {{
        clinic.parent_id
          ? clinics.find((c) => c.id === clinic?.parent_id)?.nome
          : "Nenhuma"
      }}
    </div>
  </div>
  <div v-else class="text-center text-muted-foreground py-8">
    <FileText class="h-12 w-12 mx-auto mb-2 opacity-50" />
    <p>Selecione uma clínica para ver os detalhes</p>
  </div>
</template>