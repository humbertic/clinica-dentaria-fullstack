<script setup lang="ts">
import { useToast } from "@/components/ui/toast";

const config = useRuntimeConfig();
const baseUrl = config.public.apiBase;
const { toast } = useToast();

const props = defineProps<{
  user: {
    id: number;
    username: string;
    nome: string;
    telefone: string;
    email: string;
    perfil: { id: number; nome: string; perfil: string } | null;
  };
}>();

const emit = defineEmits<{
  (e: "updated", user: any, sign: string): void;
  (e: "cancel"): void;
}>();

const form = reactive({
  nome: props.user?.nome ?? "",
  telefone: props.user?.telefone ?? "",
});

watch(
  () => props.user,
  (u) => {
    form.nome = u?.nome ?? "";
    form.telefone = u?.telefone ?? "";
  }
);

const loading = ref(false);
const error = ref("");

async function handleSubmit() {
  if (!props.user) return;
  loading.value = true;
  error.value = "";

  try {
    const token = useCookie("token").value;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const updated = await $fetch<{ nome: string }>(
      `${baseUrl}utilizadores/${props.user.id}`,
      {
        method: "PUT",
        body: {
          nome: form.nome,
          telefone: form.telefone,
        },
        headers,
      }
    );

    emit("updated", updated, "success"); 
    toast({
      title: "Utilizador atualizado!",
      description: `O utilizador ${updated.nome} foi atualizado.`,
    });
  } catch (e: any) {
    error.value =
      e?.data?.detail ?? e?.message ?? "Erro ao atualizar utilizador";
  } finally {
    loading.value = false;
  }
}

function handleCancel() {
  emit("cancel");
}
</script>

<template>
  <div class="grid gap-4 py-2">
    <div class="mb-4">
      <h2 class="text-lg font-semibold">
        Editar Perfil<span v-if="props.user">: {{ props.user.nome }}</span>
      </h2>
      <p class="text-muted-foreground text-sm">
        Só é possível editar o nome e telefone. Os outros dados são apenas
        leitura.
      </p>
    </div>
    <!-- Perfil -->
    <div class="grid grid-cols-4 items-center gap-4">
      <Label class="text-right">Perfil</Label>
      <span class="col-span-3 text-sm text-muted-foreground">
        {{ props.user?.perfil?.nome }}
      </span>
    </div>

    <!-- Username -->
    <div class="grid grid-cols-4 items-center gap-4">
      <Label class="text-right">Username</Label>
      <span class="col-span-3 text-sm text-muted-foreground">
        {{ props.user?.nome }}
      </span>
    </div>

    <!-- Email (read‑only) -->
    <div class="grid grid-cols-4 items-center gap-4">
      <Label for="email" class="text-right">Email</Label>
      <span class="col-span-3 text-sm text-muted-foreground">
        {{ props.user?.email }}
      </span>
    </div>

    <!-- Nome (editable) -->
    <div class="grid grid-cols-4 items-center gap-4">
      <Label for="nome" class="text-right">Nome</Label>
      <Input id="nome" v-model="form.nome" class="col-span-3" />
    </div>

    <!-- Telefone (editable) -->
    <div class="grid grid-cols-4 items-center gap-4">
      <Label for="telefone" class="text-right">Telefone</Label>
      <Input id="telefone" v-model="form.telefone" class="col-span-3" />
    </div>

    <!-- error message -->
    <Alert v-if="error" variant="destructive">
      <AlertTitle>Erro</AlertTitle>
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>

    <!-- footer -->
    <DialogFooter>
      <Button variant="outline" :disabled="loading" @click="handleCancel">
        Cancelar
      </Button>
      <Button type="button" :disabled="loading" @click="handleSubmit">
        Salvar alterações
      </Button>
    </DialogFooter>
  </div>
</template>
