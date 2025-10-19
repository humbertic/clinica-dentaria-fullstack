<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRoute } from "vue-router";
import { MessageCircle, X } from 'lucide-vue-next';
import { useChat } from '@/composables/useChat';
import { Toaster } from '@/components/ui/sonner'
import 'vue-sonner/style.css'

const route = useRoute();
const showChat = ref(false);
const chatThreadId = ref<number | null>(null);
const selectedClinic = useState<{ id: number; nome: string } | null>('selectedClinic');
const clinicaId = computed(() => {
  return selectedClinic.value?.id || Number(route.query.clinicaId) || 2;
});
const loading = ref(false);
const error = ref<string | null>(null);

// Get the current user
type User = { id: number; [key: string]: any } | null;
type ChatInstance = ReturnType<typeof useChat>;
const currentUser = useState<User>('user');

// Fetch clinic thread for chat
const fetchClinicThread = async () => {
  if (!currentUser.value?.id) return;
  
  try {
    loading.value = true;
    error.value = null; // Clear previous errors
    
    const result = await $fetch<{ id: number }>(`/mensagens/clinic-thread?clinica_id=${clinicaId.value}`, {
      method: 'GET',
      baseURL: useRuntimeConfig().public.apiBase,
      headers: { 
        Authorization: `Bearer ${useCookie('token').value}` 
      }
    });
    
    chatThreadId.value = result.id;
    console.log(`Thread ID ${result.id} obtained for clinic ${clinicaId.value}`);
    loading.value = false;
    
    // Once we have the thread ID, initialize the chat
    if (chatThreadId.value) {
      initializeChat();
    }
  } catch (err: any) {
    console.error("Error fetching clinic thread:", err);
    
    // More descriptive error messages based on status
    if (err.response?.status === 403) {
      error.value = `Sem permissão para acessar o chat desta clínica (ID: ${clinicaId.value})`;
    } else if (err.response?.status === 404) {
      error.value = `Chat não encontrado para esta clínica (ID: ${clinicaId.value})`;
    } else {
      error.value = (err.message || String(err)) || 'Erro ao carregar o chat da clínica';
    }
    
    loading.value = false;
    chatThreadId.value = null;
  }
};

// Initialize chat connection
let chatInstance: ChatInstance | null = null;
const unreadCount = ref(0);

const initializeChat = () => {
  if (!chatThreadId.value || !currentUser.value?.id) return;
  
  if (chatInstance) {
    chatInstance.disconnect();
  }
  
  chatInstance = useChat(chatThreadId.value, clinicaId.value);
  
  if (chatInstance) {
    watch(() => chatInstance!.unreadCount.value, (newCount) => {
      unreadCount.value = newCount;
    });
  }
};

// Toggle chat panel
const toggleChat = async () => {
  if (!showChat.value && !chatThreadId.value) {
    await fetchClinicThread();
  }
  
  showChat.value = !showChat.value;
  
  // Mark messages as read when opening the chat
  if (showChat.value && chatInstance) {
    chatInstance.markAsRead();
  }
};

watch(() => clinicaId.value, (newClinicId, oldClinicId) => {
  if (newClinicId !== oldClinicId) {
    chatThreadId.value = null; 
    unreadCount.value = 0; 
    
    // Close chat if it's open when changing clinics
    if (showChat.value) {
      showChat.value = false;
    }
    
    // Clean up previous chat instance
    if (chatInstance) {
      chatInstance.disconnect();
      chatInstance = null;
    }
    
    // Fetch new thread if user is logged in
    if (currentUser.value?.id) {
      fetchClinicThread();
    }
  }
}, { immediate: false });

// Your existing breadcrumb code...
const breadcrumbMap: Record<string, string> = {
  // Master Section Breadcrumbs
  "/master/clinics": "Gerir Clínicas",
  "/master/users": "Gerir Utilizadores",
  "/master/clinics/settings": "Configurações",
  "/master/stock": "Gerir Stock",
  "/master/reports": "Contabilidade",
  "/master/patients": "Gerir Pacientes",
  "/master/patient": "Gerir Pacientes",
  "/master/settings/entities": "Entidades",
  "/master/settings/categories": "Categorias",
  "/master/settings/articles": "Artigos",
  "/master/settings/prices": "Preços",
  "/master/orcamentos": "Orcamentos",
  "/master/marcacoes": "Marcações",
  "/master/historico": "Logs",

  // Doctor Section Breadcrumbs
  "/doctor": "Início",
  "/doctor/marcacoes": "Agenda",
  "/doctor/patients": "Pacientes",
  "/doctor/reports": "Relatórios",
  "/doctor/settings": "Definições",
  

  // front desk Section Breadcrumbs
  "/frontdesk": "Início",
  "/frontdesk/marcacoes": "Agenda",
  "/frontdesk/search": "Pesquisar",
  "/frontdesk/settings": "Definições",
  "/frontdesk/patients": "Pacientes",
  "/frontdesk/orcamentos": "Orcamentos",
  "/frontdesk/caixa": "Caixa",
  "/pacient": "Pacientes",
};

