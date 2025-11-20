<script setup lang="ts">
import {
  ChevronDown,
  Calendar,
  Home,
  Inbox,
  Search,
  Settings,
  TrendingUp,
  Users,
  UserCog,
  Building2,
  ClipboardList,
  BarChart2,
  Receipt,
  Wallet,
  FileText,
  CalendarCheck,
  History,
} from "lucide-vue-next";

// Tipagem para os itens do menu
type MenuItem = {
  title: string;
  url: string;
  icon: any;
  children?: { title: string; url: string }[];
};
type MenuConfigurations = {
  [key: string]: MenuItem[];
  gerente: MenuItem[];
  master_admin: MenuItem[];
  doctor: MenuItem[];
  assistant: MenuItem[];
};

const userRole = ref("assistant"); // valor padrão
const user = ref<{ name: string; email: string; avatar: string }>({
  name: "",
  email: "",
  avatar: "",
});

const clinicas = ref<any[]>([]);

const config = useRuntimeConfig();
const baseUrl = config.public.apiBase;

// Busca o perfil real do usuário ao montar o componente
onMounted(async () => {
  const token = useCookie("token").value;
  if (!token) {
    router.push("/login");
    return;
  }
  const { data: userData, error } = await useFetch<any>(
    `${baseUrl}utilizadores/me`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (error.value) {
    router.push("/login");
    return;
  }
  if (token) {
    // Use outro nome para o resultado do fetch!
    const { data: userData } = await useFetch<any>(
      `${baseUrl}utilizadores/me`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (
      userData.value &&
      userData.value.perfil &&
      userData.value.perfil.perfil
    ) {
      userRole.value = userData.value.perfil.perfil;
      user.value = {
        name: userData.value.nome || userData.value.username || "",
        email: userData.value.email || "",
        avatar: userData.value.avatar || "",
      };
    }
    const { data: clinicasData } = await useFetch<any>(`${baseUrl}clinica`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    clinicas.value = clinicasData.value || [];
  }
});

// Defina os menus conforme o perfil técnico
const menuConfigurations: MenuConfigurations = {
  gerente: [
    {
      title: "Início",
      url: "/diretor",
      icon: Home,
      children: [
        { title: "Resumo", url: "/diretor/overview" },
        { title: "Equipa", url: "/diretor/team" },
      ],
    },
    { title: "Painel", url: "/diretor/dashboard", icon: BarChart2 },
    { title: "Clínicas", url: "/diretor/clinics", icon: Building2 },
    { title: "Relatórios", url: "/diretor/reports", icon: TrendingUp },
    { title: "Definições", url: "/diretor/settings", icon: Settings },
  ],
  master_admin: [
    {
      title: "Início",
      url: "/master",
      icon: Home,

    },
    {
      title: "Definições",
      url: "/master/settings",
      icon: Settings,
      children: [
        { title: "Entidades", url: "/master/settings/entities" },
        { title: "Categorias", url: "/master/settings/categories" },
        { title: "Artigos", url: "/master/settings/articles" },
        { title: "Preços", url: "/master/settings/prices" },
      ],
    },
    { title: "Gerir Clínicas", url: "/master/clinics", icon: Building2 },
    { title: "Gerir Utilizadores", url: "/master/users", icon: UserCog },
    { title: "Gerir Stock", url: "/master/stock", icon: ClipboardList },
    { title: "Pacientes", url: "/master/patients", icon: Users },
    { title: "Orcamentos", url: "/master/orcamentos", icon: FileText },
    { title: "Marcações", url: "/master/marcacoes", icon: CalendarCheck },
    { title: "Historico", url: "/master/historico", icon: History },
    { title: "Contabilidade", url: "/master/contabilidade", icon: BarChart2 },
  ],
  doctor: [
    { title: "Início", url: "/doctor", icon: Home },
    { title: "Agenda", url: "/doctor/marcacoes", icon: Calendar },
    { title: "Pacientes", url: "/doctor/patients", icon: Users },
    // { title: "Relatórios", url: "/doctor/reports", icon: TrendingUp },
    // { title: "Definições", url: "/doctor/settings", icon: Settings },
    
  ],
  frontdesk: [
    { title: "Início", url: "/frontdesk", icon: Home },
    { title: "Agenda", url: "/frontdesk/marcacoes", icon: Calendar },
    { title: "Orcamentos", url: "/frontdesk/orcamentos", icon: Receipt },
    { title: "Pacientes", url: "/frontdesk/patients", icon: Users },
    { title: "Preços", url: "/frontdesk/prices", icon: ClipboardList },
    { title: "Caixa", url: "/frontdesk/caixa", icon: Wallet },
  ],
  assistant: [
    { title: "Início", url: "/assistant", icon: Home },
    { title: "Agenda", url: "/assistant/marcacoes", icon: Calendar },
    { title: "Pesquisar", url: "/assistant/search", icon: Search },
  ],
  // Adicione outros perfis conforme necessário
};

const menuItems = computed(() => {
  // fallback para 'assistant' se não encontrar o perfil
  return menuConfigurations[userRole.value] || menuConfigurations["assistant"];
});

// Dropdown state for each menu item
const openIndexes = ref<number[]>([]);

function toggleDropdown(idx: number) {
  if (openIndexes.value.includes(idx)) {
    openIndexes.value = openIndexes.value.filter((i) => i !== idx);
  } else {
    openIndexes.value.push(idx);
  }
}

const router = useRouter();

async function handleLogout() {
  const token = useCookie("token");
  try {
    await $fetch(`${baseUrl}utilizadores/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token.value}` },
    });
  } catch (e) {
    // Ignore erros de logout (token expirado, etc)
  }
  token.value = null;
  router.push("/login");
}
</script>

<template>
  <Sidebar>
    <Toaster />
    <SidebarHeader>
      <NavClinicSwitcher :clinics="clinicas" />
    </SidebarHeader>
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem v-for="(item, idx) in menuItems" :key="item.title">
              <SidebarMenuButton asChild>
                <div>
                  <NuxtLink
                    :to="item.url"
                    class="flex items-center gap-2"
                    v-if="!item.children"
                  >
                    <component :is="item.icon" class="w-4 h-4" />
                    <span>{{ item.title }}</span>
                  </NuxtLink>
                  <button
                    v-else
                    type="button"
                    class="flex items-center gap-2 w-full"
                    @click="toggleDropdown(idx)"
                  >
                    <component :is="item.icon" class="w-4 h-4" />
                    <span>{{ item.title }}</span>
                    <ChevronDown
                      class="ml-auto transition-transform"
                      :class="{ 'rotate-180': openIndexes.includes(idx) }"
                    />
                  </button>
                </div>
              </SidebarMenuButton>
              <!-- Subitens dropdown -->
              <ul
                v-if="item.children && openIndexes.includes(idx)"
                class="pl-8 mt-1"
              >
                <li v-for="sub in item.children" :key="sub.title">
                  <NuxtLink
                    :to="sub.url"
                    class="block px-2 py-1 text-sm hover:underline"
                  >
                    {{ sub.title }}
                  </NuxtLink>
                </li>
              </ul>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
    <SidebarFooter>
      <NavUser :user="user" @logout="handleLogout" />
    </SidebarFooter>
  </Sidebar>
</template>
