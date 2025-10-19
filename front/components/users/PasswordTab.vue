<script setup lang="ts">
import {  AlertCircle } from "lucide-vue-next";

const props = defineProps({
  currentPassword: String,
  newPassword: String,
  passwordError: String,
  loading: Boolean,
  onSubmitPassword: {
    type: Function as PropType<() => void>,
    required: true,
  },
});

const emit = defineEmits(["update:currentPassword", "update:newPassword"]);

function onCurrentPasswordInput(e: { target: { value: any } }) {
  emit("update:currentPassword", e.target.value);
}
function onNewPasswordInput(e: { target: { value: any } }) {
  emit("update:newPassword", e.target.value);
}
</script>

<template>
  <div class="grid gap-4 py-2">
    <div class="grid grid-cols-4 items-center gap-4">
      <Label for="current-password" class="text-right">Senha atual</Label>
      <Input
        id="current-password"
        :value="currentPassword"
        @input="onCurrentPasswordInput"
        type="password"
        class="col-span-3"
      />
    </div>
    <div class="grid grid-cols-4 items-center gap-4">
      <Label for="new-password" class="text-right">Nova senha</Label>
      <Input
        id="new-password"
        :value="newPassword"
        @input="onNewPasswordInput"
        type="password"
        class="col-span-3"
      />
    </div>
    <Alert v-if="passwordError" variant="destructive">
      <AlertCircle class="w-4 h-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        {{ passwordError }}
      </AlertDescription>
    </Alert>
    <DialogFooter>
      <Button type="button" :disabled="loading" @click="props.onSubmitPassword">
        Salvar senha
      </Button>
    </DialogFooter>
  </div>
</template>
