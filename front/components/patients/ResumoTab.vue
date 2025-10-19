<script setup lang="ts">
import { defineProps } from 'vue'
import { Phone, Mail, Calendar, Building2, MapPin } from 'lucide-vue-next'

const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false
  },
  paciente: {
    type: Object,
    required: true
  }
})

function formatarData(d?: string) {
  if (!d) return 'Não definida';
  try {
    const dt = new Date(d)
    return dt.toLocaleDateString('pt-PT', { day:'2-digit', month:'2-digit', year:'numeric' })
  } catch (e) {
    return 'Data inválida';
  }
}
</script>

<template>
  <div class="space-y-6">
    <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Skeleton class="h-64 rounded-2xl" />
      <Skeleton class="h-64 rounded-2xl" />
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardContent>
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold">Dados Pessoais</h3>
          </div>
          <div class="space-y-3">
            <div class="flex items-start">
              <Phone class="h-4 w-4 mr-2 text-muted-foreground" />
              <div>
                <p class="text-sm font-medium">Telefone</p>
                <p class="text-sm text-muted-foreground">{{ paciente.telefone || 'Não definido' }}</p>
              </div>
            </div>
            <div class="flex items-start">
              <Mail class="h-4 w-4 mr-2 text-muted-foreground" />
              <div>
                <p class="text-sm font-medium">Email</p>
                <p class="text-sm text-muted-foreground">{{ paciente.email || 'Não definido' }}</p>
              </div>
            </div>
            <div class="flex items-start">
              <Calendar class="h-4 w-4 mr-2 text-muted-foreground" />
              <div>
                <p class="text-sm font-medium">Data de Nascimento</p>
                <p class="text-sm text-muted-foreground">{{ formatarData(paciente.data_nascimento || paciente.dataNascimento) }}</p>
              </div>
            </div>
            <div class="flex items-start">
              <Building2 class="h-4 w-4 mr-2 text-muted-foreground" />
              <div>
                <p class="text-sm font-medium">Clínica</p>
                <p class="text-sm text-muted-foreground">{{ paciente.clinica?.nome || 'Principal' }}</p>
              </div>
            </div>
            <div class="flex items-start">
              <MapPin class="h-4 w-4 mr-2 text-muted-foreground" />
              <div>
                <p class="text-sm font-medium">Endereço</p>
                <p class="text-sm text-muted-foreground">{{ paciente.morada || 'Não definido' }}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="space-y-4">
          <h3 class="text-lg font-semibold">Resumo</h3>
          <div class="grid grid-cols-2 gap-4">
            <div class="rounded-lg bg-muted p-4 text-center">
              <p class="text-3xl font-bold">{{ paciente.consultas?.length || 0 }}</p>
              <p class="text-sm text-muted-foreground">Consultas</p>
            </div>
            <div class="rounded-lg bg-muted p-4 text-center">
              <p class="text-3xl font-bold">{{ paciente.planos?.filter(p => p.estado === 'em_curso').length || 0 }}</p>
              <p class="text-sm text-muted-foreground">Planos Ativos</p>
            </div>
          </div>
          
          <!-- Additional info about the patient could go here -->
          <div class="p-4 bg-muted rounded-lg mt-2">
            <h4 class="text-sm font-medium mb-1">Informações Adicionais</h4>
            <div class="text-sm text-muted-foreground">
              <p>Nacionalidade: {{ paciente.nacionalidade || 'Não definida' }}</p>
              <p>NIF: {{ paciente.nif || 'Não definido' }}</p>
              <p>Documento: {{ paciente.tipo_documento || 'Não definido' }} {{ paciente.numero_documento || '' }}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>