<script setup lang="ts">
import type { Ref } from "vue";
import { useChat } from "@/composables/useChat";
import { Send, RefreshCw, Search, Wifi, WifiOff } from "lucide-vue-next";

interface Props {
  /** ID (ou Ref) do *thread* atual. */
  threadId: number | Ref<number>;
  /** ID (ou Ref) da clínica. */
  clinicaId: number | Ref<number>;
  /** ID do utilizador logado: serve para alinhar as próprias mensagens à direita */
  currentUserId: number;
}

const props = defineProps<Props>();

const { messages, send, reconnect, disconnect, connected, markAsRead } =
  useChat(props.threadId, props.clinicaId);

// Debug the original message order from the API
console.log(
  "Raw messages from API:",
  messages.value.map((m) => `ID: ${m.id}, time: ${m.created_at.slice(11, 19)}`)
);

// Sort messages in chronological order (oldest first)
const sortedMessages = computed(() => {
  // Force chronological order by created_at timestamp first, then ID
  return [...messages.value].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();

    // If dates are the same, use ID
    if (dateA === dateB) {
      return a.id - b.id;
    }

    return dateA - dateB; // Oldest first
  });
});

const search = ref("");
const filtered = computed(() => {
  if (!search.value.trim()) return sortedMessages.value;
  const term = search.value.toLowerCase();
  return sortedMessages.value.filter((m) =>
    m.texto.toLowerCase().includes(term)
  );
});

const messageText = ref("");
const isLoading = ref(false);

async function handleSend() {
  const text = messageText.value.trim();
  if (!text || isLoading.value) return;

  isLoading.value = true;
  try {
    await send(text, undefined, "clinic");
    messageText.value = "";
    forceScrollToBottom();
  } finally {
    isLoading.value = false;
  }
}

const messagesContainer = ref<HTMLElement | null>(null);
const topSentinel = ref<HTMLElement | null>(null);
const shouldAutoScroll = ref(true);

function scrollToBottom() {
  if (!shouldAutoScroll.value) return;

  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
}

function forceScrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
}

// Detect if user has scrolled up (to disable auto-scroll)
function handleScroll() {
  if (!messagesContainer.value) return;

  const { scrollTop, scrollHeight, clientHeight } = messagesContainer.value;
  const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

  shouldAutoScroll.value = distanceFromBottom < 100;
}

const previousCount = ref(0);
watch(
  () => sortedMessages.value.length,
  (newCount) => {
    if (newCount > previousCount.value) {
      setTimeout(() => {
        scrollToBottom();
      }, 50);
    }
    previousCount.value = newCount;
  }
);

watch(
  () => filtered.value.length,
  () => {
    if (shouldAutoScroll.value) {
      scrollToBottom();
    }
  }
);

onMounted(() => {
  nextTick(() => {
    setTimeout(() => {
      forceScrollToBottom();
      markAsRead();

      if (messageText.value && textareaRef.value) {
        adjustTextareaHeight();
      }
    }, 100);
  });
});

onBeforeUnmount(() => {
  disconnect();
});

const getUserName = (userId: number): string => {
  console.log(
    `Current user ID: ${props.currentUserId}, checking user ID: ${userId}`
  );
  if (userId === props.currentUserId) return "Você";
  return (
    sortedMessages.value.find((m) => m.remetente_id === userId)
      ?.remetente_nome || `Usuário #${userId}`
  );
};

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const textareaRef = ref<HTMLTextAreaElement | null>(null);
const adjustTextareaHeight = () => {
  nextTick(() => {
    if (!textareaRef.value) return;

    try {
      if (textareaRef.value && textareaRef.value.style) {
        textareaRef.value.style.height = "auto";
        textareaRef.value.style.height = `${Math.min(
          textareaRef.value.scrollHeight,
          120
        )}px`;
      }
    } catch (err) {
      console.error("Error adjusting textarea height:", err);
    }
  });
};

