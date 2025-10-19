<script setup lang="ts">
import { useRoute } from "vue-router";
import { Minus, Plus, Save } from "lucide-vue-next";
import { useToast } from "@/components/ui/toast";

const router = useRouter();
const { toast } = useToast();
const originalConfigs = ref([]);
const config = useRuntimeConfig();
const baseUrl = config.public.apiBase;


const route = useRoute();
const clinicId = route.params.id;

const loading = ref(true);
const clinic = ref<any>(null);
const clinicConfigs = ref([]);

const showUnsavedDialog = ref(false);
const pendingGoBack = ref(false);

const token = useCookie("token").value;

function getConfigValue(key) {
  const found = clinicConfigs.value.find((c) => c.chave === key);
  return found ? found.valor : null;
}
function setConfigValue(key, value) {
  const found = clinicConfigs.value.find((c) => c.chave === key);
  if (found) found.valor = value;
}

async function fetchClinicAndConfigs() {
  loading.value = true;
  const clinicRes = await fetch(`${baseUrl}clinica/${clinicId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  clinic.value = await clinicRes.json();

  const configsRes = await fetch(
    `${baseUrl}clinica/configuracoes/${clinicId}`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }
  );
  const configs = await configsRes.json();
  clinicConfigs.value = configs.map((config) => ({
    ...config,
    valor: parseValor(config.valor),
  }));

  originalConfigs.value = configs.map((config) => ({
    ...config,
    valor: parseValor(config.valor),
  }));

  loading.value = false;
}

function parseValor(valor) {
  if (typeof valor === "boolean" || typeof valor === "number") return valor;
  if (valor === "true") return true;
  if (valor === "false") return false;
  if (typeof valor === "string" && !isNaN(Number(valor)) && valor.trim() !== "")
    return Number(valor);
  return valor;
}
function stringifyValor(valor) {
  return String(valor);
}

const tempoDuracaoToken = computed({
  get: () => getConfigValue("tempo_duracao_token"),
  set: (v) => setConfigValue("tempo_duracao_token", v),
});
const alertaDataVencimento = computed({
  get: () => getConfigValue("alerta_data_vencimento"),
  set: (v) => setConfigValue("alerta_data_vencimento", v),
});
const notificarEmailBaixoEstoque = computed({
  get: () => getConfigValue("notificar_email_baixo_estoque"),
  set: (v) => setConfigValue("notificar_email_baixo_estoque", v),
});
const notificarEmailVencimento = computed({
  get: () => getConfigValue("notificar_email_vencimento"),
  set: (v) => setConfigValue("notificar_email_vencimento", v),
});
const configuracaoTeste = computed({
  get: () => getConfigValue("configuracao_teste"),
  set: (v) => setConfigValue("configuracao_teste", v),
});

function incrementValue(setting) {
  if (setting === "tempoDuracaoToken") {
    tempoDuracaoToken.value++;
  } else if (setting === "alertaDataVencimento") {
    alertaDataVencimento.value++;
  }
}
function decrementValue(setting) {
  if (setting === "tempoDuracaoToken" && tempoDuracaoToken.value > 1) {
    tempoDuracaoToken.value--;
  } else if (
    setting === "alertaDataVencimento" &&
    alertaDataVencimento.value > 1
  ) {
    alertaDataVencimento.value--;
  }
}

async function saveSettings() {
  let hasError = false;
  for (const config of clinicConfigs.value) {
    const original = originalConfigs.value.find((c) => c.id === config.id);
    if (
      original &&
      stringifyValor(config.valor) !== stringifyValor(original.valor)
    ) {
      try {
        const res = await fetch(
          `${baseUrl}clinica/configuracoes/${config.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
              chave: config.chave,
              valor: stringifyValor(config.valor),
            }),
          }
        );
        if (!res.ok) throw new Error();
      } catch (e) {
        hasError = true;
      }
    }
  }
  if (hasError) {
    toast({
      title: "Erro",
      description: "Erro ao salvar configurações.",
      variant: "destructive",
    });
  } else {
    toast({
      title: "Sucesso",
      description: "Configurações salvas com sucesso.",
      variant: "default",
    });
    originalConfigs.value = clinicConfigs.value.map((config) => ({
      ...config,
      valor: parseValor(config.valor),
    }));
  }
}

function blockInvalidChar(e: KeyboardEvent) {
  // Block e, E, +, -, ., and all letters
  if (
    ["e", "E", "+", "-", "."].includes(e.key) ||
    (e.key.length === 1 && !/[0-9]/.test(e.key))
  ) {
    e.preventDefault();
  }
}

function hasUnsavedChanges() {
  return clinicConfigs.value.some(config => {
    const original = originalConfigs.value.find(c => c.id === config.id);
    return original && stringifyValor(config.valor) !== stringifyValor(original.valor);
  });
}

function goBackToClinic() {
  router.push(`/master/clinics/`);
}

function handleGoBack() {
  if (hasUnsavedChanges()) {
    showUnsavedDialog.value = true;
    pendingGoBack.value = true;
  } else {
    goBackToClinic();
  }
}

async function saveAndGoBack() {
  await saveSettings();
  goBackToClinic();
}

function discardAndGoBack() {
  goBackToClinic();
}


onMounted(fetchClinicAndConfigs);
</script>

