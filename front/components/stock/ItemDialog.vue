<script setup lang="ts">
import { useToast } from "@/components/ui/toast";
import { CalendarIcon } from "lucide-vue-next";
import {
  DateFormatter,
  type DateValue,
  getLocalTimeZone,
  parseDate,
} from "@internationalized/date";
import { cn } from "@/lib/utils"; // Adjust the path to your utility function

const props = defineProps<{
  open: boolean;
  itemId?: number | null;
}>();

type Clinic = {
  id: number;
  nome: string;
  morada?: string;
  email_envio?: string;
};

const emit = defineEmits<{
  (e: "close"): void;
  (e: "saved", item: any): void;
}>();

const { toast } = useToast();
const config = useRuntimeConfig();
const baseUrl = config.public.apiBase;
const clinics = ref<{ id: number; nome: string }[]>([]);
const df = new DateFormatter("pt-PT", { dateStyle: "long" });
const validadeValue = ref<DateValue | undefined>(undefined);

const selectedClinic = useState<Clinic | null>("selectedClinic");

const loading = ref(false);
const saving = ref(false);

const form = ref({
  nome: "",
  descricao: "",
  quantidade_minima: 0,
  tipo_medida: "",
  fornecedor: "",
  clinica_id: null as number | null,
});

const medidas = [
  "Unidades",
  "Litros",
  "Mililitros",
  "Gramas",
  "Quilogramas",
  "Caixas",
  "Frascos",
  "Ampolas",
  "Comprimidos",
  "Tubos",
  "Pacotes",
  "Outros",
];

const isEdit = computed(() => !!props.itemId);

async function fetchItem(id: number) {
  loading.value = true;
  try {
    
    const token = useCookie("token").value;
    const res = await fetch(`${baseUrl}stock/item/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (!res.ok) throw new Error("Erro ao buscar item");
    const data = await res.json();
    form.value = { ...data };
  } catch (e) {
    toast({
      title: "Erro",
      description: "Erro ao buscar item.",
      variant: "destructive",
    });
  } finally {
    loading.value = false;
  }
}



watch(
  () => props.itemId,
  (id) => {
    if (id) fetchItem(id);
    else {
      form.value = {
        nome: "",
        descricao: "",
        quantidade_minima: 1,
        tipo_medida: "",
        fornecedor: "",
        clinica_id: null,
      };
    }
  },
  { immediate: true }
);

function close() {
  emit("close");
}

async function save() {
  saving.value = true;
  try {
    const token = useCookie("token").value;
    form.value.clinica_id = selectedClinic.value?.id ?? null;
    const url = props.itemId
      ? `${baseUrl}stock/items/${props.itemId}`
      : `${baseUrl}stock/items`;
    const method = props.itemId ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(form.value),
    });
    if (!res.ok) throw new Error("Erro ao guardar item");
    const data = await res.json();
    toast({
      title: "Sucesso",
      description: "Item guardado com sucesso.",
    });
    emit("saved", data);
    close();
  } catch (e) {
    toast({
      title: "Erro",
      description: "Erro ao guardar item.",
      variant: "destructive",
    });
  } finally {
    saving.value = false;
  }
}

</script>

<template>
  <Dialog :open="open" @update:open="(val) => !val && close()">
    <DialogContent class="max-w-lg w-full">
      <DialogHeader>
        <DialogTitle>{{ isEdit ? "Editar Item" : "Novo Item" }}</DialogTitle>
        <DialogDescription>
          {{
            isEdit
              ? "Atualize as informações do item"
              : "Adicione um novo item ao inventário"
          }}
        </DialogDescription>
      </DialogHeader>
      <div v-if="loading" class="py-8 text-center text-muted-foreground">
        A carregar...
      </div>
      <form v-else @submit.prevent="save" class="space-y-4">
        <div class="space-y-2">
          <Label for="item-name">Nome</Label>
          <Input
            id="item-name"
            v-model="form.nome"
            placeholder="Nome do item"
            required
            class="w-full"
          />
        </div>
        <div class="space-y-2">
          <Label for="item-description">Descrição</Label>
          <Textarea
            id="item-description"
            v-model="form.descricao"
            placeholder="Descrição detalhada"
            class="w-full"
          />
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="item-supplier">Fornecedor</Label>
            <Input
              id="item-supplier"
              v-model="form.fornecedor"
              placeholder="Nome do fornecedor"
              class="w-full"
            />
          </div>
          <div class="space-y-2">
            <Label for="item-min-quantity">Quantidade Mínima</Label>
            <NumberField v-model="form.quantidade_minima" :min="1" class="w-full">
              <NumberFieldContent>
                <NumberFieldDecrement />
                <NumberFieldInput id="item-min-quantity" class="w-full" />
                <NumberFieldIncrement />
              </NumberFieldContent>
            </NumberField>
          </div>
        </div>
        <div class="space-y-2">
          <Label for="item-medida">Unidade de Medida</Label>
          <Select v-model="form.tipo_medida">
            <SelectTrigger id="item-medida" class="w-full">
              <SelectValue placeholder="Selecionar unidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="medida in medidas"
                :key="medida"
                :value="medida"
              >
                {{ medida }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter class="gap-2">
          <Button
            variant="outline"
            type="button"
            @click="close"
            :disabled="saving"
          >Cancelar</Button>
          <Button type="submit" :loading="saving">Guardar</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
