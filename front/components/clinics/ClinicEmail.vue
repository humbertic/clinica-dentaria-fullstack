<script setup lang="ts">

import { useToast } from "@/components/ui/toast";

const { toast } = useToast();

const props = defineProps<{
  open: boolean;
  clinicId: number;
}>();
const emit = defineEmits<{
  (e: 'update:open', value: boolean): void;
  (e: 'save'): void;
}>();

const config = useRuntimeConfig();
const baseUrl = config.public.apiBase;

const loading = ref(false);
const emailConfig = ref<any>(null);

const sender = ref('');
const host = ref('');
const port = ref('');
const user = ref('');
const password = ref('');
const active = ref(false);

const isEdit = computed(() => !!emailConfig.value && !!emailConfig.value.id);

async function fetchEmailConfig() {
  if (!props.clinicId) return;
  loading.value = true;
  try {
    const token = useCookie('token').value;
    const res = await fetch(`${baseUrl}clinica/emails/${props.clinicId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (res.ok) {
      const dataArr = await res.json();
      const data = Array.isArray(dataArr) ? dataArr[0] : dataArr;
      emailConfig.value = data;
      sender.value = data?.remetente || '';
      host.value = data?.smtp_host || '';
      port.value = data?.smtp_porta?.toString() || '';
      user.value = data?.utilizador_smtp || '';
      password.value = '';
      active.value = !!data?.ativo;
    } else {
      emailConfig.value = null;
      sender.value = '';
      host.value = '';
      port.value = '';
      user.value = '';
      password.value = '';
      active.value = false;
    }
  } finally {
    loading.value = false;
  }
}

watch(() => props.open, (val) => {
  if (val) fetchEmailConfig();
});

async function save() {
  loading.value = true;
  try {
    const token = useCookie('token').value;
    let method = 'POST';
    let url = `${baseUrl}clinica/emails/`;
    if (isEdit.value) {
      method = 'PUT';
      url = `${baseUrl}clinica/emails/${emailConfig.value.id}`;
    }
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        remetente: sender.value,
        smtp_host: host.value,
        smtp_porta: Number(port.value),
        utilizador_smtp: user.value,
        password_smtp: password.value,
        ativo: active.value,
        clinica_id: props.clinicId,
      }),
    });
    if (!res.ok) {
      toast({
        title: 'Erro',
        description: 'Erro ao salvar configuração de e-mail.',
        variant: 'destructive',
      });
      return;
    }
    toast({
      title: 'Sucesso',
      description: isEdit.value
        ? 'Configuração de e-mail atualizada com sucesso.'
        : 'Configuração de e-mail criada com sucesso.',
    });
    emit('save');
    emit('update:open', false);
  } catch (e) {
    toast({
      title: 'Erro',
      description: e instanceof Error ? e.message : String(e),
      variant: 'destructive',
    });
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="w-full max-w-full sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>{{ isEdit ? 'Editar E-mail SMTP' : 'Novo E-mail SMTP' }}</DialogTitle>
        <DialogDescription>
          Configure as definições de e-mail SMTP para esta clínica
        </DialogDescription>
      </DialogHeader>
      <div class="grid gap-4 py-4" v-if="!loading">
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="smtp-sender" class="text-right">Remetente</Label>
          <div class="col-span-3">
            <Input id="smtp-sender" v-model="sender" placeholder="nome@exemplo.com" />
          </div>
        </div>
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="smtp-host" class="text-right">Host</Label>
          <div class="col-span-3">
            <Input id="smtp-host" v-model="host" placeholder="smtp.exemplo.com" />
          </div>
        </div>
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="smtp-port" class="text-right">Porta</Label>
          <div class="col-span-3">
            <Input id="smtp-port" v-model="port" placeholder="587" />
          </div>
        </div>
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="smtp-user" class="text-right">Utilizador</Label>
          <div class="col-span-3">
            <Input id="smtp-user" v-model="user" placeholder="utilizador@exemplo.com" />
          </div>
        </div>
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="smtp-password" class="text-right">Palavra-Passe</Label>
          <div class="col-span-3">
            <Input id="smtp-password" v-model="password" type="password" placeholder="••••••••" />
          </div>
        </div>
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="smtp-active" class="text-right">Ativo</Label>
          <div class="col-span-3 flex items-center space-x-2">
            <Switch id="smtp-active" v-model="active" />
            <Label for="smtp-active">Ativar configuração SMTP</Label>
          </div>
        </div>
      </div>
      <div v-else class="py-8 text-center text-muted-foreground">Carregando...</div>
      <DialogFooter >
        <Button variant="outline" @click="emit('update:open', false)">Cancelar</Button>
        <Button :disabled="loading" @click="save">{{ isEdit ? 'Guardar Alterações' : 'Guardar' }}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>