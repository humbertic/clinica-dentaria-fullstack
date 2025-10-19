<template>
  <div class="space-y-4">
    <!-- <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-medium">Histórico de Consultas</h3>
    </div> -->

    <!-- Estado de carregamento -->
    <div
      v-if="loading"
      class="py-8 text-center text-muted-foreground"
    >
      <div
        class="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"
      ></div>
      Carregando histórico...
    </div>

    <!-- Sem consultas -->
    <Card v-else-if="!consultas.length" class="py-8 text-center">
      <CardContent>
        <div class="flex flex-col items-center justify-center space-y-3">
          <ClipboardList class="h-10 w-10 text-muted-foreground" />
          <p class="text-muted-foreground">
            Não há histórico de consultas para este paciente
          </p>
        </div>
      </CardContent>
    </Card>

    <!-- Lista de consultas -->
    <div v-else class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-[80px]"></TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Médico</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead class="text-right">Procedimentos</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-for="consulta in consultas" :key="consulta.id">
            <!-- Linha principal da consulta -->
            <TableRow 
              class="cursor-pointer hover:bg-muted/50"
              :class="{ 'bg-muted/50': expandedConsulta === consulta.id }"
              @click="toggleExpand(consulta.id)"
            >
              <TableCell class="py-2">
                <Button variant="ghost" size="icon" class="h-8 w-8" @click.stop="toggleExpand(consulta.id)">
                  <ChevronDown v-if="expandedConsulta === consulta.id" class="h-4 w-4" />
                  <ChevronRight v-else class="h-4 w-4" />
                </Button>
              </TableCell>
              <TableCell class="font-medium">
                {{ formatDateHour(consulta.data_inicio) }}
              </TableCell>
              <TableCell>{{ consulta.medico?.nome || 'N/A' }}</TableCell>
              <TableCell>
                <Badge :variant="getEstadoVariant(consulta.estado)">
                  {{ getEstadoLabel(consulta.estado) }}
                </Badge>
              </TableCell>
              <TableCell class="text-right">
                {{ consulta.itens?.length || 0 }}
              </TableCell>
            </TableRow>

            <!-- Detalhes da consulta expandida -->
            <TableRow v-if="expandedConsulta === consulta.id">
              <TableCell colspan="6" class="p-0">
                <div class="p-4 bg-muted/30">
                  <h4 class="text-sm font-medium mb-2">Procedimentos realizados</h4>
                  
                  <!-- Tabela de procedimentos -->
                  <div class="rounded-md border bg-background">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Código</TableHead>
                          <TableHead>Descrição</TableHead>
                          <TableHead>Dente</TableHead>
                          <TableHead>Face</TableHead>
                          <TableHead class="text-right">Valor</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow v-for="item in consulta.itens" :key="item.id">
                          <TableCell class="font-medium">{{ getArtigoCodigo(item) }}</TableCell>
                          <TableCell>{{ getArtigoDescricao(item) }}</TableCell>
                          <TableCell>{{ item.numero_dente || 'N/A' }}</TableCell>
                          <TableCell>{{ formatarFaces(item.face) }}</TableCell>
                          <TableCell class="text-right">{{ formatCurrency(item.total) }}</TableCell>
                        </TableRow>
                        
                        <!-- Linha de total -->
                        <TableRow>
                          <TableCell colspan="4" class="text-right font-medium">Total</TableCell>
                          <TableCell class="text-right font-medium">
                            {{ formatCurrency(calcularTotal(consulta.itens)) }}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                  
                  <!-- Observações da consulta -->
                  <div v-if="consulta.observacoes" class="mt-4">
                    <h4 class="text-sm font-medium mb-1">Observações</h4>
                    <p class="text-sm text-muted-foreground">{{ consulta.observacoes }}</p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import { 
  ChevronDown, 
  ChevronRight,
  ClipboardList
} from 'lucide-vue-next';
import type { ConsultaFull, ConsultaItemRead } from '~/types/consulta';
import { useArtigos } from '~/composables/useArtigos';

interface Props {
  consultas: ConsultaFull[];
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  consultas: () => [],
  loading: false
});

const emit = defineEmits<{
  view: [id: number];
}>();

const { artigos } = useArtigos();
const expandedConsulta = ref<number | null>(null);

function toggleExpand(consultaId: number) {
  expandedConsulta.value = expandedConsulta.value === consultaId ? null : consultaId;
}
function formatDateHour(date?: string | Date) {
  if (!date) return 'N/A';
  
  const dateObj = new Date(date);
  
  // Formatar dia e mês com zero à esquerda se necessário
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  
  // Formatar horas e minutos com zero à esquerda
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  
  // Retorna no formato "dd/mm/yyyy às hh:mm"
  return `${day}/${month}/${year} às ${hours}:${minutes}`;
}
function getEstadoVariant(estado?: string) {
  if (!estado) return 'secondary';
  
  const mapping: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    'iniciada': 'default',
    'concluida': 'secondary',
    'cancelada': 'destructive',
  };
  
  return mapping[estado] || 'outline';
}

function getEstadoLabel(estado?: string) {
  if (!estado) return 'Desconhecido';
  
  const mapping: Record<string, string> = {
    'iniciada': 'Em andamento',
    'concluida': 'Concluída',
    'cancelada': 'Cancelada',
  };
  
  return mapping[estado] || estado;
}

function formatarFaces(faces?: string[] | null) {
  if (!faces || !faces.length) return 'N/A';
  return faces.join(', ');
}

function formatCurrency(value?: number | string) {
  if (value === undefined || value === null) return '0,00 CVE';
  return new Intl.NumberFormat('pt-CV', {
    style: 'currency',
    currency: 'CVE',
    minimumFractionDigits: 2
  }).format(Number(value));
}

function calcularTotal(itens?: ConsultaItemRead[]) {
  if (!itens || !itens.length) return 0;
  return itens.reduce((sum, item) => sum + Number(item.total || 0), 0);
}

// Helper para obter o código do artigo
function getArtigoCodigo(item: ConsultaItemRead) {
  // Verifique se o artigo está disponível diretamente no item
  if (item.artigo && 'codigo' in item.artigo) {
    return item.artigo.codigo;
  }
  
  // Caso contrário, procure no array de artigos
  const artigo = artigos.value.find(a => a.id === item.artigo_id);
  return artigo?.codigo || 'N/A';
}

// Helper para obter a descrição do artigo
function getArtigoDescricao(item: ConsultaItemRead) {
  // Verifique se o artigo está disponível diretamente no item
  if (item.artigo && 'descricao' in item.artigo) {
    return item.artigo.descricao;
  }
  
  // Caso contrário, procure no array de artigos
  const artigo = artigos.value.find(a => a.id === item.artigo_id);
  return artigo?.descricao || 'N/A';
}
</script>