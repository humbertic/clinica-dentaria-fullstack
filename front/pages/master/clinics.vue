<script setup lang="ts">
import { useToast } from "@/components/ui/toast";
// import ClinicsEmail from '@/components/clinics/ClinicEmail.vue';
import { useCookie, useRouter, useRuntimeConfig, useState } from "#app";
import { Search, Plus, Settings, FileText } from "lucide-vue-next";
import { computed, onMounted, ref } from "vue";

// Defina o tipo da clínica
type Clinic = {
  id: number;
  nome: string;
  email_envio: string;
  partilha_dados: boolean;
  morada: string;
  parent_id: number | null;
  clinica_pai?: {
    id: number;
    nome: string;
  } | null;
};

const { toast } = useToast();
const router = useRouter();
const config = useRuntimeConfig();
const baseUrl = config.public.apiBase;

const clinics = ref<Clinic[]>([]);

const searchQuery = ref("");
const selectedClinic = ref<Clinic | null>(null);
const showClinicFormDialog = ref(false);
const showConfigFormDialog = ref(false);
const showEmailFormDialog = ref(false);
const showDangerConfirmDialog = ref(false);

async function fetchClinics() {
  const token = useCookie("token").value;

  try {
    const res = await fetch(`${baseUrl}clinica`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (!res.ok) throw new Error("Erro ao buscar clínicas");
    clinics.value = await res.json();
  } catch (e) {
    clinics.value = [];
    toast({
      title: "Erro ao buscar utilizadores",
      description: e instanceof Error ? e.message : String(e),
    });
  }
}

onMounted(fetchClinics);

const mappedClinics = computed(() =>
  clinics.value.map((c) => ({
    id: c.id,
    name: c.nome,
    email: c.email_envio,
    partilha_dados: c.partilha_dados,
    morada: c.morada,
    parentId: c.clinica_pai?.id || null, // Use parent ID directly
    parentName: c.clinica_pai?.nome, // Add parent name directly
  }))
);

const filteredClinics = computed(() => {
  if (!searchQuery.value) return mappedClinics.value;
  const query = searchQuery.value.toLowerCase();
  return mappedClinics.value.filter(
    (c) =>
      c.name.toLowerCase().includes(query) ||
      c.email?.toLowerCase().includes(query) ||
      c.morada?.toLowerCase().includes(query)
  );
});

// Use pagination composable
const {
  currentPage,
  pageSize,
  paginatedItems: paginatedClinics,
  totalItems,
} = usePagination(filteredClinics);

function selectClinic(clinic: Clinic) {
  selectedClinic.value = clinics.value.find((c) => c.id === clinic.id) || null;
}

// Métodos de UI (placeholders)
function editClinic(clinic: Clinic) {
  selectedClinic.value = { id: clinic.id } as Clinic;
  showClinicFormDialog.value = true;
}

function newClinic() {
  selectedClinic.value = null;
  showClinicFormDialog.value = true;
}

async function saveClinic(clinic: any) {
  await fetchClinics();
  showClinicFormDialog.value = false;
  selectedClinic.value = null;
}

function saveConfig() {
  showConfigFormDialog.value = false;
}

function saveEmailConfig() {
  showEmailFormDialog.value = false;
}

function confirmDelete() {
  showDangerConfirmDialog.value = false;
}

function redirectToConfig(clinic: Clinic) {
  router.push(`/master/clinic/${clinic.id}/settings`);
}
</script>
<template>
  <div class="flex flex-col gap-8 p-6">
    <div class="sticky top-0 z-10 bg-background pt-2 pb-4 border-b">
      <div
        class="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <h1 class="text-2xl font-bold tracking-tight">Clínicas</h1>
        <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button @click="newClinic" variant="default">
            <Plus class="mr-2 h-4 w-4" />
            Nova Clínica
          </Button>
          <Button @click="showConfigFormDialog = true" variant="secondary">
            <Settings class="mr-2 h-4 w-4" />
            Configurações Globais
          </Button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <Card class="lg:col-span-8 rounded-2xl shadow-md">
        <CardHeader>
          <CardTitle>Lista de Clínicas</CardTitle>
          <CardDescription
            >Gerencie todas as clínicas da plataforma</CardDescription
          >
          <div class="relative w-full mt-2">
            <Input
              v-model="searchQuery"
              type="text"
              placeholder="Pesquisar clínicas..."
              class="w-full pl-9"
            />
            <Search
              class="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            />
          </div>
        </CardHeader>
        <CardContent>
          <ClinicsClinicTable
            :clinics="paginatedClinics"
            :clinic="selectedClinic"
            @edit="editClinic"
            @delete="
              showDangerConfirmDialog = true;
              selectedClinic = $event;
            "
            @config="redirectToConfig"
            @email="
              showEmailFormDialog = true;
              selectedClinic = $event;
            "
            @selectClinic="selectClinic"
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
          <CardTitle>Detalhes da Clínica</CardTitle>
          <CardDescription
            >Informações detalhadas da clínica selecionada</CardDescription
          >
        </CardHeader>
        <CardContent class="space-y-4">
          <template v-if="selectedClinic">
            <div class="space-y-2">
              <div><strong>Nome:</strong> {{ selectedClinic.nome }}</div>
              <div>
                <strong>Email:</strong> {{ selectedClinic.email_envio }}
              </div>
              <div><strong>Morada:</strong> {{ selectedClinic.morada }}</div>
              <pre>{{}}</pre>
              <div>
                <strong>Partilha de Dados:</strong>
                <span
                  :class="[
                    'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 mx-2',
                    selectedClinic.partilha_dados
                      ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 ring-green-600/20'
                      : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 ring-red-600/20',
                  ]"
                >
                  {{ selectedClinic.partilha_dados ? "Ativo" : "Inativo" }}
                </span>
              </div>
              <div>
                <strong>Clínica-Pai:</strong>
                <span v-if="selectedClinic.clinica_pai">
                  {{ selectedClinic.clinica_pai.nome }}
                </span>
                <span v-else-if="selectedClinic.clinica_pai">
                  {{
                    clinics.find((c) => c.id === selectedClinic?.clinica_pai?.id)
                      ?.nome || "Clínica #" + selectedClinic?.clinica_pai?.id
                  }}
                </span>
                <span v-else> Nenhuma </span>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="text-center text-muted-foreground py-8">
              <FileText class="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Selecione uma clínica para ver os detalhes</p>
            </div>
          </template>
        </CardContent>
      </Card>
    </div>

    <Dialog
      :open="showClinicFormDialog"
      @update:open="showClinicFormDialog = $event"
    >
      <DialogContent class="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{{
            selectedClinic ? "Editar Clínica" : "Nova Clínica"
          }}</DialogTitle>
          <DialogDescription>
            {{
              selectedClinic
                ? "Atualize os dados da clínica"
                : "Preencha os dados para criar uma nova clínica"
            }}
          </DialogDescription>
        </DialogHeader>
        <ClinicsClinicForm
          :id="selectedClinic?.id || undefined"
          :clinic="
            selectedClinic && Object.keys(selectedClinic).length > 1
              ? selectedClinic
              : null
          "
          :clinics="clinics"
          @save="saveClinic"
          @cancel="showClinicFormDialog = false"
        />
      </DialogContent>
    </Dialog>

    <ClinicsClinicEmail
      :open="showEmailFormDialog"
      :clinicId="selectedClinic?.id ?? 0"
      @update:open="showEmailFormDialog = $event"
      @save="saveEmailConfig"
    />

    <Dialog
      :open="showDangerConfirmDialog"
      @update:open="showDangerConfirmDialog = $event"
    >
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tens a certeza?</DialogTitle>
          <DialogDescription>
            Esta ação não pode ser desfeita. Esta operação irá eliminar
            permanentemente a clínica e todos os seus dados associados.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="sm:justify-between">
          <Button variant="outline" @click="showDangerConfirmDialog = false">
            Cancelar
          </Button>
          <Button variant="destructive" @click="confirmDelete">
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog
      :open="showConfigFormDialog"
      @update:open="showConfigFormDialog = $event"
    >
      <DialogContent class="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Adicionar Configuração</DialogTitle>
          <DialogDescription>
            Adicione uma nova configuração para esta clínica
          </DialogDescription>
        </DialogHeader>
        <div class="grid gap-4 py-4">
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="config-key" class="text-right">Chave</Label>
            <div class="col-span-3">
              <Input id="config-key" placeholder="Nome da configuração" />
            </div>
          </div>
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="config-value" class="text-right">Valor</Label>
            <div class="col-span-3">
              <Textarea id="config-value" placeholder="Valor da configuração" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="showConfigFormDialog = false"
            >Cancelar</Button
          >
          <Button @click="saveConfig">Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
