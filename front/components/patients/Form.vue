<script setup lang="ts">
import { ref, watch } from 'vue'
import { useToast } from '@/components/ui/toast'
import { type DateValue, parseDate } from '@internationalized/date'
import DatePicker from '../ui/date-picker/DatePicker.vue'

// Use selected clinic from global state
type Clinic = { id: number; nome: string }
const selectedClinic = useState<Clinic | null>('selectedClinic')

const { toast } = useToast()

type PacienteFormModel = {
  id?: number
  clinica_id?: number
  nome: string
  nif?: string
  data_nascimento?: DateValue
  sexo?: 'M' | 'F' | 'Outro'
  nacionalidade?: string
  tipo_documento?: string
  numero_documento?: string
  validade_documento?: DateValue
  telefone?: string
  email?: string
  pais_residencia?: string
  morada?: string
}

const props = defineProps<{ open: boolean; id?: number; paciente?: PacienteFormModel }>()
const emit = defineEmits<{ (e: 'save', paciente: any): void; (e: 'update:open', value: boolean): void }>()

const form = ref<PacienteFormModel>({
  nome: '',
  clinica_id: selectedClinic.value?.id,
  nif: undefined,
  data_nascimento: undefined,
  sexo: undefined,
  nacionalidade: undefined,
  tipo_documento: undefined,
  numero_documento: undefined,
  validade_documento: undefined,
  telefone: undefined,
  email: undefined,
  pais_residencia: undefined,
  morada: undefined,
})

const loading = ref(false)
const saving = ref(false)
const activeTab = ref<'identificacao' | 'morada'>('identificacao')

const api = useRuntimeConfig().public.apiBase
const token = useCookie('token').value

const dialogOpen = ref(props.open);

watch(() => props.open, (val) => {
  dialogOpen.value = val;
});

watch(dialogOpen, (val) => {
  if (!val) emit('update:open', false);
});

// Carregar paciente via ID
watch(() => props.id, id => {
  if (id != null) fetchPaciente(id)
}, { immediate: true })

