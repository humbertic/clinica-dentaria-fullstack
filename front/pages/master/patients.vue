<script setup lang="ts">
import { Plus, FileText, Search } from "lucide-vue-next";
import { useToast } from "@/components/ui/toast";
import { parseDate } from "@internationalized/date";
import { useCookie, useRouter, useRuntimeConfig, useState } from "nuxt/app";
import { computed, onMounted, reactive, ref, watch } from "vue";

type Paciente = {
  id: number;
  nome: string;
  nif?: string;
  data_nascimento?: string;
  sexo?: "M" | "F" | "Outro";
  telefone?: string;
  email?: string;
  nacionalidade?: string;
  tipo_documento?: string;
  numero_documento?: string;
  validade_documento?: string;
  pais_residencia?: string;
  morada?: string;
  clinica: { id: number; nome: string };
};

type Clinic = {
  id: number;
  nome: string;
  morada?: string;
  email_envio?: string;
};

const selectedClinic = useState<Clinic | null>("selectedClinic");
const { toast } = useToast();
const router = useRouter();
const baseUrl = useRuntimeConfig().public.apiBase;
const token = useCookie("token").value;

const pacientes = ref<Paciente[]>([]);
const searchQuery = ref("");
const selectedPaciente = ref<Paciente | null>(null);

const dialogs = reactive({
  pacienteForm: false,
  danger: false,
});

async function fetchPacientes() {
  if (!selectedClinic.value) {
    pacientes.value = [];
    return;
  }
  try {
    const res = await $fetch<Paciente[]>(
      `${baseUrl}pacientes?clinica_id=${selectedClinic.value.id}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      }
    );
    pacientes.value = res;
  } catch (e) {
    toast({ title: "Erro", description: (e as Error).message });
  }
}

onMounted(fetchPacientes);

// ---- mapeia para a tabela ----
const mappedRows = computed(() =>
  pacientes.value
    .filter((p) =>
      p.nome.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
    .map((p) => ({
      id: p.id,
      nome: p.nome,
      telefone: p.telefone ?? "—",
      email: p.email ?? "—",
      data_nascimento: p.data_nascimento ?? "—",
      clinica: p.clinica.nome ?? "—",
    }))
);

// Use pagination composable
const {
  currentPage,
  pageSize,
  paginatedItems: paginatedRows,
  totalItems,
} = usePagination(mappedRows);

function newPaciente() {
  selectedPaciente.value = null;
  dialogs.pacienteForm = true;
}

function editPaciente(row: any) {
  selectedPaciente.value = pacientes.value.find((p) => p.id === row.id) ?? null;
  dialogs.pacienteForm = true;
}

function seeDetails(row: any) {
  selectedPaciente.value = pacientes.value.find((p) => p.id === row.id) ?? null;
}

function redirectToDetail(row: any) {
    router.push(`/master/patient/${row.id}`);
}

watch(
  () => selectedClinic.value,
  (newValue) => {
    if (newValue) {
      fetchPacientes();
    }
  },
  { immediate: true }
);

watch(
  () => dialogs.pacienteForm,
  (open) => {
    if (!open) {
      selectedPaciente.value = null;
    }
  }
);
</script>

<template>
  <div class="flex flex-col gap-8 p-6">
    <!-- Header -->
    <div
      class="sticky top-0 z-10 bg-background pt-2 pb-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
      <h1 class="text-2xl font-bold tracking-tight">Pacientes</h1>
      <Button @click="newPaciente">
        <Plus class="mr-2 h-4 w-4" /> Novo Paciente
      </Button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Lista -->
      <Card class="lg:col-span-8 rounded-2xl shadow-md">
        <CardHeader>
          <CardTitle>Lista de Pacientes</CardTitle>
          <div class="relative w-full mt-2">
            <Input
              v-model="searchQuery"
              placeholder="Pesquisar pacientes..."
              class="w-full pl-9"
            />
            <Search
              class="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            />
          </div>
        </CardHeader>

        <CardContent>
          <PatientsTable
            :rows="paginatedRows"
            @edit="editPaciente"
            @delete="
              dialogs.danger = true;
              selectedPaciente = $event;
            "
            @rowClick="seeDetails"
            @details="redirectToDetail"
          />

          <!-- Pagination -->
          <UiTablePagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total-items="totalItems"
          />
        </CardContent>
      </Card>

      <Card class="lg:col-span-4 rounded-2xl shadow-md">
        <CardHeader>
          <CardTitle>Detalhes do Paciente</CardTitle>
        </CardHeader>
        <CardContent>
          <template v-if="selectedPaciente">
            <div class="space-y-2">
              <div><strong>Nome:</strong> {{ selectedPaciente.nome }}</div>
              <div><strong>NIF:</strong> {{ selectedPaciente.nif || "—" }}</div>
              <div>
                <strong>Data Nasc.:</strong>
                {{ selectedPaciente.data_nascimento || "—" }}
              </div>
              <div>
                <strong>Sexo:</strong> {{ selectedPaciente.sexo || "—" }}
              </div>
              <div>
                <strong>Telefone:</strong>
                {{ selectedPaciente.telefone || "—" }}
              </div>
              <div>
                <strong>Email:</strong> {{ selectedPaciente.email || "—" }}
              </div>
              <div>
                <strong>Nacionalidade:</strong>
                {{ selectedPaciente.nacionalidade || "—" }}
              </div>
              <div>
                <strong>Tipo Doc.:</strong>
                {{ selectedPaciente.tipo_documento || "—" }}
              </div>
              <div>
                <strong>Nº Doc.:</strong>
                {{ selectedPaciente.numero_documento || "—" }}
              </div>
              <div>
                <strong>Validade Doc.:</strong>
                {{ selectedPaciente.validade_documento || "—" }}
              </div>
              <div>
                <strong>País Residência:</strong>
                {{ selectedPaciente.pais_residencia || "—" }}
              </div>
              <div>
                <strong>Morada:</strong> {{ selectedPaciente.morada || "—" }}
              </div>
              <div>
                <strong>Clínica:</strong>
                {{ selectedPaciente.clinica?.nome || "—" }}
              </div>
            </div>
          </template>
          <template v-else>
            <div class="text-center text-muted-foreground py-8">
              <FileText class="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Selecione um paciente para ver os detalhes</p>
            </div>
          </template>
        </CardContent>
      </Card>
    </div>

    <PatientsForm
      :open="dialogs.pacienteForm"
      :id="selectedPaciente?.id"
      :paciente="
        selectedPaciente
          ? {
              ...selectedPaciente,
              clinica_id: selectedPaciente.clinica.id,
              data_nascimento: selectedPaciente.data_nascimento
                ? parseDate(selectedPaciente.data_nascimento)
                : undefined,
              validade_documento: selectedPaciente.validade_documento
                ? parseDate(selectedPaciente.validade_documento)
                : undefined,
            }
          : undefined
      "
      @save="fetchPacientes"
      @update:open="dialogs.pacienteForm = $event"
    />

    <ConfirmDangerDialog
      :open="dialogs.danger"
      title="Tens a certeza?"
      description="Esta ação não pode ser desfeita. O paciente e a ficha clínica serão eliminados."
      @cancel="dialogs.danger = false"
      @confirm="null"
    />
  </div>
</template>
