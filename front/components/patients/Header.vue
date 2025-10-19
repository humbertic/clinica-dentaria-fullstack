<script setup lang="ts">
import {
  ChevronRight,
  Fingerprint,
  Calendar,
  User,
  FileText,
} from "lucide-vue-next";

const props = defineProps({
  paciente: {
    type: Object,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});
</script>

<template>
  <div>
    <div
      v-if="isLoading"
      class="rounded-2xl shadow bg-card text-card-foreground p-6"
    >
      <div
        class="flex flex-col md:flex-row md:items-start md:justify-between gap-4"
      >
        <div class="space-y-2">
          <Skeleton class="h-8 w-64" />
          <Skeleton class="h-5 w-96" />
        </div>
        <div class="flex flex-wrap gap-2">
          <Skeleton class="h-10 w-36" />
          <Skeleton class="h-10 w-36" />
          <Skeleton class="h-10 w-36" />
        </div>
      </div>
    </div>
    <div v-else class="rounded-2xl shadow bg-card text-card-foreground p-6">
      <div
        class="flex flex-col md:flex-row md:items-start md:justify-between gap-4"
      >
        <div>
          <h1 class="text-2xl font-bold tracking-tight">{{ paciente.nome }}</h1>
          <div
            class="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground"
          >
            <div class="flex items-center">
              <Fingerprint class="h-4 w-4 mr-1" />
              <span>ID: {{ paciente.id }}</span>
            </div>
            <div class="flex items-center">
              <Calendar class="h-4 w-4 mr-1" />
              <span>{{ paciente.idade }} anos</span>
            </div>
            <div class="flex items-center">
              <User class="h-4 w-4 mr-1" />
              <span>{{
                paciente.sexo === "M" ? "Masculino" : "Feminino"
              }}</span>
            </div>
            <div class="flex items-center">
              <FileText class="h-4 w-4 mr-1" />
              <span>NIF: {{ paciente.nif || "Não definido" }}</span>
            </div>
          </div>
        </div>
        <div class="flex flex-wrap gap-2">
          <slot name="actions" />
        </div>
      </div>
    </div>
  </div>
</template>