async function fetchPaciente(id: number) {
  loading.value = true
  try {
    const data = await $fetch<{
      id?: number
      clinica_id?: number
      nome: string
      nif?: string
      data_nascimento?: string
      sexo?: 'M' | 'F' | 'Outro'
      nacionalidade?: string
      tipo_documento?: string
      numero_documento?: string
      validade_documento?: string
      telefone?: string
      email?: string
      pais_residencia?: string
      morada?: string
    }>(`${api}pacientes/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })

    form.value = {
      id: data.id,
      nome: data.nome,
      clinica_id: data.clinica_id,
      nif: data.nif,
      data_nascimento: data.data_nascimento ? parseDate(data.data_nascimento) : undefined,
      sexo: data.sexo,
      nacionalidade: data.nacionalidade,
      tipo_documento: data.tipo_documento,
      numero_documento: data.numero_documento,
      validade_documento: data.validade_documento ? parseDate(data.validade_documento) : undefined,
      telefone: data.telefone,
      email: data.email,
      pais_residencia: data.pais_residencia,
      morada: data.morada,
    }
  } catch {
    toast({ title: 'Erro', description: 'Não foi possível carregar paciente.', variant: 'destructive' })
  } finally {
    loading.value = false
  }
}

watch(() => props.paciente, (p) => {
  if (p) {
    form.value = {
      ...p,
      clinica_id: p.clinica_id ?? selectedClinic.value?.id,
      data_nascimento: p.data_nascimento
        ? (typeof p.data_nascimento === "string"
            ? parseDate(p.data_nascimento)
            : (p.data_nascimento && typeof p.data_nascimento.toDate === "function"
                ? p.data_nascimento
                : undefined))
        : undefined,
      validade_documento: p.validade_documento
        ? (typeof p.validade_documento === "string"
            ? parseDate(p.validade_documento)
            : (p.validade_documento && typeof p.validade_documento.toDate === "function"
                ? p.validade_documento
                : undefined))
        : undefined,
    }
  } else {
    // Reset form for new patient, set clinic from global state
    form.value = {
      nome: '',
      clinica_id: selectedClinic.value?.id,
      nif: undefined,
      data_nascimento: undefined,
      sexo: undefined,
      nacionalidade: undefined,
      tipo_documento: undefined,
      numero_documento: undefined,
      validade_documento: undefined,
      telefone: undefined,
      email: undefined,
      pais_residencia: undefined,
      morada: undefined,
    }
  }
}, { immediate: true })

// Salvar paciente
async function onSave() {
  saving.value = true
  try {
    const payload = {
      nome: form.value.nome,
      clinica_id: form.value.clinica_id,
      nif: form.value.nif,
      data_nascimento: form.value.data_nascimento?.toString(),
      sexo: form.value.sexo,
      nacionalidade: form.value.nacionalidade,
      tipo_documento: form.value.tipo_documento,
      numero_documento: form.value.numero_documento,
      validade_documento: form.value.validade_documento?.toString(),
      telefone: form.value.telefone,
      email: form.value.email,
      pais_residencia: form.value.pais_residencia,
      morada: form.value.morada,
    }

    const isEdit = !!form.value.id
    const url = isEdit ? `${api}pacientes/${form.value.id}` : `${api}pacientes`
    const method = isEdit ? 'PUT' : 'POST'
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }

    const resp = await $fetch(url, { method, headers, body: payload })
    toast({ title: 'Sucesso', description: 'Paciente guardado.' })
    emit('save', resp)
    emit('update:open', false)
  } catch {
    toast({ title: 'Erro', description: 'Não foi possível guardar.', variant: 'destructive' })
  } finally {
    saving.value = false
  }
}

function onCancel() {
  emit('update:open', false)
}
</script>

<template>
  <Dialog v-model:open="dialogOpen">
    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>{{ props.id ? 'Editar Paciente' : 'Novo Paciente' }}</DialogTitle>
        <DialogDescription>{{ props.id ? 'Atualize os dados.' : 'Preencha os dados.' }}</DialogDescription>
      </DialogHeader>

      <div v-if="loading" class="py-8 text-center text-muted-foreground">
        Carregando...
      </div>

      <div v-else>
        <Tabs v-model="activeTab" class="w-full">
          <TabsList class="grid grid-cols-2 mb-4">
            <TabsTrigger value="identificacao">Identificação</TabsTrigger>
            <TabsTrigger value="morada">Morada</TabsTrigger>
          </TabsList>

          <TabsContent value="identificacao" class="grid gap-4">
            <!-- Nome -->
            <div class="grid grid-cols-4 items-center gap-4">
              <Label for="nome" class="text-right">Nome</Label>
              <div class="col-span-3"><Input id="nome" v-model="form.nome" /></div>
            </div>
            <!-- NIF -->
            <div class="grid grid-cols-4 items-center gap-4">
              <Label for="nif" class="text-right">NIF</Label>
              <div class="col-span-3"><Input id="nif" v-model="form.nif" /></div>
            </div>
            <!-- Data Nasc. -->
            <div class="grid grid-cols-4 items-center gap-4">
              <Label class="text-right">Data Nasc.</Label>
              <div class="col-span-3">
                <DatePicker
                 :maxValue="parseDate(new Date().toISOString().slice(0, 10))"
                  yearSort="desc"
                  v-model="form.data_nascimento"
                />
              </div>
            </div>
            <!-- Sexo -->
            <div class="grid grid-cols-4 items-center gap-4">
              <Label class="text-right">Sexo</Label>
              <div class="col-span-3">
                <Select v-model="form.sexo">
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">M</SelectItem>
                    <SelectItem value="F">F</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <!-- Nacionalidade -->
            <div class="grid grid-cols-4 items-center gap-4">
              <Label class="text-right">Nacionalidade</Label>
              <div class="col-span-3"><Input v-model="form.nacionalidade" /></div>
            </div>
            <!-- Documento -->
            <div class="grid grid-cols-4 items-center gap-4">
              <Label class="text-right">Tipo Doc.</Label>
              <div class="col-span-1"><Input v-model="form.tipo_documento" /></div>
              <Label class="text-right">Nº Doc.</Label>
              <div class="col-span-1"><Input v-model="form.numero_documento" /></div>
            </div>
            <!-- Validade -->
            <div class="grid grid-cols-4 items-center gap-4">
              <Label class="text-right">Validade Doc.</Label>
              <div class="col-span-3">
                <DatePicker 
                v-model="form.validade_documento"
                :minValue="parseDate(new Date().toISOString().slice(0, 10))"
                yearSort="asc"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="morada" class="grid gap-4">
            <!-- País -->
            <div class="grid grid-cols-4 items-center gap-4">
              <Label class="text-right">País Residência</Label>
              <div class="col-span-3"><Input v-model="form.pais_residencia" /></div>
            </div>
            <!-- Morada -->
            <div class="grid grid-cols-4 items-center gap-4">
              <Label class="text-right">Morada</Label>
              <div class="col-span-3"><Input v-model="form.morada" /></div>
            </div>
            <!-- Telefone -->
            <div class="grid grid-cols-4 items-center gap-4">
              <Label class="text-right">Telefone</Label>
              <div class="col-span-3"><Input v-model="form.telefone" /></div>
            </div>
            <!-- Email -->
            <div class="grid grid-cols-4 items-center gap-4 mb-2">
              <Label class="text-right">Email</Label>
              <div class="col-span-3"><Input type="email" v-model="form.email" /></div>
            </div>
            
          </TabsContent>
        </Tabs>

        <DialogFooter >
          <Button variant="outline" type="button" @click="onCancel">Cancelar</Button>
          <Button type="button" :disabled="saving" @click="onSave">Salvar</Button>
        </DialogFooter>
      </div>
    </DialogContent>
  </Dialog>
</template>