<template>
  <div class="p-6 max-w-5xl mx-auto">
    <div class="mb-8">
      <h1 class="text-2xl font-bold tracking-tight mb-2">
        Definições Individuais
        <span
          v-if="clinic"
          class="ml-4 text-lg font-normal text-muted-foreground"
        >
          {{ clinic.nome }}
        </span>
      </h1>
      <p class="text-muted-foreground">
        Personalize as configurações desta clínica.
      </p>
    </div>

    <Card class="mb-6">
      <CardHeader>
        <CardTitle>Configurações de Tempo</CardTitle>
        <CardDescription
          >Defina os intervalos de tempo para notificações e
          tokens</CardDescription
        >
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="grid gap-6 sm:grid-cols-2">
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <Label for="tempo_duracao_token" class="text-sm font-medium">
                Duração do Token
              </Label>
              <span class="text-xs text-muted-foreground">minutos</span>
            </div>
            <div class="flex items-center">
              <Button
                variant="outline"
                size="icon"
                class="rounded-r-none h-10"
                @click="decrementValue('tempoDuracaoToken')"
              >
                <Minus class="h-4 w-4" />
              </Button>
              <Input
                id="tempo_duracao_token"
                v-model="tempoDuracaoToken"
                type="number"
                min="1"
                class="rounded-none text-center h-10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                @keydown="blockInvalidChar"
              />
              <Button
                variant="outline"
                size="icon"
                class="rounded-l-none h-10"
                @click="incrementValue('tempoDuracaoToken')"
              >
                <Plus class="h-4 w-4" />
              </Button>
            </div>
            <p class="text-xs text-muted-foreground">
              Tempo de validade do token de acesso
            </p>
          </div>
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <Label for="alerta_data_vencimento" class="text-sm font-medium">
                Alerta de Vencimento
              </Label>
              <span class="text-xs text-muted-foreground">dias</span>
            </div>
            <div class="flex items-center">
              <Button
                variant="outline"
                size="icon"
                class="rounded-r-none h-10"
                @click="decrementValue('alertaDataVencimento')"
              >
                <Minus class="h-4 w-4" />
              </Button>
              <Input
                id="alerta_data_vencimento"
                v-model="alertaDataVencimento"
                type="number"
                class="rounded-none text-center h-10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <Button
                variant="outline"
                size="icon"
                class="rounded-l-none h-10"
                @click="incrementValue('alertaDataVencimento')"
              >
                <Plus class="h-4 w-4" />
              </Button>
            </div>
            <p class="text-xs text-muted-foreground">
              Dias antes do vencimento para enviar alertas
            </p>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card class="mb-6">
      <CardHeader>
        <CardTitle>Notificações por Email</CardTitle>
        <CardDescription
          >Configure quais notificações serão enviadas
          automaticamente</CardDescription
        >
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div class="space-y-0.5">
              <Label for="notificar_email_baixo_estoque" class="text-base">
                Notificar Baixo Estoque
              </Label>
              <p class="text-sm text-muted-foreground">
                Enviar email quando produtos atingirem o estoque mínimo
              </p>
            </div>
            <Switch
              id="notificar_email_baixo_estoque"
              v-model="notificarEmailBaixoEstoque"
            />
          </div>
          <Separator />
          <div class="flex items-center justify-between">
            <div class="space-y-0.5">
              <Label for="notificar_email_vencimento" class="text-base">
                Notificar Vencimento
              </Label>
              <p class="text-sm text-muted-foreground">
                Enviar email quando produtos estiverem próximos do vencimento
              </p>
            </div>
            <Switch
              id="notificar_email_vencimento"
              v-model="notificarEmailVencimento"
            />
          </div>
        </div>
      </CardContent>
    </Card>

    <Card class="mb-8">
      <CardHeader>
        <CardTitle>Configurações Avançadas</CardTitle>
        <CardDescription
          >Opções adicionais para personalização da clínica</CardDescription
        >
      </CardHeader>
      <CardContent>
        <div class="flex items-center justify-between">
          <div class="space-y-0.5">
            <Label for="configuracao_teste" class="text-base">
              Modo de Teste
            </Label>
            <p class="text-sm text-muted-foreground">
              Ativar ambiente de testes para esta clínica
            </p>
          </div>
          <Switch id="configuracao_teste" v-model="configuracaoTeste" />
        </div>
      </CardContent>
    </Card>

    <div class="flex justify-end gap-4">
      <NuxtLink
      to="#"
      @click.prevent="handleGoBack"
      class="text-muted-foreground text-sm underline hover:text-primary flex items-center"
    >
      ← Voltar para clínica
    </NuxtLink>
      <Button @click="saveSettings">
        <Save class="mr-2 h-4 w-4" />
        Guardar Alterações
      </Button>
    </div>
    <AlertDialog v-model:open="showUnsavedDialog">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
        <AlertDialogDescription>
          Existem alterações não salvas. Deseja sair sem salvar ou salvar antes de sair?
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel @click="showUnsavedDialog = false">
          Cancelar
        </AlertDialogCancel>
        <AlertDialogAction @click="discardAndGoBack">
          Sair sem salvar
        </AlertDialogAction>
        <AlertDialogAction @click="saveAndGoBack">
          Salvar e sair
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
  </div>
</template>
