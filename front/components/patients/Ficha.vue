<script setup lang="ts">
import { useToast } from "@/components/ui/toast"
import { ref, reactive, watch } from 'vue'
import { ClipboardList, RefreshCw, Save } from "lucide-vue-next"
import { useCookie, useRuntimeConfig } from "#imports"

const { toast } = useToast()

// Props & Emits
const props = defineProps<{
  id?: number
  ficha?: any | null
  paciente?: any
  template?: any[]
}>()



// Reactive form state
const form = reactive({
  // — Cabeçalho —
  nome_paciente: "",
  data_nascimento: "",
  idade: "",
  sexo: "",
  estado_civil: "",
  profissao: "",
  telefone_residencial: "",
  local_trabalho: "",
  telefone_trabalho: "",
  tipo_beneficiario: "",
  numero_beneficiario: "",
  recomendado_por: "",
  data_questionario: "",  
  endereco: "",

  // — Queixa Principal —
  queixa_principal: "",

  // — História Médica e Odontológica —
  tratamento_medico: { sim: false, detalhes: "" },
  medicamento:       { sim: false, detalhes: "" },
  alergias:          { sim: false, detalhes: "" },
  condicoes_sistemicas:   { sim: false, detalhes: "" },
  historico_familiar:     { sim: false, detalhes: "" },
  sintomas_gerais:        { sim: false, detalhes: "" },
  exames_dst:             { sim: false, detalhes: "" },
  historico_cirurgico:    { sim: false, detalhes: "" },
  febre_reumatica:        { sim: false, detalhes: "" },
  fumante:                { sim: false, detalhes: "" },
  alcool:                 { sim: false, detalhes: "" },
  desmaios:               { sim: false, detalhes: "" },
  hemorragia:             { sim: false, detalhes: "" },
  condicao_mulher: { gravida: false, menopausa: false, anticoncepcionais: false },

  // — Histórico Odontológico —
  tratamento_odontologico_previo: { sim: false, detalhes: "" },
  sangramento_gengival:           { sim: false, detalhes: "" },
  higiene_bucal:                  { sim: false, detalhes: "" },

  // — Exame Clínico —
  exame_clinico: "",

  // — Observações Finais —
  observacoes_finais: ""
})

const loading = ref(false)
const saving = ref(false)
const config = useRuntimeConfig()
const apiBase = config.public.apiBase

// Auto-calc age
function calcAge(dob: string) {
  if (!dob) return ""
  const today = new Date(), b = new Date(dob)
  let age = today.getFullYear() - b.getFullYear()
  const m = today.getMonth() - b.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < b.getDate())) age--
  return age.toString()
}
watch(() => form.data_nascimento, v => form.idade = calcAge(v))

// Reset all fields
function resetForm() {
  if (!confirm("Tem certeza que deseja limpar todos os dados?")) return
  Object.keys(form).forEach(key => {
    const val = (form as any)[key]
    if (typeof val === "string") (form as any)[key] = ""
    else if (typeof val === "object") {
      Object.keys(val).forEach(sub => {
        (val as any)[sub] = typeof (val as any)[sub] === "boolean" ? false : ""
      })
    }
  })
  toast({ title: "Formulário limpo", description: "Todos os campos foram resetados" })
}