const mainSection = computed(() => {
  // Match both /master/clinics and /master/clinic/:id
  if (route.path.startsWith("/master/clinics")) return "/master/clinics";
  if (route.path.match(/^\/master\/clinic\/\d+/)) return "/master/clinics";
  if (route.path.startsWith("/master/users")) return "/master/users";
  if (route.path.match(/^\/master\/patient\/\d+$/)) return "/master/patients";
  if (route.path.match(/^\/frontdesk\/patient\/\d+$/)) return "/frontdesk/patients";
  if (route.path.startsWith("/master/patients")) return "/master/patients";
  if (route.path.match(/^\/doctor\/patient\/\d+$/)) return "/doctor/patients";
  return route.path;
});

const mainBreadcrumbText = computed(
  () => breadcrumbMap[mainSection.value] || mainSection.value
);

const subpageBreadcrumbText = computed(() => {
  if (route.path.match(/^\/master\/clinic\/\d+\/settings/)) return 'Configurações'
  if (route.path.match(/^\/master\/patient\/\d+$/)) return 'Detalhes'
  if (route.path.match(/^\/frontdesk\/patient\/\d+$/)) return 'Detalhes'
  if (route.path.match(/^\/doctor\/patient\/\d+$/)) return 'Detalhes'
  return ''
})

// Initialize chat when component mounts
onMounted(() => {
  if (currentUser.value?.id) {
    fetchClinicThread();
  }
});

// Clean up the chat instance when layout unmounts
onBeforeUnmount(() => {
  if (chatInstance) {
    chatInstance.disconnect();
  }
});
</script>

<template>
  <div>
    <ClientOnly>
      <Toaster />
      <TokenExpirationHandler />
    </ClientOnly>
  <SidebarProvider>
    <NavAppSidebar />
    <SidebarInset>
      <header
        class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12"
      >
        <div class="flex items-center gap-2 px-4">
          <SidebarTrigger class="-ml-1" />
          <Separator orientation="vertical" class="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem class="hidden md:block">
                <BreadcrumbLink as-child>
                  <NuxtLink :to="mainSection">
                    {{ mainBreadcrumbText }}
                  </NuxtLink>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator
                class="hidden md:block"
                v-if="subpageBreadcrumbText"
              />
              <BreadcrumbItem v-if="subpageBreadcrumbText">
                <BreadcrumbPage>{{ subpageBreadcrumbText }}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        
        <!-- Chat button with notification badge -->
        <div class="ml-auto mr-4" v-if="currentUser?.id">
          <div class="relative">
            <Button variant="ghost" size="icon" @click="toggleChat" class="rounded-full">
              <MessageCircle class="h-5 w-5" />
              
              <!-- Notification badge -->
              <Transition name="fade">
                <div 
                  v-if="unreadCount > 0" 
                  class="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs"
                  :class="unreadCount > 9 ? 'h-5 w-5 text-[10px]' : 'h-4 w-4'"
                >
                  {{ unreadCount > 99 ? '99+' : unreadCount }}
                </div>
              </Transition>
            </Button>
          </div>
        </div>
      </header>
      
      <slot />
      
      <!-- Floating chat panel -->
      <Teleport to="body">
        <Transition
          enter-active-class="transition ease-out duration-200"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition ease-in duration-150"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div 
            v-if="showChat && currentUser?.id" 
            class="fixed bottom-4 right-4 w-[350px] h-[500px] shadow-lg z-50 rounded-lg overflow-hidden bg-card border"
          >
            <div class="flex flex-col h-full">
              <!-- Chat header -->
              <div class="p-3 border-b flex items-center justify-between bg-card">
                <h3 class="font-medium text-card-foreground">Chat da Clínica</h3>
                <Button variant="ghost" size="icon" @click="showChat = false" class="h-8 w-8">
                  <X class="h-4 w-4" />
                </Button>
              </div>

              
              <!-- Chat content -->
              <div class="flex-1 overflow-hidden">
                <div v-if="loading" class="flex items-center justify-center h-full">
                  <div class="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
                
                <div v-else-if="error" class="p-4 text-destructive text-sm">
                  {{ error }}
                  <Button variant="outline" size="sm" class="mt-2 w-full" @click="fetchClinicThread">
                    Tentar novamente
                  </Button>
                </div>
                <ChatWindow
                  v-else-if="chatThreadId"
                  :thread-id="chatThreadId" 
                  :clinica-id="clinicaId" 
                  :current-user-id="currentUser.id" 
                />
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>
    </SidebarInset>
  </SidebarProvider>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: scale(0.5);
}
</style>