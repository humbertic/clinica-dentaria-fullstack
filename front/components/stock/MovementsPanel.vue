<script setup lang="ts">
import { useToast } from "@/components/ui/toast";
import {
  FileBarChart2,
  ArrowDownCircle,
  ArrowUpCircle,
  RefreshCcw,
} from "lucide-vue-next";

const props = defineProps<{
  itemId: number | null;
}>();

const { toast } = useToast();
const config = useRuntimeConfig();
const baseUrl = config.public.apiBase;

const item = ref<any>(null);
const movements = ref<any[]>([]);
const loading = ref(false);

const sortOrder = ref<"desc" | "asc">("desc");
const filterTipo = ref<
  "all" | "entrada" | "saida" | "ajuste" | "transferencia"
>("all");

async function fetchItemAndMovements(id: number) {
  loading.value = true;
  try {
    const token = useCookie("token").value;
    // Fetch item
    const itemRes = await fetch(`${baseUrl}stock/item/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (!itemRes.ok) throw new Error("Erro ao buscar item");
    item.value = await itemRes.json();

    // Fetch movements
    const movRes = await fetch(`${baseUrl}stock/movimentos/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (!movRes.ok) throw new Error("Erro ao buscar movimentos");
    movements.value = await movRes.json();
  } catch (e) {
    item.value = null;
    movements.value = [];
    toast({
      title: "Erro",
      description: e instanceof Error ? e.message : String(e),
      variant: "destructive",
    });
  } finally {
    loading.value = false;
  }
}

const filteredMovements = computed(() => {
  let result = [...movements.value];
  if (filterTipo.value !== "all") {
    result = result.filter((m) => m.tipo_movimento === filterTipo.value);
  }
  result.sort((a, b) => {
    const da = a.data ? new Date(a.data).getTime() : 0;
    const db = b.data ? new Date(b.data).getTime() : 0;
    return sortOrder.value === "desc" ? db - da : da - db;
  });
  return result;
});
watch(
  () => props.itemId,
  (id) => {
    if (id) fetchItemAndMovements(id);
    else {
      item.value = null;
      movements.value = [];
    }
  },
  { immediate: true }
);
</script>

<template>
  <Card class="shadow-md">
    <CardHeader>
      <CardTitle>Movimentos</CardTitle>
      <CardDescription>
        Histórico de transações
        <span v-if="item"
          >do item: <b>{{ item.nome }}</b></span
        >
      </CardDescription>
    </CardHeader>
    <CardContent class="p-4 space-y-3">
      <div class="flex flex-wrap gap-x-2 gap-y-2 mb-2 items-center">
        <Label class="text-xs">Ordenar:</Label>
        <Select
          v-model="sortOrder"
          class="min-w-0 max-w-full w-full sm:w-[130px]"
        >
          <SelectTrigger>
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Ordem</SelectLabel>
              <SelectItem value="desc"> Mais recentes </SelectItem>
              <SelectItem value="asc"> Mais antigos </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Label class="text-xs ml-0 sm:ml-4">Filtrar:</Label>

        <Select
          v-model="filterTipo"
          class="min-w-0 max-w-full w-full sm:w-[130px]"
        >
          <SelectTrigger>
            <SelectValue placeholder="Tipo de movimento" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Tipo</SelectLabel>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="entrada">Entrada</SelectItem>
              <SelectItem value="saida">Saída</SelectItem>
              <SelectItem value="ajuste">Ajuste</SelectItem>
              <SelectItem value="transferencia">Transferência</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div v-if="loading" class="text-center py-8 text-muted-foreground">
        A carregar...
      </div>

      <div v-else-if="!item" class="text-center py-8">
        <FileBarChart2
          class="h-12 w-12 mx-auto mb-2 text-muted-foreground opacity-50"
        />
        <p class="text-sm text-muted-foreground">
          Selecione um item para ver seus movimentos
        </p>
      </div>
      <div v-else>
        <ScrollArea class="h-96 pr-2">
          <div>
            <template v-if="filteredMovements.length">
              <div
                v-for="(mov, idx) in filteredMovements"
                :key="mov.id"
                class="flex flex-col gap-1 pb-3"
              >
                <div class="flex items-center gap-3">
                  <span
                    :class="[
                      'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1',
                      mov.tipo_movimento === 'entrada'
                        ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 ring-green-600/20'
                        : mov.tipo_movimento === 'saida'
                        ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 ring-red-600/20'
                        : mov.tipo_movimento === 'transferencia'
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 ring-blue-600/20'
                        : 'bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400 ring-gray-600/20',
                    ]"
                  >
                    <component
                      :is="
                        mov.tipo_movimento === 'entrada'
                          ? ArrowDownCircle
                          : mov.tipo_movimento === 'saida'
                          ? ArrowUpCircle
                          : mov.tipo_movimento === 'transferencia'
                          ? RefreshCcw
                          : RefreshCcw
                      "
                      class="w-4 h-4 mr-1"
                    />
                    {{
                      mov.tipo_movimento.charAt(0).toUpperCase() +
                      mov.tipo_movimento.slice(1)
                    }}
                  </span>
                  <span class="text-xs text-muted-foreground ml-auto">
                    {{
                      mov.data
                        ? new Date(mov.data).toLocaleDateString("pt-PT")
                        : "Sem data"
                    }}
                  </span>
                </div>
                <div class="flex justify-between items-center text-sm">
                  <span class="font-medium">Quantidade:</span>
                  <span
                    :class="
                      mov.tipo_movimento === 'saida'
                        ? 'text-red-600'
                        : mov.tipo_movimento === 'transferencia'
                        ? 'text-blue-600'
                        : 'text-green-600'
                    "
                  >
                    {{ mov.tipo_movimento === "saida" ? "-" : "+"
                    }}{{ mov.quantidade }}
                  </span>
                </div>
                <div class="text-xs text-muted-foreground italic">
                  {{ mov.justificacao || mov.descricao || "" }}
                </div>
                <div class="text-xs text-muted-foreground">
                  <span v-if="mov.utilizador && mov.utilizador.nome">
                    Por: <b>{{ mov.utilizador.nome }}</b>
                  </span>
                </div>
                <Separator
                  v-if="idx < filteredMovements.length - 1"
                  class="my-2"
                />
              </div>
            </template>
            <div v-else class="text-center text-muted-foreground py-4">
              Nenhum movimento encontrado para este item.
            </div>
          </div>
        </ScrollArea>
      </div>
    </CardContent>
  </Card>
</template>
