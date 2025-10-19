<script setup lang="ts">
import { useToast } from "@/components/ui/toast";
import { useCategorias } from "~/composables/useCategorias";
import type { Categoria, CategoriaCreate, CategoriaUpdate } from '~/types/categoria';
const { toast } = useToast();

const { getCategoriaById, createCategoria, updateCategoria } = useCategorias();

type CategoriaFormModel = CategoriaCreate & { id?: number };

const props = defineProps<{
  id?: number;
  categoria?: CategoriaFormModel | null;
}>();

const emit = defineEmits<{
  (e: "save", categoria: any): void;
  (e: "cancel"): void;
}>();

const form = ref<CategoriaFormModel>({
  nome: "",
  slug: "",
  ordem: 0,
});


const loading = ref(false);
const saving = ref(false);

// Use composable function instead of direct API call
async function fetchCategoriaById(id: number) {
  loading.value = true;
  try {
    const data = await getCategoriaById(id);
    if (data) {
      form.value = {
        id: data.id,
        nome: data.nome,
        slug: data.slug,
        ordem: data.ordem,
      };
    } else {
      throw new Error("Categoria não encontrada");
    }
  } catch (e) {
    toast({
      title: "Erro",
      description: "Erro ao buscar categoria.",
      variant: "destructive",
    });
  } finally {
    loading.value = false;
  }
}

// Use composable functions for saving
async function onSave() {
  saving.value = true;

  const payload = {
    nome: form.value.nome,
    slug: form.value.slug,
    ordem: form.value.ordem ?? 0,
  };

  try {
    let result;
    if (props.id) {
      // Update existing category
      result = await updateCategoria(props.id, payload);
    } else {
      // Create new category
      result = await createCategoria(payload);
    }

    if (result) {
      toast({
        title: "Sucesso",
        description: "Categoria salva com sucesso.",
      });
      emit("save", result);
    } else {
      throw new Error("Não foi possível salvar a categoria");
    }
  } catch (e) {
    toast({
      title: "Erro",
      description: "Erro ao salvar categoria.",
      variant: "destructive",
    });
  } finally {
    saving.value = false;
  }
}

watch(
  () => [props.id, props.categoria],
  ([id, categoria]) => {
    if (typeof id === "number") {
      fetchCategoriaById(id);
    } else if (categoria && typeof categoria === "object") {
      form.value = { ...categoria };
    } else {
      form.value = {
        nome: "",
        slug: "",
        ordem: 0,
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
    Carregando dados da categoria...
  </div>
  <form
    v-else-if="!props.categoria?.id || form.nome"
    @submit.prevent="onSave"
    class="grid gap-4 py-4"
  >
    <!-- Form fields remain unchanged -->
    <div class="grid grid-cols-4 items-center gap-4">
      <Label for="nome" class="text-right">Nome</Label>
      <div class="col-span-3">
        <Input id="nome" v-model="form.nome" placeholder="Nome da categoria" />
      </div>
    </div>
    <div class="grid grid-cols-4 items-center gap-4">
      <Label for="ordem" class="text-right">Ordem</Label>
      <div class="col-span-3">
        <NumberField
          id="ordem"
          v-model="form.ordem"
          :min="0"
          :default-value="0"
          class="w-full"
        >
          <NumberFieldContent>
            <NumberFieldDecrement />
            <NumberFieldInput
              class="w-full px-3 py-2 border rounded-md bg-background text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <NumberFieldIncrement />
          </NumberFieldContent>
        </NumberField>
      </div>
    </div>
    <div class="grid grid-cols-4 items-center gap-4">
      <Label for="slug" class="text-right">Slug</Label>
      <div class="col-span-3">
        <Input id="slug" v-model="form.slug" placeholder="Slug" />
      </div>
    </div>
    <DialogFooter>
      <Button variant="outline" type="button" @click="onCancel"
        >Cancelar</Button
      >
      <Button type="submit" :disabled="saving">
        {{ saving ? "A guardar..." : "Guardar" }}
      </Button>
    </DialogFooter>
  </form>
  <div v-else class="py-8 text-center text-muted-foreground">
    Dados da categoria não disponíveis.
  </div>
</template>
