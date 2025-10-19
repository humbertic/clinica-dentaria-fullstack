<script setup lang="ts">
import { ref } from "vue";
import {
  Calendar,
  Plus,
  Eye,
  Edit,
  ClipboardList,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  Timer,
  Ban,
} from "lucide-vue-next";
import type { PlanoTratamento } from "~/types/pacientes";
// Define the interfaces based on your API response
interface Artigo {
  id: number;
  descricao: string;
  codigo: string;
}

interface PlanoItem {
  id: number;
  plano_id: number;
  artigo_id: number;
  artigo: Artigo;
  quantidade_prevista: number;
  quantidade_executada: number;
  numero_dente: number | null;
  face: string[] | null;
  estado: string;
}

const props = defineProps<{
  isLoading: boolean;
  planos?: PlanoTratamento[];
}>();

const emit = defineEmits<{
  (e: "new"): void;
  (e: "view", planoId: number): void;
  (e: "edit", planoId: number): void;
}>();

// Track which plans are expanded
const expandedPlanos = ref<number[]>([]);

function toggleExpand(planoId: number) {
  const index = expandedPlanos.value.indexOf(planoId);
  if (index === -1) {
    expandedPlanos.value.push(planoId);
  } else {
    expandedPlanos.value.splice(index, 1);
  }
}

function isExpanded(planoId: number) {
  return expandedPlanos.value.includes(planoId);
}

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
</script>

<template>
  <div class="space-y-6">
    <!-- Loading -->
    <div v-if="props.isLoading" class="space-y-4">
      <Skeleton class="h-10 w-48" />
      <Skeleton class="h-64 rounded-2xl" />
    </div>

    <div v-else class="rounded-2xl shadow bg-card text-card-foreground p-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-semibold">Planos de Tratamento</h3>
        <Button @click="emit('new')">
          <Plus class="mr-2 h-4 w-4" />
          Novo Plano
        </Button>
      </div>

      <!-- Lista de planos -->
      <div v-if="props.planos && props.planos.length" class="space-y-6">
        <Card
          v-for="plano in props.planos"
          :key="plano.id"
          class="overflow-hidden hover:shadow-md transition-shadow"
        >
          <CardContent class="p-0">
            <div class="flex flex-col">
              <!-- Main row with plan info -->
              <div class="flex flex-col sm:flex-row">
                <!-- Status indicator (left side) -->
                <div
                  class="sm:w-2 w-full h-2 sm:h-auto"
                  :class="getEstadoColor(plano.estado)"
                ></div>

                <!-- Content (right side) -->
                <div class="p-4 flex-1">
                  <div
                    class="flex flex-col sm:flex-row sm:items-start justify-between gap-2"
                  >
                    <div>
                      <div class="flex items-center gap-2 mb-1">
                        <component
                          :is="getEstadoIcon(plano.estado)"
                          class="h-5 w-5"
                          :class="getEstadoColor(plano.estado)"
                        />
                        <h4 class="font-medium">
                          {{
                            plano.descricao ||
                            `Plano de tratamento #${plano.id}`
                          }}
                        </h4>
                        <Badge
                          :class="[
                            plano.estado === 'em_curso'
                              ? 'bg-blue-100 text-blue-800 hover:bg-blue-100'
                              : plano.estado === 'concluido'
                              ? 'bg-green-100 text-green-800 hover:bg-green-100'
                              : plano.estado === 'cancelado'
                              ? 'bg-red-100 text-red-800 hover:bg-red-100'
                              : 'bg-slate-100 text-slate-800 hover:bg-slate-100',
                          ]"
                        >
                          {{ getEstadoDisplay(plano.estado) }}
                        </Badge>
                      </div>

                      <div
                        class="flex items-center text-sm text-muted-foreground"
                      >
                        <Calendar class="h-3.5 w-3.5 mr-1" />
                        <span
                          >Criado em
                          {{ formatarData(plano.data_criacao) }}</span
                        >
                        <span v-if="plano.data_conclusao" class="ml-4">
                          <CheckCircle2 class="h-3.5 w-3.5 mr-1 inline" />
                          Concluído em {{ formatarData(plano.data_conclusao) }}
                        </span>
                      </div>
                    </div>

                    <div class="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        @click="toggleExpand(plano.id)"
                      >
                        <component
                          :is="isExpanded(plano.id) ? ChevronUp : ChevronDown"
                          class="mr-1 h-4 w-4"
                        />
                        {{ isExpanded(plano.id) ? "Ocultar" : "Detalhes" }}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        @click="emit('view', plano.id)"
                      >
                        <Eye class="mr-1 h-4 w-4" /> Ver
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        @click="emit('edit', plano.id)"
                        v-if="
                          plano.estado !== 'concluido' &&
                          plano.estado !== 'cancelado'
                        "
                      >
                        <Edit class="mr-1 h-4 w-4" /> Editar
                      </Button>
                    </div>
                  </div>

                  <!-- Progress bar -->
                  <div class="mt-4">
                    <div class="flex justify-between mb-1 text-sm">
                      <span>Progresso</span>
                      <span>{{ calculateProgress(plano) }}%</span>
                    </div>
                    <div class="w-full bg-muted rounded-full h-2.5">
                      <div
                        class="bg-primary h-2.5 rounded-full"
                        :style="{ width: `${calculateProgress(plano)}%` }"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Expandable section with plan items -->
              <div v-if="isExpanded(plano.id)" class="border-t bg-muted/30">
                <div class="p-4">
                  <h4 class="text-sm font-medium mb-3">
                    Procedimentos Previstos
                  </h4>

                  <!-- No items message -->
                  <div
                    v-if="!plano.itens?.length"
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
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow v-for="item in plano.itens" :key="item.id">
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
        <h4 class="text-lg font-medium">Sem planos de tratamento</h4>
        <p class="text-sm text-muted-foreground">
          Este paciente ainda não tem planos de tratamento.
        </p>
        <Button @click="emit('new')">Criar Primeiro Plano</Button>
      </div>
    </div>
  </div>
</template>
