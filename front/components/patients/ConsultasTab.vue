<script setup lang="ts">
import { ref, watch } from 'vue';
import { useToast } from '@/components/ui/toast';
import {
  Calendar,
  Eye,
  Plus
} from 'lucide-vue-next';


const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false,
  },
  paciente: {
    type: Object,
    required: true,
  },
  // Accept consultas directly from parent to avoid duplicate API calls
  consultas: {
    type: Array,
    default: () => [],
  }
});

const emit = defineEmits(['schedule', 'view']);

// Local state
const { toast } = useToast();

// We'll use a ref for sorted consultas
const sortedConsultas = ref([]);

// When consultas prop changes, sort them by date (most recent first)
watch(() => props.consultas, (newConsultas) => {
  if (newConsultas && newConsultas.length > 0) {
    sortedConsultas.value = [...newConsultas].sort((a, b) => 
      new Date(b.data_inicio).getTime() - new Date(a.data_inicio).getTime()
    );
  } else {
    sortedConsultas.value = [];
  }
}, { immediate: true });


function handleScheduleConsulta() {
  // emit('schedule');
  toast({
    title: 'Consulta',
    description: `Agendar consulta para ${props.paciente.nome}`,
  });
}
</script>

<template>
  <div class="space-y-6">
    <div v-if="props.isLoading" class="space-y-4">
      <Skeleton class="h-10 w-48" />
      <Skeleton class="h-64 rounded-2xl" />
    </div>

    <div v-else class="rounded-2xl bg-card text-card-foreground">
      <PatientsConsultasHistorico
        :consultas="sortedConsultas"
        :isLoading="props.isLoading"
        @schedule="handleScheduleConsulta"
      />
    </div>
  </div>
</template>