<script setup lang="ts">
import { ref, watch } from "vue";
import { useToast } from "@/components/ui/toast";
import DatePicker from "../ui/date-picker/DatePicker.vue";
import { type DateValue, parseDate } from "@internationalized/date";

const props = defineProps<{
  open: boolean;
  items: { id: number; nome: string }[];
  defaultItemId?: number | null;
  defaultTipo?: string;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "saved"): void;
}>();

type Clinic = {
  id: number;
  nome: string;
  morada?: string;
  email_envio?: string;
};

const selectedClinic = useState<Clinic | null>("selectedClinic");
const config = useRuntimeConfig();
const baseUrl = config.public.apiBase;
const { toast } = useToast();
const show = ref(props.open);
const selectedItemId = ref<number | null>(props.defaultItemId ?? null);
const tipo = ref("");
const quantidade = ref<number | null | undefined>(undefined);
const justificacao = ref("");
const user = useState<{ id: number } | null>("user");
const lote = ref("");
const validade = ref<any>(undefined);
const destino_id = ref<number | null>(null);
const clinics = ref<{ id: number; nome: string }[]>([]);

const filteredClinics = computed(() =>
  clinics.value.filter(
    (c) => !selectedClinic.value || c.id !== selectedClinic.value.id
  )
);

watch(
  () => props.defaultTipo,
  (val) => {
    if (val !== undefined && val !== null) {
      tipo.value = val;
    }
  },
  { immediate: true }
);

watch(
  () => props.defaultItemId,
  (val) => {
    if (val !== undefined && val !== null) {
      selectedItemId.value = val;
    }
  },
  { immediate: true }
);

watch(
  () => props.open,
  (val) => (show.value = val)
);

watch(
  () => show.value,
  (val) => {
    if (!val) emit("close");
  }
);

watch([selectedItemId, tipo], async ([itemId, tipoValue]) => {
  if (tipoValue === "transferencia" && itemId) {
    clinics.value = (await fetchClinis()) || [];
  }
});

function resetForm() {
  selectedItemId.value = props.defaultItemId ?? null;
  tipo.value = "";
  quantidade.value = undefined;
  justificacao.value = "";
  lote.value = "";
  validade.value = undefined;
  destino_id.value = null;
}

async function fetchClinis() {
  const token = useCookie("token").value;
  try {
    const res = await fetch(`${baseUrl}clinica`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (!res.ok) throw new Error("Erro ao buscar clínicas");
    return await res.json();
  } catch (e) {
    toast({
      title: "Erro ao buscar clínicas",
      description: e instanceof Error ? e.message : String(e),
      variant: "destructive",
    });
  }
}

async function save() {
  const utilizador_id = user.value?.id;
  if (!utilizador_id) {
    useToast().toast({
      title: "Erro",
      description: "Utilizador não autenticado.",
      variant: "destructive",
    });
    return;
  }

  try {
    const token = useCookie("token").value;
    const payload: any = {
      item_id: selectedItemId.value,
      tipo_movimento: tipo.value,
      quantidade: Number(quantidade.value),
      justificacao: justificacao.value,
      utilizador_id,
    };
    // Only add lote/validade if tipo is entrada
    if (tipo.value === "entrada") {
      payload.lote = lote.value;
      payload.validade = validade.value
        ? validade.value.toString() // or format as needed
        : "";
    } else if (tipo.value === "transferencia") {
      payload.destino_id = destino_id.value;
    }

    const res = await fetch(
      `${useRuntimeConfig().public.apiBase}stock/movimentos`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) throw new Error("Erro ao registar movimento");

    emit("saved");
    show.value = false;
    resetForm();
  } catch (e) {
    useToast().toast({
      title: "Erro",
      description: e instanceof Error ? e.message : String(e),
      variant: "destructive",
    });
  }
}
</script>

<template>
  <Dialog v-model:open="show">
    <DialogContent class="max-w-md w-full">
      <DialogHeader>
        <DialogTitle>Novo Movimento</DialogTitle>
        <DialogDescription>
          Registe uma entrada, saída ou ajuste de stock
        </DialogDescription>
      </DialogHeader>
      <div class="space-y-4">
        <div class="space-y-2">
          <Label for="movement-item">Item</Label>
          <Select v-model="selectedItemId">
            <SelectTrigger id="movement-item">
              <SelectValue placeholder="Selecionar Item" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="item in items" :key="item.id" :value="item.id">
                {{ item.nome }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="movement-type">Tipo de Movimento</Label>
            <Select v-model="tipo">
              <SelectTrigger id="movement-type">
                <SelectValue placeholder="Tipo de Movimento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entrada">Entrada</SelectItem>
                <SelectItem value="saida">Saída</SelectItem>
                <SelectItem value="ajuste">Ajuste</SelectItem>
                <SelectItem value="transferencia">Transferência</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-2">
            <Label for="movement-quantity">Quantidade</Label>
            <NumberField
              id="movement-quantity"
              v-model="quantidade"
              :min="1"
              :default-value="1"
            >
              <NumberFieldContent>
                <NumberFieldDecrement />
                <NumberFieldInput />
                <NumberFieldIncrement />
              </NumberFieldContent>
            </NumberField>
          </div>
        </div>
        <!-- Show lote and validade only for entrada -->
        <div
          v-if="tipo === 'entrada'"
          class="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <div class="space-y-2">
            <Label for="movement-lote">Lote</Label>
            <Input
              id="movement-lote"
              v-model="lote"
              placeholder="Código do lote"
              required
              class="w-full"
            />
          </div>
          <div class="space-y-2">
            <Label for="movement-validade">Validade</Label>
            <!-- For pass date -->
            <!-- <DatePicker
              :maxValue="parseDate(new Date().toISOString().slice(0, 10))"
              v-model="validade"
            /> -->
            <DatePicker
              v-model="validade"
              :minValue="parseDate(new Date().toISOString().slice(0, 10))"
              yearSort="asc"
            />
          </div>
        </div>
        <div v-else-if="tipo === 'transferencia'" class="space-y-2">
          <Label for="movement-clinica">Clínica de destino</Label>
          <Select v-model="destino_id">
            <SelectTrigger id="movement-clinica">
              <SelectValue placeholder="Selecionar clínica" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="clinica in filteredClinics"
                :key="clinica.id"
                :value="clinica.id"
              >
                {{ clinica.nome }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-2">
          <Label for="movement-reason">Justificação</Label>
          <Textarea
            id="movement-reason"
            placeholder="Motivo do movimento"
            v-model="justificacao"
          />
        </div>
      </div>
      <DialogFooter class="gap-2">
        <Button variant="outline" type="button" @click="show = false">
          Cancelar
        </Button>
        <Button type="button" @click="save">Registar</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
