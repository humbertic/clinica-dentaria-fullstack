<script setup lang="ts">
import { ref, watch } from "vue";
import { useToast } from "@/components/ui/toast";

const { toast } = useToast();

type EntidadeFormModel = {
  id?: number;
  nome: string;
  slug: string;
};

const props = defineProps<{
  id?: number;
  entidade?: EntidadeFormModel | null;
}>();

const emit = defineEmits<{
  (e: "save", entidade: any): void;
  (e: "cancel"): void;
}>();

const form = ref<EntidadeFormModel>({
  nome: "",
  slug: "",
});

const loading = ref(false);
const saving = ref(false);
const config = useRuntimeConfig();
const baseUrl = config.public.apiBase;

async function fetchEntidadeById(id: number) {
  loading.value = true;
  try {
    const token = useCookie("token").value;
    const res = await fetch(`${baseUrl}entidades/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (!res.ok) throw new Error("Erro ao buscar entidade");
    const data = await res.json();
    form.value = {
      id: data.id,
      nome: data.nome,
      slug: data.slug,
    };
  } catch (e) {
    toast({
      title: "Erro",
      description: "Erro ao buscar entidade.",
      variant: "destructive",
    });
  } finally {
    loading.value = false;
  }
}

async function onSave() {
  saving.value = true;
  const token = useCookie("token").value;

  const payload = {
    nome: form.value.nome,
    slug: form.value.slug,
  };

  try {
    let res;
    if (props.id) {
      res = await fetch(`${baseUrl}entidades/${props.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
    } else {
      res = await fetch(`${baseUrl}entidades`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
    }
    if (!res.ok) throw new Error("Erro ao salvar entidade");
    const data = await res.json();
    toast({
      title: "Sucesso",
      description: "Entidade salva com sucesso.",
    });
    emit("save", data);
  } catch (e) {
    toast({
      title: "Erro",
      description: "Erro ao salvar entidade.",
      variant: "destructive",
    });
  } finally {
    saving.value = false;
  }
}

watch(
  () => [props.id, props.entidade],
  ([id, entidade]) => {
    if (typeof id === "number") {
      fetchEntidadeById(id);
    } else if (entidade && typeof entidade === "object") {
      form.value = { ...entidade };
    } else {
      form.value = {
        nome: "",
        slug: "",
      };
    }
  },
  { immediate: true }
);

function onCancel() {
  emit("cancel");
}
</script>

<template>
  <div v-if="loading" class="py-8 text-center text-muted-foreground">
    Carregando dados da entidade...
  </div>
  <form
    v-else-if="!props.entidade?.id || form.nome"
    @submit.prevent="onSave"
    class="grid gap-4 py-4"
  >
    <div class="grid grid-cols-4 items-center gap-4">
      <Label for="nome" class="text-right">Nome</Label>
      <div class="col-span-3">
        <Input id="nome" v-model="form.nome" placeholder="Nome da entidade" />
      </div>
    </div>
    <div class="grid grid-cols-4 items-center gap-4">
      <Label for="slug" class="text-right">Slug</Label>
      <div class="col-span-3">
        <Input id="slug" v-model="form.slug" placeholder="Slug" />
      </div>
    </div>
    <DialogFooter>
      <Button variant="outline" type="button" @click="onCancel">Cancelar</Button>
      <Button type="submit" :disabled="saving">Guardar</Button>
    </DialogFooter>
  </form>
  <div v-else class="py-8 text-center text-muted-foreground">
    Dados da entidade não disponíveis.
  </div>
</template>