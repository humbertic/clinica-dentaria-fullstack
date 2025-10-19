<script setup lang="ts">
import { AlertCircle } from 'lucide-vue-next'
const emit = defineEmits<{
  (e: 'created', user: any): void
  (e: 'cancel'): void
}>()


const form = reactive({
  username: '',
  nome:     '',
  email:    '',
  telefone: '',
  password: '',
})

const loading = ref(false)
const error   = ref('')
const config = useRuntimeConfig();
const baseUrl = config.public.apiBase;


async function handleSubmit() {
  loading.value = true
  error.value   = ''

  try {
    const token = useCookie("token").value
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const data = await $fetch(`${baseUrl}utilizadores`, {
      method: 'POST',
      body: { ...form },
      headers,
    })

    emit('created', data)
    resetForm()
  } catch (e: any) {
    error.value =
      e?.data?.detail ??
      e?.message ??
      'Erro ao criar utilizador'
  } finally {
    loading.value = false
  }
}

function handleCancel() {
  emit('cancel')
}

function resetForm() {
  Object.assign(form, { username: '', nome: '', email: '', telefone: '', password: '' })
}
</script>

<template>
  <div>
    <div class="mb-4">
      <h2 class="text-lg font-semibold">Novo Utilizador</h2>
      <p class="text-muted-foreground text-sm">
        Preencha os dados para criar um novo utilizador
      </p>
    </div>

    <div class="grid gap-4 py-2">
      <div class="grid grid-cols-4 items-center gap-4">
        <Label for="username" class="text-right">Username</Label>
        <Input id="username" v-model="form.username" class="col-span-3" required />
      </div>

      <div class="grid grid-cols-4 items-center gap-4">
        <Label for="nome" class="text-right">Nome</Label>
        <Input id="nome" v-model="form.nome" class="col-span-3" required />
      </div>

      <div class="grid grid-cols-4 items-center gap-4">
        <Label for="email" class="text-right">Email</Label>
        <Input id="email" v-model="form.email" type="email" class="col-span-3" required />
      </div>

      <div class="grid grid-cols-4 items-center gap-4">
        <Label for="telefone" class="text-right">Telefone</Label>
        <Input id="telefone" v-model="form.telefone" class="col-span-3" />
      </div>

      <div class="grid grid-cols-4 items-center gap-4">
        <Label for="password" class="text-right">Password</Label>
        <Input
          id="password"
          v-model="form.password"
          type="password"
          minlength="6"
          class="col-span-3"
          required
        />
      </div>

      <Alert v-if="error" variant="destructive">
        <AlertCircle class="w-4 h-4" />
        <AlertTitle>Erro</AlertTitle>
        <AlertDescription>{{ error }}</AlertDescription>
      </Alert>

      <DialogFooter>
        <Button variant="outline" :disabled="loading" @click="handleCancel">
          Cancelar
        </Button>
        <Button type="button" :disabled="loading" @click="handleSubmit">
          Salvar
        </Button>
      </DialogFooter>
    </div>
  </div>
</template>
