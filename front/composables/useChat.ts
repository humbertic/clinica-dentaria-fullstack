import { useState, useRuntimeConfig } from "#app";

// Define ChatMsg type
type ChatMsg = {
  id: number;
  thread_id: number;
  remetente_id: number;
  remetente_nome?: string;
  clinica_id: number;
  created_at: string;
  lida: boolean;
  texto: string;
};

export function useChat(
  threadId: Ref<number> | number,
  clinicaId: Ref<number> | number
) {
  // Unref the values to handle both refs and raw values
  const getThreadId = () => unref(threadId);
  const getClinicaId = () => unref(clinicaId);

  const cfg = useRuntimeConfig();
  const token = useCookie("token").value;
  const currentUser = useState<{ id: number } | null>("user");

  // Important: Use local ref for messages to avoid reactivity issues
  const messages = ref<ChatMsg[]>([]);
  const connected = ref(false);
  const unreadCount = ref(0);
  const lastReadMsgId = ref<number>(0);
  let socket: WebSocket | null = null;

  /** Connect to the WebSocket for this thread */
  const connect = () => {
    if (socket) return; // Already connected

    // Create WebSocket URL for clinic-specific channel
    const baseUrl = cfg.public.apiBase
      .replace(/^http/, "ws")
      .replace(/\/$/, "");
    const url = `${baseUrl}/mensagens/ws/clinica/${getClinicaId()}?token=${token}`;


    socket = new WebSocket(url);

    socket.onopen = () => {
      connected.value = true;
    };

    socket.onclose = (event) => {
      connected.value = false;

      // Attempt to reconnect after a delay if not intentionally closed
      if (event.code !== 1000) {
        setTimeout(() => {
          if (!socket || socket.readyState === WebSocket.CLOSED) {
            connect();
          }
        }, 3000);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        // Process all incoming messages for notifications
        if (
          msg.thread_id === getThreadId() &&
          msg.remetente_id !== currentUser.value?.id &&
          msg.id > lastReadMsgId.value
        ) {
          unreadCount.value++;
        }

        // Only process messages for this thread
        if (msg.thread_id === getThreadId()) {
          // Use a Set to track message IDs we've seen
          const msgIds = new Set(messages.value.map((m) => m.id));

          if (!msgIds.has(msg.id)) {
            // Create a new array reference to trigger reactivity
            messages.value = [...messages.value, msg].sort(
              (a, b) =>
                new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime()
            );
           
          }
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };
  };

  const disconnect = () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.close(1000, "User navigated away");
      socket = null;
    }
  };

  const send = async (
    texto: string,
    destinatario_id?: number,
    tipo_thread: string = "dm"
  ) => {
    // Prepare message data
    const messageData: any = {
      texto,
      clinica_id: getClinicaId(),
      tipo_thread,
    };

    // Add either thread_id or destinatario_id
    if (getThreadId()) {
      messageData.thread_id = getThreadId();
    } else if (destinatario_id && tipo_thread === "dm") {
      messageData.destinatario_id = destinatario_id;
    } else if (tipo_thread === "clinic") {
      // No additional fields needed for clinic-wide chat
    } else {
      console.error("Invalid message configuration");
      return;
    }

    // Send via REST API
    try {
      const response = await $fetch("/mensagens", {
        // Added leading slash
        method: "POST",
        body: messageData,
        baseURL: cfg.public.apiBase,
        headers: { Authorization: `Bearer ${token}` },
      });

      return response;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  };

  // Fetch historical messages
  const fetchMessages = async () => {
    try {
      const result = await $fetch(
        `/mensagens/thread/${getThreadId()}?clinica_id=${getClinicaId()}`,
        {
          method: "GET",
          baseURL: cfg.public.apiBase,
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Set initial messages
      messages.value = result as ChatMsg[];
      // Find the most recent message ID
      if (messages.value.length > 0) {
        const maxId = Math.max(...messages.value.map((m) => m.id));
        lastReadMsgId.value = maxId;
        unreadCount.value = 0; // Reset unread count on initial load
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };
  const markAsRead = () => {
    if (messages.value.length > 0) {
      const maxId = Math.max(...messages.value.map((m) => m.id));
      lastReadMsgId.value = maxId;
      unreadCount.value = 0;
    }
  };

  // Watch for changes to thread or clinic IDs and reconnect if needed
  if (isRef(threadId) || isRef(clinicaId)) {
    watch([() => unref(threadId), () => unref(clinicaId)], () => {
      disconnect();
      messages.value = []; // Clear messages when changing thread
      fetchMessages(); // Load messages for new thread
      connect();
    });
  }

  // Connect immediately
  connect();
  fetchMessages();

  return {
    messages, // Return the ref directly, not a computed property
    connected,
    send,
    reconnect: connect,
    disconnect,
    unreadCount,
    markAsRead,
  };
}
