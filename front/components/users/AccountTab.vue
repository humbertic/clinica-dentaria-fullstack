<script setup lang="ts">
import { AlertCircle } from "lucide-vue-next";

const props = defineProps<{
  user: any,
  nome: string,
  telefone: string,
  error: string,
  loading: boolean,
  onSubmitAccount: () => void, // <-- precise type
}>();
const emit = defineEmits(["update:nome", "update:telefone"]);

function onNomeInput(e: { target: { value: any } }) {
  emit("update:nome", e.target.value);
}
function onTelefoneInput(e: { target: { value: any } }) {
  emit("update:telefone", e.target.value);
}
</script>

<template>
  <div class="grid gap-4 py-2">
    <div class="grid grid-cols-4 items-center gap-4">
      <Label class="text-right">Perfil</Label>
      <span class="col-span-3 text-sm text-muted-foreground">{{
        user?.perfil?.nome
      }}</span>
    </div>
    <div class="grid grid-cols-4 items-center gap-4">
      <Label class="text-right">Username</Label>
      <span class="col-span-3 text-sm text-muted-foreground">{{
        user?.nome
      }}</span>
    </div>
    <div class="grid grid-cols-4 items-center gap-4">
      <Label for="email" class="text-right">Email</Label>
      <span class="col-span-3 text-sm text-muted-foreground">{{
        user?.email
      }}</span>
    </div>
    <div class="grid grid-cols-4 items-center gap-4">
      <Label for="nome" class="text-right">Nome</Label>
      <Input
        id="nome"
        :model-value="nome"
        @update:modelValue="emit('update:nome', $event)"
        class="col-span-3"
      />
    </div>
    <div class="grid grid-cols-4 items-center gap-4">
      <Label for="telefone" class="text-right">Telefone</Label>
      <Input
        id="telefone"
        :model-value="telefone"
        @update:modelValue="emit('update:telefone', $event)"
        class="col-span-3"
      />
    </div>
    <Alert v-if="error" variant="destructive">
      <AlertCircle class="w-4 h-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        {{ error }}
      </AlertDescription>
    </Alert>
    <DialogFooter>
      <Button type="button" :disabled="loading" @click="props.onSubmitAccount">
        Salvar alterações
      </Button>
    </DialogFooter>
  </div>
</template>