watch(messageText, (newValue) => {
  if (textareaRef.value && newValue) {
    adjustTextareaHeight();
  }
});
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <div class="p-3 border-b">
      <div class="flex items-center justify-between gap-4">
        <div class="relative flex-1 max-w-sm">
          <Search
            class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
          />
          <Input
            v-model="search"
            placeholder="Pesquisar mensagens..."
            class="pl-9"
          />
        </div>

        <div class="flex items-center gap-3">
          <Badge
            :variant="connected ? 'default' : 'destructive'"
            class="flex items-center gap-1.5"
          >
            <component :is="connected ? Wifi : WifiOff" class="h-3 w-3" />
            {{ connected ? "Online" : "Offline" }}
          </Badge>

          <Button
            variant="outline"
            size="sm"
            @click="reconnect"
            :disabled="isLoading"
          >
            <RefreshCw :class="['h-4 w-4', isLoading && 'animate-spin']" />
          </Button>
        </div>
      </div>
    </div>

    <!-- Messages area -->
    <div
      ref="messagesContainer"
      class="flex-1 overflow-y-auto p-4 space-y-4"
      style="scroll-behavior: smooth"
      @scroll="handleScroll"
    >
      <!-- Sentinel for infinite scroll -->
      <div ref="topSentinel" class="h-1"></div>

      <!-- Empty state -->
      <div
        v-if="filtered.length === 0"
        class="flex flex-col items-center justify-center py-12 text-center"
      >
        <div class="rounded-full bg-muted p-3 mb-4">
          <Send class="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 class="font-semibold text-lg mb-2">Nenhuma mensagem encontrada</h3>
        <p class="text-muted-foreground text-sm">
          {{
            search
              ? "Tente ajustar sua pesquisa"
              : "Seja o primeiro a enviar uma mensagem!"
          }}
        </p>
      </div>

      <!-- Messages -->
      <template v-for="msg in filtered" :key="msg.id">
        <div
          :class="[
            'flex',
            msg.remetente_id === props.currentUserId
              ? 'justify-end'
              : 'justify-start',
          ]"
        >
          <div
            :class="[
              'max-w-[75%] sm:max-w-[85%] rounded-2xl px-4 py-3 shadow-sm',
              msg.remetente_id === props.currentUserId
                ? 'bg-primary text-primary-foreground rounded-br-md'
                : 'bg-muted rounded-bl-md',
            ]"
          >
            <!-- Sender name for other users -->
            <div
              v-if="msg.remetente_id !== props.currentUserId"
              class="text-xs font-medium mb-1 opacity-80"
            >
              {{ msg.remetente_nome || getUserName(msg.remetente_id) }}
            </div>

            <!-- Message content -->
            <p class="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {{ msg.texto }}
            </p>

            <!-- Timestamp -->
            <div
              :class="[
                'text-xs mt-2 opacity-70',
                msg.remetente_id === props.currentUserId
                  ? 'text-right'
                  : 'text-left',
              ]"
            >
              {{ formatTime(msg.created_at) }}
            </div>
          </div>
        </div>
      </template>

      <!-- Small indicator to show auto-scroll is disabled -->
      <div
        v-if="!shouldAutoScroll && messages.length > 0"
        class="fixed bottom-20 right-6 bg-primary/90 text-primary-foreground rounded-full p-2 shadow-lg cursor-pointer"
        @click="
          forceScrollToBottom();
          shouldAutoScroll = true;
        "
        title="Novas mensagens abaixo"
      >
        <div class="flex items-center gap-2 text-xs px-1">
          <span>Novas mensagens</span>
          <Send class="h-3 w-3 transform rotate-90" />
        </div>
      </div>
    </div>

    <!-- Message input -->
    <div class="p-4 border-t">
      <form @submit.prevent="handleSend" class="flex items-end gap-3">
        <div class="flex-1">
          <Textarea
            ref="textareaRef"
            v-model="messageText"
            placeholder="Digite sua mensagem..."
            class="min-h-[44px] max-h-[120px] resize-none"
            :disabled="isLoading"
            @keydown.enter.exact.prevent="handleSend"
            @input="() => messageText? adjustTextareaHeight() : null"
          />
        </div>

        <Button
          type="submit"
          size="sm"
          :disabled="!messageText.trim() || isLoading"
          class="h-11 px-4"
        >
          <Send :class="['h-4 w-4', isLoading && 'animate-pulse']" />
          <span class="sr-only">Enviar mensagem</span>
        </Button>
      </form>
    </div>
  </div>
</template>
