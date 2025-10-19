<script setup lang="ts">
import { AlertCircle } from "lucide-vue-next";
type LoginResponse = {
  access_token: string;
  expires_in: number;
};
type UserResponse = { perfil: { perfil: string } | null };

const config = useRuntimeConfig();
const baseUrl = config.public.apiBase;
const userState = useState<UserResponse | null>("user", () => null);

const email = ref("");
const password = ref("");
const loading = ref(false);
const error = ref("");

const onSubmit = async (e: Event) => {
  e.preventDefault();
  loading.value = true;
  error.value = "";
  try {
    const form = new URLSearchParams();
    form.append("username", email.value);
    form.append("password", password.value);

    const { data, error: fetchError } = await useFetch<LoginResponse>(
      `${baseUrl}utilizadores/login`,
      {
        method: "POST",
        body: form,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        onResponseError({ response }) {
          error.value = response._data?.detail || "Erro ao fazer login";
        },
      }
    );
    if (fetchError.value) return;

    const token = data.value?.access_token;
    const expiresIn = data.value?.expires_in || 3600;

    const expiresInCookie = useCookie("expiresIn");
    expiresInCookie.value = expiresIn.toString();

    // Calculate and store expiration timestamp
    const now = Date.now();
    const expiresAt = now + expiresIn * 1000;
    const tokenExpiresAtCookie = useCookie("tokenExpiresAt");
    tokenExpiresAtCookie.value = expiresAt.toString();

    console.log(
      `Token will expire at: ${new Date(expiresAt).toLocaleTimeString()}`
    );
    if (token) {
      const tokenCookie = useCookie("token");
      tokenCookie.value = token;
      const { data: user } = await useFetch<UserResponse>(
        `${baseUrl}utilizadores/me`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      userState.value = user.value;

      if (token) {
        useCookie("token").value = token;
        return navigateTo("/?refresh=true");
      }
    } else {
      error.value = "Credenciais inválidas";
    }
  } catch (err: any) {
    error.value = err.message || "Erro ao fazer login";
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <Card class="mx-auto max-w-sm">
    <form @submit="onSubmit">
      <CardHeader>
        <CardTitle class="text-2xl">Iniciar Sessão</CardTitle>
        <CardDescription>
          Introduza o seu email para aceder à sua conta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="grid gap-4">
          <div class="grid gap-2">
            <Label for="email">Email</Label>
            <Input
              id="email"
              v-model="email"
              type="email"
              placeholder="exemplo@email.com"
              required
            />
          </div>
          <div class="grid gap-2">
            <div class="flex items-center">
              <Label for="password">Palavra-passe</Label>
              <a href="#" class="ml-auto inline-block text-sm underline">
                Esqueceu-se da palavra-passe?
              </a>
            </div>
            <Input id="password" v-model="password" type="password" required />
          </div>
          <Button type="submit" class="w-full" :disabled="loading">
            {{ loading ? "A entrar..." : "Entrar" }}
          </Button>
        </div>
        <div v-if="error" class="mt-4">
          <Alert variant="destructive">
            <AlertCircle class="w-4 h-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>
              {{ error }}
            </AlertDescription>
          </Alert>
        </div>
        <!-- <div class="mt-4 text-center text-sm">
          Não tem conta?
          <NuxtLink to="/register" class="underline">Registar-se</NuxtLink>
        </div> -->
      </CardContent>
    </form>
  </Card>
</template>