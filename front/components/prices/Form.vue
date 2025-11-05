<script setup lang="ts">
import { ref, watch, computed } from "vue";
import type { Entidade } from "@/types/prices";
import type { PriceFormModel } from "@/types/prices";
import { ChevronDown } from "lucide-vue-next";
import { useToast } from "@/components/ui/toast";

const props = defineProps<{
  modelValue: PriceFormModel;
  artigoDescricao?: string;
  entidades?: Entidade[];
  disabledFields?: string[];
  isEditing?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: PriceFormModel): void;
  (e: "save", value: PriceFormModel): void;
  (e: "cancel"): void;
}>();

const form = ref<PriceFormModel>({ ...props.modelValue });

const { toast } = useToast();
const config = useRuntimeConfig();
const baseUrl = config.public.apiBase;

// Encontre o nome da entidade selecionada
const entidadeNome = computed(() => {
  if (form.value.entidade?.nome) {
    return form.value.entidade.nome;
  }
  if (props.entidades) {
    return (
      props.entidades.find((e) => e.id === form.value.entidade_id)?.nome ||
      `Entidade ${form.value.entidade_id}`
    );
  }
  return `Entidade ${form.value.entidade_id}`;
});

watch(
  () => props.modelValue,
  (val) => {
    form.value = {
      ...val,
      artigo: val.artigo
        ? {
            id: val.artigo.id,
            descricao: val.artigo.descricao,
          }
        : undefined,
      entidade: val.entidade
        ? {
            id: val.entidade.id,
            nome: val.entidade.nome,
          }
        : undefined,
    };
  },
  { immediate: true }
);

async function onSave() {
  await savePrice();
}

async function savePrice() {
  if (!form.value.artigo?.id || !form.value.entidade_id) {
    toast({
      title: "Erro",
      description: "Dados incompletos para salvar o preço.",
      variant: "destructive",
    });
    return;
  }

  const saving = ref(true);
  const token = useCookie("token").value;

  try {
    let url;
    let method;
    let payload: any;

    if (props.isEditing) {
      url = `${baseUrl}precos/${form.value.artigo.id}/${form.value.entidade_id}`;
      method = "PUT";
      payload = {
        valor_entidade: Number(form.value.valor_entidade),
        valor_paciente: Number(form.value.valor_paciente),
      };
    } else {
      url = `${baseUrl}precos`;
      method = "POST";
      payload = {
        valor_entidade: Number(form.value.valor_entidade),
        valor_paciente: Number(form.value.valor_paciente),
        artigo_id: form.value.artigo.id,
        entidade_id: form.value.entidade_id,
      };
    }
    const res = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    toast({
      title: "Sucesso",
      description: `Preço ${
        props.isEditing ? "atualizado" : "criado"
      } com sucesso.`,
    });

    emit("save", { ...form.value });
  } catch (e) {
    toast({
      title: "Erro",
      description: e instanceof Error ? e.message : "Erro ao salvar preço.",
      variant: "destructive",
    });
    console.error(e);
  } finally {
    saving.value = false;
  }
}
function onCancel() {
  emit("cancel");
}
</script>

<template>
  <form @submit.prevent="onSave" class="space-y-4 py-4">
    <!-- Artigo (Read-only) -->
    <div class="grid grid-cols-4 items-center gap-4">
      <FormField name="artigo">
        <FormLabel class="text-right">Artigo</FormLabel>
        <div class="col-span-3">
          <Card class="bg-muted/30">
            <CardContent class="p-2">
              <p>
                {{
                  form.artigo?.descricao || artigoDescricao || "Sem descrição"
                }}
              </p>
            </CardContent>
          </Card>
        </div>
      </FormField>
    </div>

    <!-- Entidade (Dropdown) -->
    <div class="grid grid-cols-4 items-center gap-4">
      <FormField name="entidade">
        <FormLabel class="text-right">Entidade</FormLabel>
        <div class="col-span-3">
          <Select
            v-if="entidades?.length"
            v-model="form.entidade_id"
            @update:modelValue="
              (val) =>
                emit('update:modelValue', { ...form, entidade_id: Number(val) })
            "
          >
            <SelectTrigger class="w-full">
              {{ entidadeNome }}
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="entidade in entidades"
                :key="entidade.id"
                :value="entidade.id"
              >
                {{ entidade.nome }}
              </SelectItem>
            </SelectContent>
          </Select>
          <Input v-else :value="entidadeNome" disabled class="w-full" />
        </div>
      </FormField>
    </div>

    <!-- Valor Entidade -->
    <div class="grid grid-cols-4 items-center gap-4">
      <FormField name="valor_entidade">
        <FormLabel for="valor_entidade" class="text-right">Entidade</FormLabel>
        <div class="col-span-3">
          <Input
            id="valor_entidade"
            v-model.number="form.valor_entidade"
            type="number"
            step="0.01"
            min="0"
            :disabled="disabledFields?.includes('valor_entidade')"
            @input="
              emit('update:modelValue', {
                ...form,
                valor_entidade: Number(form.valor_entidade),
              })
            "
            class="w-full"
          />
        </div>
      </FormField>
    </div>

    <!-- Valor Paciente -->
    <div class="grid grid-cols-4 items-center gap-4">
      <FormField name="valor_paciente">
        <FormLabel for="valor_paciente" class="text-right">Paciente</FormLabel>
        <div class="col-span-3">
          <Input
            id="valor_paciente"
            v-model.number="form.valor_paciente"
            type="number"
            step="0.01"
            min="0"
            :disabled="disabledFields?.includes('valor_paciente')"
            @input="
              emit('update:modelValue', {
                ...form,
                valor_paciente: Number(form.valor_paciente),
              })
            "
            class="w-full"
          />
        </div>
      </FormField>
    </div>

    <!-- Botões -->
    <DialogFooter>
      <Button variant="outline" type="button" @click="onCancel">
        Cancelar
      </Button>
      <Button type="submit"> Guardar </Button>
    </DialogFooter>
  </form>
</template>