// Function to safely merge ficha data
function mergeWithSafety(data: any) {
  if (!data) return;
  
  // Set basic fields
  if (data.nome_paciente) form.nome_paciente = data.nome_paciente;
  if (data.data_nascimento) form.data_nascimento = data.data_nascimento;
  if (data.sexo) form.sexo = data.sexo;
  if (data.estado_civil) form.estado_civil = data.estado_civil;
  if (data.profissao) form.profissao = data.profissao;
  if (data.telefone_residencial) form.telefone_residencial = data.telefone_residencial;
  if (data.local_trabalho) form.local_trabalho = data.local_trabalho;
  if (data.telefone_trabalho) form.telefone_trabalho = data.telefone_trabalho;
  if (data.tipo_beneficiario) form.tipo_beneficiario = data.tipo_beneficiario;
  if (data.numero_beneficiario) form.numero_beneficiario = data.numero_beneficiario;
  if (data.recomendado_por) form.recomendado_por = data.recomendado_por;
  if (data.data_questionario) form.data_questionario = data.data_questionario;
  if (data.endereco) form.endereco = data.endereco;
  if (data.queixa_principal) form.queixa_principal = data.queixa_principal;
  if (data.exame_clinico) form.exame_clinico = data.exame_clinico;
  if (data.observacoes_finais) form.observacoes_finais = data.observacoes_finais;
  
  // Handle historia_medica fields
  if (data.tratamento_medico) form.tratamento_medico = data.tratamento_medico;
  if (data.medicamento) form.medicamento = data.medicamento;
  if (data.alergias) form.alergias = data.alergias;
  if (data.condicoes_sistemicas) form.condicoes_sistemicas = data.condicoes_sistemicas;
  if (data.historico_familiar) form.historico_familiar = data.historico_familiar;
  if (data.sintomas_gerais) form.sintomas_gerais = data.sintomas_gerais;
  if (data.exames_dst) form.exames_dst = data.exames_dst;
  if (data.historico_cirurgico) form.historico_cirurgico = data.historico_cirurgico;
  if (data.febre_reumatica) form.febre_reumatica = data.febre_reumatica;
  if (data.fumante) form.fumante = data.fumante;
  if (data.alcool) form.alcool = data.alcool;
  if (data.desmaios) form.desmaios = data.desmaios;
  if (data.hemorragia) form.hemorragia = data.hemorragia;
  
  // Handle condicao_mulher object
  if (data.condicao_mulher) {
    form.condicao_mulher = {
      gravida: data.condicao_mulher.gravida || false,
      menopausa: data.condicao_mulher.menopausa || false,
      anticoncepcionais: data.condicao_mulher.anticoncepcionais || false
    };
  }
  
  // Handle historico odontologico
  if (data.tratamento_odontologico_previo) form.tratamento_odontologico_previo = data.tratamento_odontologico_previo;
  if (data.sangramento_gengival) form.sangramento_gengival = data.sangramento_gengival;
  if (data.higiene_bucal) form.higiene_bucal = data.higiene_bucal;
  
  // Calculate age if data_nascimento is set
  if (data.data_nascimento) {
    form.idade = calcAge(data.data_nascimento);
  }
}

// Save (POST or PUT)
async function saveForm() {
  // basic validation
  if (!form.nome_paciente) {
    toast({ title: "Erro", description: "Nome do paciente é obrigatório", variant: "destructive" })
    return
  }
  if (!form.data_nascimento) {
    toast({ title: "Erro", description: "Data de nascimento é obrigatória", variant: "destructive" })
    return
  }

  saving.value = true
  try {
    const token = useCookie("token").value
    const url = props.id
      ? `${apiBase}pacientes/ficha/${props.id}`
      : `${apiBase}pacientes/ficha`
    const method = props.id ? "PUT" : "POST"

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(form)
    })
    if (!res.ok) throw new Error("Falha ao salvar")

    const data = await res.json()
    toast({ title: "Sucesso", description: "Ficha clínica salva com sucesso" })
  } catch (e) {
    toast({ title: "Erro", description: "Não foi possível salvar a ficha", variant: "destructive" })
    console.error("Error saving form:", e)
  } finally {
    saving.value = false
  }
}

