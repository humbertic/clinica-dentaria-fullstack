<script setup lang="ts">
import { useToast } from "@/components/ui/toast";

const props = defineProps<{ open: boolean }>();
const emit = defineEmits(["update:open"]);

const user = ref<any>(null);
const nome = ref("");
const telefone = ref("");
const currentPassword = ref("");
const newPassword = ref("");
const loading = ref(false);
const error = ref("");
const passwordError = ref("");
const activeTab = ref("account");
const { toast } = useToast();

const config = useRuntimeConfig();
const baseUrl = config.public.apiBase;

onMounted(async () => {
  const token = useCookie("token").value;
  if (token) {
    const { data } = await useFetch<any>(`${baseUrl}utilizadores/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (data.value) {
      user.value = data.value;
      nome.value = data.value.nome || "";
      telefone.value = data.value.telefone || "";
    }
  }
});

async function onSubmitAccount() {
  loading.value = true;
  error.value = "";
  try {
    const token = useCookie("token").value;
    await $fetch(`${baseUrl}utilizadores/me`, {
      method: "PUT",
      body: { nome: nome.value, telefone: telefone.value },
      headers: { Authorization: `Bearer ${token}` },
    });
    toast({
      title: "Perfil atualizado!",
      description: "Seus dados foram salvos com sucesso.",
    });
    emit("update:open", false);
  } catch (err: any) {
    error.value =
      err?.data?.detail ||
      err?.message ||
      "Erro ao atualizar perfil";
  } finally {
    loading.value = false;
  }
}

async function onSubmitPassword() {
  loading.value = true;
  passwordError.value = "";
  try {
    const token = useCookie("token").value;
    await $fetch(`${baseUrl}utilizadores/me/alterar-senha`, {
      method: "POST",
      body: {
        senha_atual: currentPassword.value,
        nova_senha: newPassword.value,
      },
      headers: { Authorization: `Bearer ${token}` },
    });
    toast({
      title: "Senha alterada!",
      description: "Sua senha foi atualizada com sucesso.",
    });
    emit("update:open", false);
  } catch (err: any) {
    passwordError.value =
      err?.data?.detail ||
      err?.message ||
      "Erro ao atualizar senha";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <Dialog :open="props.open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>
          <!-- Example: Show user's name if loaded -->
          Editar Perfil<span v-if="user">: {{ user.nome }}</span>
        </DialogTitle>
        <DialogDescription>
          <!-- Example: Change description based on active tab -->
          <span v-if="activeTab === 'account'">
            Só é possível editar o nome e telefone. Os outros dados são apenas leitura.
          </span>
          <span v-else>
            Altere sua senha. Após salvar, você será desconectado.
          </span>
        </DialogDescription>
      </DialogHeader>
      <div v-if="user">
        <Tabs v-model="activeTab" class="w-full">
          <TabsList class="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="account">Conta</TabsTrigger>
            <TabsTrigger value="password">Senha</TabsTrigger>
          </TabsList>
          <TabsContent value="account">
            <UsersAccountTab
              :user="user"
              v-model:nome="nome"
              v-model:telefone="telefone"
              :error="error"
              :loading="loading"
              :onSubmitAccount="onSubmitAccount"
            />
          </TabsContent>
          <TabsContent value="password">
            <UsersPasswordTab
              v-model:currentPassword="currentPassword"
              v-model:newPassword="newPassword"
              :passwordError="passwordError"
              :loading="loading"
              :onSubmitPassword="onSubmitPassword"
            />
          </TabsContent>
        </Tabs>
      </div>
      <div v-else class="p-4 text-center text-muted-foreground">
        Carregando perfil...
      </div>
    </DialogContent>
  </Dialog>
</template>