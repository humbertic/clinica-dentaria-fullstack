<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useToast } from "@/components/ui/toast";

const { toast } = useToast();

type ClinicFormModel = {
  id?: number;
  nome: string;
  email_envio: string;
  morada: string;
  partilha_dados: boolean;
  parent_id: number | null;
};

const props = defineProps<{
  id?: number; 
  clinic?: ClinicFormModel | null; 
  clinics?: { id: number; nome: string }[];
}>();

const clinicsList = computed(() => props.clinics ?? []);

const emit = defineEmits<{
  (e: "save", clinic: any): void;
  (e: "cancel"): void;
}>();

const form = ref<ClinicFormModel>({
  nome: "",
  email_envio: "",
  morada: "",
  partilha_dados: false,
  parent_id: null,
});

const loading = ref(false);
const saving = ref(false);
const config = useRuntimeConfig();
const baseUrl = config.public.apiBase;

async function fetchClinicById(id: number) {
  loading.value = true;
  try {
    const token = useCookie("token").value;
    const res = await fetch(`${baseUrl}clinica/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (!res.ok) throw new Error("Erro ao buscar clínica");
    const data = await res.json();
    form.value = {
      id: data.id,
      nome: data.nome,
      email_envio: data.email_envio,
      morada: data.morada ?? "",
      partilha_dados: data.partilha_dados ?? false,
      parent_id: data.clinica_pai_id ?? null,
    };
  } catch (e) {
    toast({
      title: "Erro",
      description: "Erro ao buscar clínica.",
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
    email_envio: form.value.email_envio,
    morada: form.value.morada,
    clinica_pai_id: form.value.parent_id,
    partilha_dados: form.value.partilha_dados,
  };

  try {
    let res;
    if (props.id) {
     
      res = await fetch(`${baseUrl}clinica/${props.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
    } else {
      
      res = await fetch(`${baseUrl}clinica`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
    }
    if (!res.ok) throw new Error("Erro ao salvar clínica");
    const data = await res.json();
    toast({
      title: "Sucesso",
      description: "Clínica salva com sucesso.",
    });
    emit("save", data); 
  } catch (e) {
    toast({
      title: "Erro",
      description: "Erro ao salvar clínica.",
      variant: "destructive",
    });
  } finally {
    saving.value = false;
  }
}

watch(
  () => [props.id, props.clinic],
  ([id, clinic]) => {
    if (typeof id === "number") {
      fetchClinicById(id);
    } else if (clinic && typeof clinic === "object") {
      form.value = { ...clinic };
    } else {
      form.value = {
        nome: "",
        email_envio: "",
        morada: "",
        partilha_dados: false,
        parent_id: null,
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
    Carregando dados da clínica...
  </div>
  <form
     v-else-if="!props.clinic?.id || form.nome"
    @submit.prevent="onSave"
    class="grid gap-4 py-4"
  >
    <div class="grid grid-cols-4 items-center gap-4">
      <Label for="name" class="text-right">Nome</Label>
      <div class="col-span-3">
        <Input id="name" v-model="form.nome" placeholder="Nome da clínica" />
      </div>
    </div>
    <div class="grid grid-cols-4 items-center gap-4">
      <Label for="email" class="text-right">Email de Envio</Label>
      <div class="col-span-3">
        <Input
          id="email"
          v-model="form.email_envio"
          type="email"
          placeholder="email@clinica.com"
        />
      </div>
    </div>
    <div class="grid grid-cols-4 items-center gap-4">
      <Label for="morada" class="text-right">Morada</Label>
      <div class="col-span-3">
       
        <Textarea
          id="morada"
          v-model="form.morada"
          placeholder="Morada completa da clínica"
        />
      </div>
    </div>
    <div class="grid grid-cols-4 items-center gap-4">
      <Label for="parent-clinic" class="text-right">Clínica-Pai</Label>
      <div class="col-span-3">
        <Select v-model="form.parent_id">
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma clínica-pai (opcional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem :value="null">Nenhuma (clínica principal)</SelectItem>
            <SelectItem
              v-for="c in clinicsList"
              :key="c.id"
              :value="c.id"
              v-if="!props.clinic || c.id !== props.clinic?.id"
            >
              {{ c.nome }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
    <div class="grid grid-cols-4 items-center gap-4">
      <Label for="partilha_dados" class="text-right">Partilha de Dados</Label>
      <div class="col-span-3 flex items-center space-x-2">
        <Switch id="partilha_dados" v-model="form.partilha_dados" />
        <Label for="partilha_dados">Ativar partilha de dados</Label>
      </div>
    </div>
    <DialogFooter>
      <Button variant="outline" type="button" @click="onCancel"
        >Cancelar</Button
      >
      <Button type="submit">Guardar</Button>
    </DialogFooter>
  </form>
  <div v-else class="py-8 text-center text-muted-foreground">
    Dados da clínica não disponíveis.
  </div>
</template>
