<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useToast } from "@/components/ui/toast";
import { Switch } from '@/components/ui/switch';

// Types
type Categoria = {
  id: number;
  nome: string;
};

type ArtigoForm = {
  codigo: string;
  descricao: string;
  categoria_id: number | null;
  requer_dente: boolean;
  requer_face: boolean;
};

// Props
const props = defineProps<{
  id?: number;
  artigo?: any | null;
}>();

const emit = defineEmits<{
  (e: "save", artigo: any): void;
  (e: "cancel"): void;
}>();

// State
const { toast } = useToast();
const categorias = ref<Categoria[]>([]);
const loading = ref(false);
const saving = ref(false);
const config = useRuntimeConfig();
const baseUrl = config.public.apiBase;

// Simple form ref instead of useForm
const form = ref<ArtigoForm>({
  codigo: "",
  descricao: "",
  categoria_id: null,
  requer_dente: false,
  requer_face: false,
});

// API functions
async function fetchCategorias() {
  try {
    const token = useCookie("token").value;
    const res = await fetch(`${baseUrl}categorias`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (!res.ok) throw new Error("Erro ao buscar categorias");
    const data = await res.json();
    categorias.value = Array.isArray(data) ? data : [];
  } catch (e) {
    toast({
      title: "Erro",
      description: "Erro ao buscar categorias.",
      variant: "destructive",
    });
  }
}

async function fetchArtigoById(id: number) {
  loading.value = true;
  try {
    const token = useCookie("token").value;
    const res = await fetch(`${baseUrl}artigos/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (!res.ok) throw new Error("Erro ao buscar artigo");
    const data = await res.json();
    
    form.value = {
      codigo: data.codigo || "",
      descricao: data.descricao || "",
      categoria_id: data.categoria_id ?? (data.categoria?.id ?? null),
      requer_dente: data.requer_dente ?? false,
      requer_face: data.requer_face ?? false,
    };
  } catch (e) {
    toast({
      title: "Erro",
      description: "Erro ao buscar artigo.",
      variant: "destructive",
    });
  } finally {
    loading.value = false;
  }
}

async function onSubmit(e: Event) {
  e.preventDefault(); 
  
  // Simple validation
  if (!form.value.codigo || !form.value.descricao) {
    toast({
      title: "Erro",
      description: "Preencha todos os campos obrigatórios.",
      variant: "destructive",
    });
    return;
  }
  
  saving.value = true;
  const token = useCookie("token").value;

  try {
    let res;
    if (props.id) {
      res = await fetch(`${baseUrl}artigos/${props.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(form.value),
      });
    } else {
      res = await fetch(`${baseUrl}artigos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(form.value),
      });
    }
    
    if (!res.ok) throw new Error("Erro ao salvar artigo");
    const data = await res.json();
    
    toast({
      title: "Sucesso",
      description: "Artigo salvo com sucesso.",
    });
    
    emit("save", data);
  } catch (e) {
    toast({
      title: "Erro",
      description: "Erro ao salvar artigo.",
      variant: "destructive",
    });
  } finally {
    saving.value = false;
  }
}

// Initialize data
watch(
  () => [props.id, props.artigo],
  ([id, artigo]) => {
    if (typeof id === "number") {
      fetchArtigoById(id);
    } else if (artigo && typeof artigo === "object") {
      const categoria_id =
        artigo.categoria_id ??
        (typeof artigo.categoria === "object"
          ? artigo.categoria.id
          : null);

      form.value = {
        codigo: artigo.codigo || "",
        descricao: artigo.descricao || "",
        categoria_id,
        requer_dente: artigo.requer_dente ?? false,
        requer_face: artigo.requer_face ?? false,
      };
    }
  },
  { immediate: true }
);

onMounted(fetchCategorias);

function onCancel() {
  emit("cancel");
}
</script>

<template>
  <div v-if="loading" class="py-8 text-center text-muted-foreground">
    Carregando dados do artigo...
  </div>
  <form
    v-else
    @submit="onSubmit"
    class="grid gap-4 py-4"
  >
    <!-- Código -->
    <div class="grid grid-cols-4 items-center gap-4">
      <label for="codigo" class="text-right">Código</label>
      <div class="col-span-3">
        <Input 
          id="codigo" 
          v-model="form.codigo" 
          placeholder="Código do artigo" 
          required
        />
      </div>
    </div>
    
    <!-- Descrição -->
    <div class="grid grid-cols-4 items-center gap-4">
      <label for="descricao" class="text-right">Descrição</label>
      <div class="col-span-3">
        <Input 
          id="descricao" 
          v-model="form.descricao" 
          placeholder="Descrição do artigo" 
          required
        />
      </div>
    </div>
    
    <!-- Categoria -->
    <div class="grid grid-cols-4 items-center gap-4">
      <label for="categoria_id" class="text-right">Categoria</label>
      <div class="col-span-3">
        <select
          id="categoria_id"
          v-model="form.categoria_id"
          class="w-full px-3 py-2 border rounded-md bg-background text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          required
        >
          <option :value="null" disabled>Selecione uma categoria</option>
          <option v-for="cat in categorias" :key="cat.id" :value="cat.id">
            {{ cat.nome }}
          </option>
        </select>
      </div>
    </div>
    
    <!-- Requisitos clínicos com toggles -->
    <div class="grid grid-cols-4 items-start gap-4">
      <div class="text-right pt-2">Requisitos clínicos</div>
      <div class="col-span-3 space-y-3">
        <!-- Requer dente -->
        <div class="flex flex-row items-center justify-between rounded-lg border p-3">
          <div class="space-y-0.5">
            <div class="text-base font-medium">Requer dente</div>
            <div class="text-sm text-muted-foreground">
              O procedimento requer a indicação de um dente específico
            </div>
          </div>
          <Switch v-model="form.requer_dente" />
        </div>
        
        <!-- Requer face -->
        <div class="flex flex-row items-center justify-between rounded-lg border p-3">
          <div class="space-y-0.5">
            <div class="text-base font-medium">Requer face</div>
            <div class="text-sm text-muted-foreground">
              O procedimento requer a indicação de uma face específica
            </div>
          </div>
          <Switch v-model="form.requer_face" />
        </div>
      </div>
    </div>
    
    <!-- Buttons -->
    <div class="flex justify-end gap-2 pt-2">
      <Button variant="outline" type="button" @click="onCancel">Cancelar</Button>
      <Button type="submit" :disabled="saving">
        {{ saving ? 'A guardar...' : 'Guardar' }}
      </Button>
    </div>
  </form>
</template>