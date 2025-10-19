<script setup lang="ts">
import {
  Calendar,
  Clock,
  User,
  Building,
  CheckCircle,
  XCircle,
  AlertTriangle,
  CalendarClock,
  ChevronDown,
  ChevronUp,
  Receipt
} from 'lucide-vue-next';
import { ref } from 'vue';

const props = defineProps({
  consultas: {
    type: Array,
    default: () => []
  },
  isLoading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['view', 'schedule']);

// Track which consultation details are expanded
const expandedConsultas = ref<number[]>([]);

function toggleExpand(consultaId: number) {
  const index = expandedConsultas.value.indexOf(consultaId);
  if (index === -1) {
    expandedConsultas.value.push(consultaId);
  } else {
    expandedConsultas.value.splice(index, 1);
  }
}

function isExpanded(consultaId: number) {
  return expandedConsultas.value.includes(consultaId);
}

// Helper functions
function formatDate(dateString: string): string {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function formatTime(dateString: string): string {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleTimeString('pt-PT', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatCurrency(value: number | null | undefined): string {
  if (value === undefined || value === null) return '—';
  return new Intl.NumberFormat('cv-CV', {
    style: 'currency',
    currency: 'CVE'
  }).format(value);
}

function formatFaces(faces: string | string[] | null | undefined): string {
  if (!faces) return '—';
  
  const faceMap: Record<string, string> = {
    'V': 'Vestibular',
    'L': 'Lingual',
    'M': 'Mesial',
    'D': 'Distal',
    'O': 'Oclusal',
    'I': 'Incisal'
  };
  
  // Handle both string and array formats
  const facesArray = Array.isArray(faces) ? faces : faces.split(',');
  return facesArray.map(f => faceMap[f] || f).join(', ');
}

function getStatusIcon(estado: string) {
  switch (estado.toLowerCase()) {
    case 'concluida':
      return CheckCircle;
    case 'cancelada':
      return XCircle;
    case 'agendada':
      return CalendarClock;
    case 'iniciada':
      return Clock;
    default:
      return AlertTriangle;
  }
}

function getStatusColor(estado: string): string {
  switch (estado.toLowerCase()) {
    case 'concluida':
      return 'text-green-500';
    case 'cancelada':
      return 'text-red-500';
    case 'agendada':
      return 'text-blue-500';
    case 'iniciada':
      return 'text-amber-500';
    case 'falta':
      return 'text-gray-500';
    default:
      return 'text-gray-500';
  }
}

function getStatusText(estado: string): string {
  switch (estado.toLowerCase()) {
    case 'concluida':
      return 'Concluída';
    case 'cancelada':
      return 'Cancelada';
    case 'agendada':
      return 'Agendada';
    case 'iniciada':
      return 'Em andamento';
    case 'falta':
      return 'Falta';
    default:
      return estado;
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold">Histórico de Consultas</h3>
      <Button @click="emit('schedule')">
        <Calendar class="mr-2 h-4 w-4" />
        Agendar Consulta
      </Button>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="py-8 text-center">
      <div class="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
      <p class="text-muted-foreground">Carregando histórico de consultas...</p>
    </div>

    <!-- Empty state -->
    <div v-else-if="!props.consultas?.length" class="text-center py-8 border rounded-lg">
      <Calendar class="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <h4 class="text-lg font-medium">Sem consultas</h4>
      <p class="text-sm text-muted-foreground mb-4">
        Este paciente ainda não tem consultas registadas.
      </p>
      <Button @click="emit('schedule')">Agendar Primeira Consulta</Button>
    </div>

    <!-- Consultas list -->
    <div v-else class="space-y-4">
      <Card 
        v-for="consulta in props.consultas" 
        :key="consulta.id" 
        class="overflow-hidden hover:shadow-md transition-shadow"
      >
        <CardContent class="p-0">
          <div class="flex flex-col">
            <!-- Main row with consultation info -->
            <div class="flex flex-col sm:flex-row">
              <!-- Status indicator (left side) -->
              <div 
                class="sm:w-2 w-full h-2 sm:h-auto" 
                :class="getStatusColor(consulta.estado)"
              ></div>
              
              <!-- Content (right side) -->
              <div class="p-4 flex-1">
                <div class="flex items-start justify-between">
                  <div>
                    <div class="flex items-center gap-2 mb-1">
                      <component 
                        :is="getStatusIcon(consulta.estado)" 
                        class="h-5 w-5" 
                        :class="getStatusColor(consulta.estado)"
                      />
                      <span 
                        class="text-sm font-medium" 
                        :class="getStatusColor(consulta.estado)"
                      >
                        {{ getStatusText(consulta.estado) }}
                      </span>
                    </div>
                    
                    <div class="flex items-center gap-6 mb-2 text-sm text-muted-foreground">
                      <div class="flex items-center gap-1">
                        <Calendar class="h-4 w-4" />
                        <span>{{ formatDate(consulta.data_inicio) }}</span>
                      </div>
                      <div class="flex items-center gap-1">
                        <Clock class="h-4 w-4" />
                        <span>{{ formatTime(consulta.data_inicio) }}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    @click="toggleExpand(consulta.id)"
                  >
                    <component :is="isExpanded(consulta.id) ? ChevronUp : ChevronDown" class="mr-1 h-4 w-4" />
                    {{ isExpanded(consulta.id) ? 'Ocultar' : 'Detalhes' }}
                  </Button>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4 mt-3">
                  <div class="flex items-center gap-2">
                    <User class="h-4 w-4 text-muted-foreground" />
                    <span class="text-sm">
                      {{ consulta.medico?.nome ? `Dr. ${consulta.medico.nome}` : 'Médico não atribuído' }}
                    </span>
                  </div>
                  
                  <div class="flex items-center gap-2">
                    <Building class="h-4 w-4 text-muted-foreground" />
                    <span class="text-sm">
                      {{ consulta.entidade?.nome || 'Sem entidade' }}
                    </span>
                  </div>
                </div>
                
                <div v-if="consulta.observacoes" class="mt-3 text-sm border-t pt-2">
                  <p class="text-muted-foreground">{{ consulta.observacoes }}</p>
                </div>
              </div>
            </div>
            
            <!-- Expandable section with consultation items (procedures) -->
            <div v-if="isExpanded(consulta.id)" class="border-t bg-muted/30">
              <div class="p-4">
                <h4 class="text-sm font-medium flex items-center mb-3">
                  <Receipt class="h-4 w-4 mr-2" />
                  Procedimentos Realizados
                </h4>
                
                <!-- No items message -->
                <div v-if="!consulta.itens?.length" class="text-sm text-center py-2 text-muted-foreground">
                  Nenhum procedimento registrado nesta consulta.
                </div>
                
                <!-- Items table -->
                <div v-else class="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Procedimento</TableHead>
                        <TableHead>Dente</TableHead>
                        <TableHead>Face</TableHead>
                        <TableHead class="text-right">Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow v-for="item in consulta.itens" :key="item.id">
                        <TableCell>{{ item.artigo_descricao || `Artigo#${item.artigo_id}` }}</TableCell>
                        <TableCell>{{ item.numero_dente || '—' }}</TableCell>
                        <TableCell>{{ formatFaces(item.face) }}</TableCell>
                        <TableCell class="text-right">{{ formatCurrency(item.total) }}</TableCell>
                      </TableRow>
                      <!-- Total row -->
                      <TableRow v-if="consulta.itens?.length > 0" class="bg-muted/50 font-medium">
                        <TableCell colspan="3" class="text-right">Total</TableCell>
                        <TableCell class="text-right">{{
                          formatCurrency(
                            consulta.itens.reduce((sum, item) => sum + (item.total || 0), 0)
                          )
                        }}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>