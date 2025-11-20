<script setup lang="ts">
import { ref, computed } from "vue";
import { Mail, Loader2 } from "lucide-vue-next";
import { useToast } from "@/components/ui/toast";

type User = {
  id: number;
  nome: string;
  email: string;
};

const props = defineProps<{
  user: User | null;
  open: boolean;
  clinicaId?: number;
}>();

const emit = defineEmits<{
  (e: "update:open", value: boolean): void;
  (e: "sent"): void;
}>();

const { toast } = useToast();
const config = useRuntimeConfig();
const baseUrl = config.public.apiBase;

// Form state
const assunto = ref("");
const mensagem = ref("");
const customEmail = ref("");
const loading = ref(false);

// Computed
const effectiveEmail = computed(() => customEmail.value || props.user?.email || "");

// Get clinica ID from global state if not provided
const selectedClinic = useState<{ id: number } | null>("selectedClinic", () => null);
const effectiveClinicaId = computed(() => props.clinicaId || selectedClinic.value?.id);

// Methods
function resetForm() {
  assunto.value = "";
  mensagem.value = "";
  customEmail.value = "";
}

function close() {
  resetForm();
  emit("update:open", false);
}

async function sendEmail() {
  if (!props.user) return;

  if (!assunto.value.trim()) {
    toast({
      title: "Erro",
      description: "Por favor, insira um assunto",
      variant: "destructive",
    });
    return;
  }

  if (!mensagem.value.trim()) {
    toast({
      title: "Erro",
      description: "Por favor, insira uma mensagem",
      variant: "destructive",
    });
    return;
  }

  if (!effectiveEmail.value) {
    toast({
      title: "Erro",
      description: "É necessário um endereço de email",
      variant: "destructive",
    });
    return;
  }

  if (!effectiveClinicaId.value) {
    toast({
      title: "Erro",
      description: "ID da clínica não fornecido",
      variant: "destructive",
    });
    return;
  }

  loading.value = true;
  try {
    const token = useCookie("token").value;
    const url = `${baseUrl}email/utilizador/${props.user.id}?clinica_id=${effectiveClinicaId.value}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        assunto: assunto.value,
        mensagem: mensagem.value,
        email_para: customEmail.value || null,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || `Erro ao enviar email: ${response.statusText}`
      );
    }

    toast({
      title: "Sucesso",
      description: `Email enviado para ${effectiveEmail.value}`,
    });

    emit("sent");
    close();
  } catch (error) {
    console.error("Erro ao enviar email:", error);
    toast({
      title: "Erro",
      description:
        error instanceof Error ? error.message : "Erro ao enviar email",
      variant: "destructive",
    });
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Enviar Email para {{ user?.nome }}</DialogTitle>
        <DialogDescription>
          Envie uma notificação por email para este utilizador.
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-4 py-4">
        <!-- Email recipient -->
        <div class="space-y-2">
          <Label for="email">Email do Destinatário</Label>
          <Input
            id="email"
            v-model="customEmail"
            type="email"
            :placeholder="user?.email || 'email@exemplo.com'"
            :disabled="loading"
          />
          <p v-if="user?.email" class="text-xs text-muted-foreground">
            Email padrão: {{ user.email }}
          </p>
        </div>

        <!-- Subject -->
        <div class="space-y-2">
          <Label for="assunto">Assunto</Label>
          <Input
            id="assunto"
            v-model="assunto"
            type="text"
            placeholder="Assunto do email"
            :disabled="loading"
          />
        </div>

        <!-- Message -->
        <div class="space-y-2">
          <Label for="mensagem">Mensagem</Label>
          <Textarea
            id="mensagem"
            v-model="mensagem"
            placeholder="Digite a sua mensagem aqui..."
            :disabled="loading"
            rows="6"
            class="resize-none"
          />
          <p class="text-xs text-muted-foreground">
            A mensagem será formatada num template profissional.
          </p>
        </div>
      </div>

      <DialogFooter>
        <Button
          variant="outline"
          @click="close"
          :disabled="loading"
        >
          Cancelar
        </Button>
        <Button @click="sendEmail" :disabled="loading">
          <Loader2 v-if="loading" class="h-4 w-4 mr-2 animate-spin" />
          <Mail v-else class="h-4 w-4 mr-2" />
          Enviar
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
