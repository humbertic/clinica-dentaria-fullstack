<script setup lang="ts">
import { useToast } from "@/components/ui/toast";

const config = useRuntimeConfig();
const baseUrl = config.public.apiBase;
const { toast } = useToast();
const error = ref("");

const props = defineProps<{
  user: {
    id: number;
    nome: string;
    perfil: { id: number; nome: string; perfil: string } | null;
  } | null;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "saved", perfil: { id: number; nome: string; perfil: string } | null): void;
}>();

const profiles = ref<{ id: number; nome: string; perfil: string }[]>([]);
const selectedPerfil = ref<number | null>(null);

onMounted(async () => {
  error.value = "";
  try {
    const token = useCookie("token").value;
    const res = await fetch(`${baseUrl}perfis`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      error.value = data?.detail || `HTTP ${res.status}`;
      return;
    }
    profiles.value = await res.json();
    selectedPerfil.value = props.user?.perfil ? props.user.perfil.id : null;
  } catch (err: any) {
    error.value = "Erro ao carregar perfis.";
    console.log("Erro ao carregar perfis:", err);
  }
});

function cancel() {
  emit("close");
}

async function save() {
  if (!props.user) return;
  try {
    error.value = "";
    const token = useCookie("token").value;
    const res = await fetch(`${baseUrl}utilizadores/${props.user.id}/perfis`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ perfil_id: selectedPerfil.value }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      error.value = data?.detail || `HTTP ${res.status}`;
      throw new Error(error.value);
    }
    const perfilObj = profiles.value.find(p => p.id === selectedPerfil.value) || null;
    toast({
      title: "Sucesso",
      description: "Perfil atribuído com sucesso.",
    });
    emit("saved", perfilObj);
    emit("close");
  } catch (err) {
    if (!error.value) error.value = "Erro ao gravar perfil.";
    console.error("Erro ao gravar perfil:", err);
  }
}
</script>

<template>
  <div
    class=""
  >
    <div
      class="w-full max-w-lg grid gap-4  bg-background p-4 shadow-lg sm:rounded-lg"
    >
      <div class="space-y-1.5 text-center sm:text-left">
        <h2 class="text-lg font-semibold">Atribuir Perfil</h2>
        <p class="text-sm text-muted-foreground">
          Utilizador: {{ user?.nome }}
        </p>
      </div>
      <Alert v-if="error" variant="destructive">
        <AlertTitle>Erro</AlertTitle>
        <AlertDescription>{{ error }}</AlertDescription>
      </Alert>

      <div>
        <Select v-model="selectedPerfil">
          <SelectTrigger class="w-full">
            <SelectValue placeholder="Selecione um perfil" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Perfis</SelectLabel>
              <SelectItem v-for="p in profiles" :key="p.id" :value="p.id">
                {{ p.nome }}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div
        class="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2"
      >
        <Button type="button" variant="outline" @click="cancel">
          Cancelar
        </Button>
        <Button type="button" @click="save" :disabled="!selectedPerfil">
          Guardar
        </Button>
      </div>
    </div>
  </div>
</template>