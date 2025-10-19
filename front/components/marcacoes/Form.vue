<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-lg max-h-[80vh] overflow-y-auto">
      <DialogTitle class="mb-4">
        {{ mode === 'create' ? 'Nova Marcação' : 'Editar Marcação' }}
      </DialogTitle>

      <!-- Cartão de Ações e Detalhes (Edit Mode) -->
      <div v-if="mode === 'edit'" class="p-4 rounded-md mb-6 shadow-sm border">
        <h3 class="text-sm font-semibold mb-2">Detalhes da Marcação</h3>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-xs opacity-70">Início</p>
            <p class="font-medium">{{ formatDateTime(eventData!.start) }}</p>
          </div>
          <div>
            <p class="text-xs opacity-70">Fim</p>
            <p class="font-medium">{{ formatDateTime(eventData!.end!) }}</p>
          </div>
          <div>
            <p class="text-xs opacity-70">Paciente</p>
            <p class="font-medium">{{ eventData!.title }}</p>
          </div>
          <div>
            <p class="text-xs opacity-70">Entidade</p>
            <p class="font-medium">{{ eventData!.entidade?.nome }}</p>
          </div>
          <div class="col-span-2">
            <p class="text-xs opacity-70">Telefone</p>
            <p class="font-medium">{{ eventData!.paciente?.telefone }}</p>
          </div>
        </div>
        <!-- Ações Principais em destaque -->
        <div class="flex gap-2 mt-4">
          <Button variant="default" @click="consultaStart">Iniciar Consulta</Button>
          <Button variant="outline" @click="extendEvent">Estender +30 min</Button>
          <Button variant="destructive" @click="failAppointment">Indicar Falha</Button>
        </div>
      </div>

      <!-- Formulário editável (Create & Edit) -->
      <div class="space-y-4">
        <!-- Campos de início/fim sempre visíveis, pré-preenchidos pelo parent ou eventData -->
        <FormField name="start">
          <FormLabel for="start">Início</FormLabel>
          <Input
            id="start"
            type="datetime-local"
            v-model="startValue"
            :min="toDateTimeLocal(now)"
          />
        </FormField>
        <FormField name="end">
          <FormLabel for="end">Fim (5–60 min)</FormLabel>
          <Input
            id="end"
            type="datetime-local"
            v-model="endValue"
            :min="minEnd"
            :max="maxEnd"
          />
        </FormField>

        <FormField name="titulo">
          <FormLabel for="titulo">Título (Paciente)</FormLabel>
          <Input id="titulo" v-model="title" :readonly="mode === 'edit'" />
        </FormField>

        <FormField name="observacoes">
          <FormLabel for="observacoes">Observações</FormLabel>
          <Textarea
            id="observacoes"
            v-model="observacoes"
            rows="4"
            placeholder="Insira observações…"
          />
        </FormField>
      </div>

      <!-- Footer com ações secundárias -->
      <DialogFooter class="mt-6 flex justify-end gap-2">
        <Button variant="outline" @click="cancel">Cancelar</Button>
        <Button
          v-if="mode === 'create'"
          @click="confirm"
          :disabled="!title || !startValue || !endValue || !isIntervalValid"
        >
          Criar
        </Button>
        <Button
          v-else
          @click="confirm"
          :disabled="!isDirty || !isIntervalValid"
        >
          Salvar
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { PropType } from 'vue'
import type { VueCalEvent } from '~/types/marcacao'
import { Dialog, DialogContent, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { FormField, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

// Props e emits
const props = defineProps({
  modelValue:     { type: Boolean, default: false },
  mode:           { type: String as PropType<'create'|'edit'>, default: 'create' },
  defaultTitle:   { type: String, default: '' },
  defaultStart:   { type: Object as PropType<Date|null>, default: null },
  defaultEnd:     { type: Object as PropType<Date|null>, default: null },
  eventData:      { type: Object as PropType<VueCalEvent|null>, default: null }
})
const emit = defineEmits([
  'update:modelValue',
  'confirm',
  'update-event',
  'extend-event',
  'consulta-start',
  'fail-appointment'
])

// Estado do modal
const open = computed({ get: () => props.modelValue, set: v => emit('update:modelValue', v) })

// Campos editáveis
const title = ref('')
const observacoes = ref('')
const startValue = ref('')
const endValue = ref('')

// valores atuais e limites
const now = new Date()
const minEnd = computed(() => {
  if (!startValue.value) return ''
  const dt = new Date(startValue.value)
  dt.setMinutes(dt.getMinutes() + 5)
  return toDateTimeLocal(dt)
})
const maxEnd = computed(() => {
  if (!startValue.value) return ''
  const dt = new Date(startValue.value)
  dt.setMinutes(dt.getMinutes() + 60)
  return toDateTimeLocal(dt)
})
const isIntervalValid = computed(() => {
  if (!startValue.value || !endValue.value) return false
  const s = new Date(startValue.value)
  const e = new Date(endValue.value)
  const diff = e.getTime() - s.getTime()
  return diff >= 5 * 60000 && diff <= 60 * 60000
})

// Valores iniciais para detectar mudanças
const initialTitle = ref('')
const initialObservacoes = ref('')
const initialStart = ref('')
const initialEnd = ref('')

// Ao abrir, inicializa campos com eventData ou defaults
watch(open, isOpen => {
  if (!isOpen) return
  if (props.mode === 'create') {
    title.value = props.defaultTitle
    observacoes.value = ''
    if (props.defaultStart) {
      startValue.value = toDateTimeLocal(props.defaultStart)
      const endDate = props.defaultEnd
        ? props.defaultEnd
        : new Date(props.defaultStart.getTime() + 30 * 60000)
      endValue.value = toDateTimeLocal(endDate)
    } else {
      startValue.value = ''
      endValue.value = ''
    }
    initialTitle.value = title.value
    initialObservacoes.value = observacoes.value
    initialStart.value = startValue.value
    initialEnd.value = endValue.value
  } else if (props.eventData) {
    title.value = props.eventData.title || ''
    observacoes.value = props.eventData.observacoes || ''
    startValue.value = toDateTimeLocal(props.eventData.start)
    endValue.value = toDateTimeLocal(props.eventData.end!)
    initialTitle.value = title.value
    initialObservacoes.value = observacoes.value
    initialStart.value = startValue.value
    initialEnd.value = endValue.value
  }
})

// Ajusta endValue se sair dos limites
watch(startValue, val => {
  if (!val) return
  if (endValue.value < minEnd.value) endValue.value = minEnd.value
  else if (endValue.value > maxEnd.value) endValue.value = maxEnd.value
})

// Computed para saber se algo mudou
const isDirty = computed(() => {
  if (props.mode === 'create') {
    return !!title.value.trim() && !!startValue.value && !!endValue.value
  }
  return (
    title.value !== initialTitle.value ||
    observacoes.value !== initialObservacoes.value ||
    startValue.value !== initialStart.value ||
    endValue.value !== initialEnd.value
  )
})

// Ações
function cancel() { open.value = false }
function confirm() {
  if (!isIntervalValid.value) return
  const payload = {
    title: title.value,
    observacoes: observacoes.value,
    start: new Date(startValue.value),
    end: new Date(endValue.value)
  }
  if (props.mode === 'create') emit('confirm', payload)
  else emit('update-event', { event: props.eventData, ...payload })
  open.value = false
}
function extendEvent() { emit('extend-event', props.eventData) }
function consultaStart() { emit('consulta-start', props.eventData) }
function failAppointment() { emit('fail-appointment', props.eventData) }

// Helpers
function toDateTimeLocal(d: Date): string {
  const offsetMs = d.getTimezoneOffset() * 60000
  return new Date(d.getTime() - offsetMs).toISOString().slice(0,16)
}
function formatDateTime(dt: Date): string {
  const data = dt.toLocaleDateString('pt-PT')
  const hora = dt.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })
  return `${data} às ${hora}`
}
</script>