// If editing, load existing ficha
async function loadFicha(id: number) {
  loading.value = true
  try {
    const token = useCookie("token").value
    const res = await fetch(`${apiBase}pacientes/ficha/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    if (!res.ok) throw new Error("Não encontrado")
    const data = await res.json()
    mergeWithSafety(data) // Use the safe merge function
  } catch (error) {
    toast({ title: "Erro", description: "Não foi possível carregar a ficha", variant: "destructive" })
    console.error("Error loading ficha:", error)
  } finally {
    loading.value = false
  }
}

// If ficha is provided as a prop, use it
watch(() => props.ficha, (newFicha) => {
  if (newFicha) {
    mergeWithSafety(newFicha)
  }
}, { immediate: true })

// If paciente data is available, pre-fill some fields
watch(() => props.paciente, (newPaciente) => {
  if (newPaciente && !form.nome_paciente) {
    form.nome_paciente = newPaciente.nome || "";
    form.data_nascimento = newPaciente.data_nascimento || "";
    form.sexo = newPaciente.sexo || "";
    form.telefone_residencial = newPaciente.telefone || "";
    form.endereco = newPaciente.morada || "";
    
    // Calculate age if data_nascimento is set
    if (newPaciente.data_nascimento) {
      form.idade = calcAge(newPaciente.data_nascimento);
    }
  }
}, { immediate: true })

// If ID is provided but not ficha, load it
if (props.id && !props.ficha) {
  loadFicha(props.id)
}
</script>

<template>
  <Card>
    <CardContent class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between mt-4">
        <h1 class="text-2xl font-bold flex items-center">
          <ClipboardList class="mr-2 h-6 w-6"/> Ficha Clínica
        </h1>
        <div class="flex gap-2">
        
          <Button :disabled="saving" @click="saveForm">
            <Save class="mr-2 h-4 w-4"/> Salvar
          </Button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="py-8 text-center text-muted-foreground">
        Carregando ficha clínica…
      </div>

      <!-- Form -->
      <form v-else class="space-y-8">

        <!-- Informações Pessoais -->
        <div class="space-y-4">
          <h2 class="text-xl font-semibold border-b pb-2">Informações Pessoais</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div class="space-y-2">
              <Label for="nome_paciente">Paciente (nome completo)</Label>
              <Input id="nome_paciente" v-model="form.nome_paciente" placeholder="Nome completo" required />
            </div>

            <div class="space-y-2">
              <Label for="data_nascimento">Data de Nascimento</Label>
              <Input id="data_nascimento" v-model="form.data_nascimento" type="date" required />
            </div>

            <div class="space-y-2">
              <Label for="idade">Idade</Label>
              <Input id="idade" v-model="form.idade" readonly placeholder="Calculada automaticamente" />
            </div>

            <div class="space-y-2">
              <Label for="sexo">Género</Label>
              <Select id="sexo" v-model="form.sexo">
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">M</SelectItem>
                  <SelectItem value="F">F</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div class="space-y-2">
              <Label for="estado_civil">Estado Civil</Label>
              <Input id="estado_civil" v-model="form.estado_civil" placeholder="Ex: Solteiro(a)" />
            </div>

            <div class="space-y-2">
              <Label for="profissao">Profissão</Label>
              <Input id="profissao" v-model="form.profissao" />
            </div>

            <div class="space-y-2">
              <Label for="telefone_residencial">Telefone Residencial</Label>
              <Input id="telefone_residencial" v-model="form.telefone_residencial" />
            </div>

            <div class="space-y-2">
              <Label for="local_trabalho">Local de Trabalho</Label>
              <Input id="local_trabalho" v-model="form.local_trabalho" />
            </div>

            <div class="space-y-2">
              <Label for="telefone_trabalho">Telefone do Trabalho</Label>
              <Input id="telefone_trabalho" v-model="form.telefone_trabalho" />
            </div>

            <div class="space-y-2">
              <Label for="tipo_beneficiario">Tipo de Beneficiário</Label>
              <Input id="tipo_beneficiario" v-model="form.tipo_beneficiario" />
            </div>

            <div class="space-y-2">
              <Label for="numero_beneficiario">Número de Beneficiário</Label>
              <Input id="numero_beneficiario" v-model="form.numero_beneficiario" />
            </div>

            <div class="space-y-2">
              <Label for="recomendado_por">Recomendado por</Label>
              <Input id="recomendado_por" v-model="form.recomendado_por" />
            </div>

            <div class="space-y-2">
              <Label for="data_questionario">Data do Questionário</Label>
              <Input id="data_questionario" v-model="form.data_questionario" type="date" />
            </div>

            <div class="col-span-1 md:col-span-2 space-y-2">
              <Label for="endereco">Endereço Residencial</Label>
              <Textarea id="endereco" v-model="form.endereco" rows="2" />
            </div>
          </div>
        </div>

        <!-- Queixa Principal -->
        <div class="space-y-2">
          <h2 class="text-xl font-semibold border-b pb-2">1. Queixa Principal</h2>
          <Textarea id="queixa_principal" v-model="form.queixa_principal" rows="2" />
        </div>

        <!-- História Médica e Odontológica -->
        <div class="space-y-4">
          <h2 class="text-xl font-semibold border-b pb-2">2. História Médica e Odontológica</h2>
          
          <template v-for="q in [
            { id:'tratamento_medico', label:'Está em tratamento médico? Qual?' },
            { id:'medicamento',       label:'Toma algum medicamento? Qual?' },
            { id:'alergias',          label:'Possui alergias? Quais?' },
            { id:'condicoes_sistemicas', label:'Apresenta condições sistêmicas (ex: diabetes, hipertensão)?' },
            { id:'historico_familiar',   label:'Há histórico familiar de diabetes/tuberculose/câncer?' },
            { id:'sintomas_gerais',      label:'Apresenta sintomas como febre, cansaço, etc.?' },
            { id:'exames_dst',           label:'Já fez exames para DST?' },
            { id:'historico_cirurgico',  label:'Já se submeteu a alguma cirurgia?' },
            { id:'febre_reumatica',      label:'Tem ou teve febre reumática/endocardite?' },
            { id:'fumante',              label:'É fumante? Qual quantidade?' },
            { id:'alcool',               label:'Ingere bebidas alcoólicas? Qual frequência?' },
            { id:'desmaios',             label:'Já apresentou desmaios/ataques?' },
            { id:'hemorragia',           label:'Teve hemorragias/excesso de sangramento?' }
          ]" :key="q.id">
            <div  class="border rounded-md p-4 space-y-2">
              <div class="flex items-center space-x-2">
                <Checkbox
                  :id="q.id + '_sim'"
                  v-model="(form as any)[q.id].sim"
                />
                <Label :for="q.id + '_sim'">{{ q.label }}</Label>
              </div>
              <div v-if="(form as any)[q.id].sim" class="mt-2">
                <Input
                  :id="q.id + '_detalhes'"
                  v-model="(form as any)[q.id].detalhes"
                  placeholder="Detalhes"
                />
              </div>
            </div>
          </template>

          <!-- Condição Mulher -->
          <div class="border rounded-md p-4 space-y-2">
            <Label>Para mulheres:</Label>
            <div class="flex flex-wrap gap-4 mt-2">
              <div class="flex items-center space-x-2">
                <Checkbox id="gravida" v-model="form.condicao_mulher.gravida" />
                <Label for="gravida">Grávida</Label>
              </div>
              <div class="flex items-center space-x-2">
                <Checkbox id="menopausa" v-model="form.condicao_mulher.menopausa" />
                <Label for="menopausa">Menopausa</Label>
              </div>
              <div class="flex items-center space-x-2">
                <Checkbox id="anticoncepcionais" v-model="form.condicao_mulher.anticoncepcionais" />
                <Label for="anticoncepcionais">Anticoncepcionais orais</Label>
              </div>
            </div>
          </div>

          <!-- Histórico Odontológico -->
          <template v-for="q in [
            { id:'tratamento_odontologico_previo', label:'Já realizou tratamento odontológico? Qual tipo?' },
            { id:'sangramento_gengival', label:'Sangramento gengival, mobilidade, dor ou mau hábito?' },
            { id:'higiene_bucal', label:'Já recebeu orientações sobre higiene bucal?' }
          ]" :key="q.id">
            <div  class="border rounded-md p-4 space-y-2">
              <div class="flex items-center space-x-2">
                <Checkbox :id="q.id + '_sim'" v-model="(form as any)[q.id].sim" />
                <Label :for="q.id + '_sim'">{{ q.label }}</Label>
              </div>
              <div v-if="(form as any)[q.id].sim" class="mt-2">
                <Input :id="q.id + '_detalhes'" v-model="(form as any)[q.id].detalhes" placeholder="Detalhes" />
              </div>
            </div>
          </template>
        </div>

        <!-- Exame Clínico -->
        <div class="space-y-2">
          <h2 class="text-xl font-semibold border-b pb-2">3. Exame Clínico Extra/Intra bucal</h2>
          <Textarea id="exame_clinico" v-model="form.exame_clinico" rows="4" />
        </div>

        <!-- Observações Finais -->
        <div class="space-y-2">
          <h2 class="text-xl font-semibold border-b pb-2">Observações Finais</h2>
          <Textarea id="observacoes_finais" v-model="form.observacoes_finais" rows="4" />
        </div>

        <!-- Ações -->
        <DialogFooter>
          <Button type="button" @click="saveForm">Salvar</Button>
        </DialogFooter>
      </form>
      
    </CardContent>
  </Card>
</template>