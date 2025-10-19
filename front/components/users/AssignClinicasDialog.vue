<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useToast } from "@/components/ui/toast";

const props = defineProps<{
  user: { id: number; nome: string } | null;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "saved", clinicaIds: number[]): void;
}>();

const clinicas = ref<{ id: number; nome: string }[]>([]);
const selectedClinicas = ref<number[]>([]);
const loading = ref(false);
const error = ref("");

const { toast } = useToast();
const config = useRuntimeConfig();
const baseUrl = config.public.apiBase;

onMounted(async () => {
  console.log("user", props.user);
  error.value = "";
  try {
    const token = useCookie("token").value;
    const res = await fetch(`${baseUrl}clinica`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (!res.ok) throw new Error("Erro ao buscar clínicas");
    clinicas.value = await res.json();
  } catch (e: any) {
    error.value = e?.message || "Erro ao buscar clínicas";
  }
});

function cancel() {
  emit("close");
}

async function save() {
  if (!props.user) return;
  loading.value = true;
  error.value = "";
  try {
    const token = useCookie("token").value;
    const res = await fetch(`${baseUrl}utilizadores/${props.user.id}/clinica`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ clinica_ids: selectedClinicas.value }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      error.value = data?.detail || `HTTP ${res.status}`;
      throw new Error(error.value);
    }
    toast({
      title: "Sucesso",
      description: "Clínicas atribuídas com sucesso.",
    });
    emit("saved", selectedClinicas.value);
    emit("close");
  } catch (err) {
    if (!error.value) error.value = "Erro ao gravar clínicas.";
  } finally {
    loading.value = false;
  }
}


watch(
  () => props.user,
  (user) => {
    if (user && Array.isArray(user.clinicas)) {
      selectedClinicas.value = user.clinicas.map(c => c.clinica.id);
    } else {
      selectedClinicas.value = [];
    }
  },
  { immediate: true }
);
</script>

<template>
  <div class="">
    <div class="space-y-1.5 text-center sm:text-left">
      <h2 class="text-lg font-semibold">Atribuir Clínicas</h2>
      <p class="text-sm text-muted-foreground">
        Utilizador: {{ props.user?.nome }}
      </p>
    </div>
    <Alert v-if="error" variant="destructive">
      <AlertTitle>Erro</AlertTitle>
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>
    <div>
           <div
        v-for="clinica in clinicas"
        :key="clinica.id"
        class="flex items-center gap-3 py-2"
      >
        <input
          type="checkbox"
          :id="`clinica-${clinica.id}`"
          :value="clinica.id"
          v-model="selectedClinicas"
          class="h-5 w-5 accent-primary border-gray-300 rounded focus:ring-2 focus:ring-primary transition"
        />
        <label
          :for="`clinica-${clinica.id}`"
          class="text-base font-medium cursor-pointer select-none"
        >
          {{ clinica.nome }}
        </label>
      </div>
    </div>
    <div class="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
      <Button type="button" variant="outline" @click="cancel" :disabled="loading">
        Cancelar
      </Button>
      <Button type="button" @click="save" :disabled="loading || selectedClinicas.length === 0">
        Guardar
      </Button>
      
    </div>
  </div>
</template>