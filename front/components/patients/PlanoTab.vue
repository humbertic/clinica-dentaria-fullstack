<script setup lang="ts">
import { ref } from "vue";
import {
  Calendar,
  Plus,
  PlayCircle,
  ClipboardList,
  CheckCircle2,
  Clock,
  AlertCircle,
  Timer,
  Ban,
} from "lucide-vue-next";
import type { PlanoTratamento } from "~/types/plano";

const props = defineProps<{
  isLoading: boolean;
  planos: PlanoTratamento | null;
}>();

const emit = defineEmits<{
  (e: "new"): void;
  (e: "start-procedure", itemId: number, planoId: number, procedimento: any): void;
}>();

// Always show details since we removed the toggle buttons
const isDetailsExpanded = ref(true);

function formatarData(data: string): string {
  if (!data) return "—";
  const d = new Date(data);
  return d.toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getEstadoDisplay(estado: string): string {
  const map: Record<string, string> = {
    em_curso: "Em andamento",
    concluido: "Concluído",
    cancelado: "Cancelado",
    aguardando: "Aguardando aprovação",
    pendente: "Pendente",
  };
  return map[estado] || estado;
}

function getEstadoIcon(estado: string) {
  switch (estado) {
    case "em_curso":
      return Clock;
    case "concluido":
      return CheckCircle2;
    case "cancelado":
      return Ban;
    case "aguardando":
      return Timer;
    case "pendente":
      return AlertCircle;
    default:
      return AlertCircle;
  }
}

function getEstadoColor(estado: string): string {
  switch (estado) {
    case "em_curso":
      return "text-blue-500";
    case "concluido":
      return "text-green-500";
    case "cancelado":
      return "text-red-500";
    case "aguardando":
      return "text-amber-500";
    case "pendente":
      return "text-slate-500";
    default:
      return "text-slate-500";
  }
}

function calculateProgress(plano: PlanoTratamento): number {
  if (!plano.itens || plano.itens.length === 0) return 0;

  let executed = 0;
  let total = 0;

  for (const item of plano.itens) {
    executed += item.quantidade_executada;
    total += item.quantidade_prevista;
  }

  return total > 0 ? Math.round((executed / total) * 100) : 0;
}

function formatItemEstado(estado: string): string {
  const map: Record<string, string> = {
    pendente: "Pendente",
    em_andamento: "Em andamento",
    concluido: "Concluído",
    cancelado: "Cancelado",
  };
  return map[estado] || estado;
}

function formatFaces(faces: string[] | null): string {
  if (!faces || faces.length === 0) return "—";

  const faceMap: Record<string, string> = {
    V: "Vestibular",
    L: "Lingual",
    M: "Mesial",
    D: "Distal",
    O: "Oclusal",
    I: "Incisal",
  };

  return faces.map((face) => faceMap[face] || face).join(", ");
}

function startProcedure(item: any) {
  if (props.planos) {
    emit('start-procedure', item.id, props.planos.id, item);
  }
}

// Check if a procedure can be started (not completed or canceled)
function canStartProcedure(item: any): boolean {
  return item.estado !== 'concluido' && item.estado !== 'cancelado';
}
</script>

<template>
  <div class="space-y-2">
    <!-- Loading -->
    <div v-if="props.isLoading" class="space-y-4">
      <Skeleton class="h-10 w-48" />
      <Skeleton class="h-64 rounded-2xl" />
    </div>

    <div v-else class="rounded-2xl shadow bg-card text-card-foreground">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-semibold">Plano de Tratamento Ativo</h3>
       
      </div>

      <!-- Single plan display -->
      <div v-if="props.planos" class="space-y-6">
        <Card class="overflow-hidden hover:shadow-md transition-shadow">
          <CardContent class="p-0">
            <div class="flex flex-col">
              <!-- Main row with plan info -->
              <div class="flex flex-col sm:flex-row">
                <!-- Status indicator (left side) -->
                <div
                  class="sm:w-2 w-full h-2 sm:h-auto"
                  :class="getEstadoColor(props.planos.estado)"
                ></div>

                <!-- Content (right side) -->
                <div class="p-4 flex-1">
                  <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <div class="flex items-center gap-2 mb-1">
                        <component
                          :is="getEstadoIcon(props.planos.estado)"
                          class="h-5 w-5"
                          :class="getEstadoColor(props.planos.estado)"
                        />
                        <h4 class="font-medium">
                          {{
                            props.planos.descricao ||
                            `Plano de tratamento #${props.planos.id}`
                          }}
                        </h4>
                        <Badge
                          :class="[
                            props.planos.estado === 'em_curso'
                              ? 'bg-blue-100 text-blue-800 hover:bg-blue-100'
                              : props.planos.estado === 'concluido'
                              ? 'bg-green-100 text-green-800 hover:bg-green-100'
                              : props.planos.estado === 'cancelado'
                              ? 'bg-red-100 text-red-800 hover:bg-red-100'
                              : 'bg-slate-100 text-slate-800 hover:bg-slate-100',
                          ]"
                        >
                          {{ getEstadoDisplay(props.planos.estado) }}
                        </Badge>
                      </div>

                      <div class="flex items-center text-sm text-muted-foreground">
                        <Calendar class="h-3.5 w-3.5 mr-1" />
                        <span>Criado em {{ formatarData(props.planos.data_criacao) }}</span>
                        <span v-if="props.planos.data_conclusao" class="ml-4">
                          <CheckCircle2 class="h-3.5 w-3.5 mr-1 inline" />
                          Concluído em {{ formatarData(props.planos.data_conclusao) }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Progress bar -->
                  <div class="mt-4">
                    <div class="flex justify-between mb-1 text-sm">
                      <span>Progresso</span>
                      <span>{{ calculateProgress(props.planos) }}%</span>
                    </div>
                    <div class="w-full bg-muted rounded-full h-2.5">
                      <div
                        class="bg-primary h-2.5 rounded-full"
                        :style="{ width: `${calculateProgress(props.planos)}%` }"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Procedures section - Always visible -->
              <div class="border-t bg-muted/30">
                <div class="p-4">
                  <h4 class="text-sm font-medium mb-3">
                    Procedimentos Previstos
                  </h4>

                  <!-- No items message -->
                  <div
                    v-if="!props.planos.itens?.length"
                    class="text-sm text-center py-2 text-muted-foreground"
                  >
                    Nenhum procedimento previsto neste plano.
                  </div>

                  <!-- Items table -->
                  <div v-else class="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Código</TableHead>
                          <TableHead>Procedimento</TableHead>
                          <TableHead>Dente</TableHead>
                          <TableHead>Face</TableHead>
                          <TableHead>Qtd Prevista</TableHead>
                          <TableHead>Qtd Executada</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Ação</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow v-for="item in props.planos.itens" :key="item.id">
                          <TableCell class="font-mono">{{
                            item.artigo?.codigo || `#${item.artigo_id}`
                          }}</TableCell>
                          <TableCell>{{
                            item.artigo?.descricao || `Procedimento ${item.id}`
                          }}</TableCell>
                          <TableCell>{{ item.numero_dente || "—" }}</TableCell>
                          <TableCell>{{ formatFaces(item.face) }}</TableCell>
                          <TableCell class="text-center">{{
                            item.quantidade_prevista
                          }}</TableCell>
                          <TableCell class="text-center">{{
                            item.quantidade_executada
                          }}</TableCell>
                          <TableCell>
                            <Badge
                              :class="[
                                item.estado === 'concluido'
                                  ? 'bg-green-100 text-green-800 hover:bg-green-100'
                                  : item.estado === 'em_andamento'
                                  ? 'bg-blue-100 text-blue-800 hover:bg-blue-100'
                                  : item.estado === 'cancelado'
                                  ? 'bg-red-100 text-red-800 hover:bg-red-100'
                                  : 'bg-slate-100 text-slate-800 hover:bg-slate-100',
                              ]"
                            >
                              {{ formatItemEstado(item.estado) }}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              @click="startProcedure(item)"
                              :disabled="!canStartProcedure(item)"
                              :title="canStartProcedure(item) ? 'Iniciar procedimento' : 'Procedimento já finalizado'"
                            >
                              <PlayCircle 
                                class="h-5 w-5" 
                                :class="canStartProcedure(item) ? 'text-primary hover:text-primary/80' : 'text-muted-foreground'"
                              />
                            </Button>
                          </TableCell>
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

      <!-- Empty State -->
      <div v-else class="text-center py-8 space-y-3">
        <ClipboardList class="h-12 w-12 mx-auto text-muted-foreground" />
        <h4 class="text-lg font-medium">Sem plano de tratamento ativo</h4>
        <p class="text-sm text-muted-foreground">
          Este paciente não tem um plano de tratamento ativo.
        </p>
      </div>
    </div>
  </div>
</template>