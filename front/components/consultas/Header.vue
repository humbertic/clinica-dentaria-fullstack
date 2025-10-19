<template>
  <div v-if="!isLoading && consulta">
    <header
      class="flex flex-wrap items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-md shadow"
    >
      <div class="flex items-center space-x-2">
        <div class="text-xl font-semibold">Consulta #{{ consulta.id }}</div>
        <Badge :variant="estadoVariant">
          {{ estadoLabel }}
        </Badge>
      </div>

      <div class="flex flex-col space-y-1 text-sm text-muted-foreground">
        <div class="flex items-center space-x-1">
          <ClockIcon class="w-4 h-4" />
          <span>{{ formatDateTime(consulta.data_inicio) }}</span>
        </div>
        <div class="flex items-center space-x-1">
          <UserIcon class="w-4 h-4" />
          <NuxtLink
            v-if="consulta.paciente?.id"
            :to="`/doctor/patient/${consulta.paciente.id}?consulta_id=${consulta.id}`"
            class="hover:underline hover:text-primary transition-colors"
          >
            {{ consulta.paciente?.nome }}
          </NuxtLink>
          <span v-else>{{ consulta.paciente?.nome }}</span>
        </div>
      </div>

      <div class="flex space-x-2">
        <slot name="actions" />
      </div>
    </header>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from "vue";
import { computed } from "vue";
import { Badge } from "@/components/ui/badge";
import { ClockIcon, UserIcon } from "lucide-vue-next";
import type { ConsultaFull } from "~/types/consulta";

const props = defineProps({
  consulta: { type: Object as PropType<ConsultaFull>, required: true },
  isLoading: { type: Boolean, default: false },
});

/**
 * Formata data/hora para 'dd/MM/yyyy às HH:mm'
 */
function formatDateTime(dt: Date | string) {
  const date = typeof dt === "string" ? new Date(dt) : dt;
  const d = date.toLocaleDateString("pt-PT");
  const h = date.toLocaleTimeString("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${d} às ${h}`;
}

const estadoLabel = computed(() => {
  switch (props.consulta.estado) {
    case "rascunho":
      return "Agendada";
    case "iniciada":
      return "Iniciada";
    case "concluida":
      return "Concluída";
    case "falta":
      return "Falta";
    default:
      return String(props.consulta.estado);
  }
});

const estadoVariant = computed(() => {
  switch (props.consulta.estado) {
    case "rascunho":
      return "outline";
    case "iniciada":
      return "secondary";
    case "concluida":
      return "default";
    case "falta":
      return "destructive";
    default:
      return "outline";
  }
});
</script>
