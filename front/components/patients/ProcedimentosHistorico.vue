<script setup lang="ts">

// Define props
const props = defineProps({
  procedimentos: {
    type: Array,
    default: () => []
  }
});

// Formatter functions
function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-PT', {
    day: '2-digit', 
    month: '2-digit',
    year: 'numeric'
  });
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

function formatCurrency(value: number | null | undefined): string {
  if (value === undefined || value === null) return '—';
  return new Intl.NumberFormat('cv-CV', {
    style: 'currency',
    currency: 'CVE'
  }).format(value);
}
</script>

<template>
  <div class="space-y-4">
    <h2 class="text-xl font-semibold border-b pb-2">
      Histórico de Procedimentos
    </h2>

    <div
      v-if="!procedimentos?.length"
      class="text-center py-4 text-muted-foreground border rounded-lg"
    >
      Nenhum procedimento realizado para este paciente.
    </div>

    <div v-else>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Procedimento</TableHead>
            <TableHead>Dente</TableHead>
            <TableHead>Face</TableHead>
            <TableHead>Médico</TableHead>
            <TableHead class="text-right">Valor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow
            v-for="proc in procedimentos"
            :key="proc.id"
            class="hover:bg-muted/50"
          >
            <TableCell>{{ formatDate(proc.consulta_data) }}</TableCell>
            <TableCell>{{ proc.artigo_descricao }}</TableCell>
            <TableCell>{{ proc.numero_dente || "—" }}</TableCell>
            <TableCell>{{ formatFaces(proc.face) }}</TableCell>
            <TableCell>{{ proc.medico_nome || "—" }}</TableCell>
            <TableCell class="text-right font-medium">{{
              formatCurrency(proc.total)
            }}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>