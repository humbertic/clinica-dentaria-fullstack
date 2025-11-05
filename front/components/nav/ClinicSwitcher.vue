<script setup lang="ts">
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { ChevronsUpDown, Users, Plus } from "lucide-vue-next";
import { ref, watch, onMounted } from "vue";

const props = defineProps<{
  clinics: {
    id: number;
    nome: string;
    morada?: string;
    email_envio?: string;
  }[];
}>();

type Clinic = {
  id: number;
  nome: string;
  morada?: string;
  email_envio?: string;
};

const selectedClinic = useState<Clinic | null>(
  "selectedClinic",
  () => null
);

const showAddClinicModal = ref(false);
const { isMobile } = useSidebar();
const activeClinic = ref<Clinic | null>(null);

function handleClinicSaved() {
  showAddClinicModal.value = false;
}

function handleClinicCancel() {
  showAddClinicModal.value = false;
}

function setActiveClinic(clinic: {
  id: number;
  nome: string;
  morada?: string;
  email_envio?: string;
}) {
  selectedClinic.value = clinic;
  activeClinic.value = clinic;
  
  // Save to cookie/localStorage for persistence
  const activeClinicCookie = useCookie("activeClinicId");
  activeClinicCookie.value = clinic.id.toString();
}

// Initialize active clinic from cookie or default to first
function initializeActiveClinic(clinics: typeof props.clinics) {
  if (!clinics || clinics.length === 0) return;
  
  // Try to get from cookie first
  const activeClinicCookie = useCookie("activeClinicId");
  const storedClinicId = activeClinicCookie.value;
  
  let clinicToSet = null;
  
  if (storedClinicId) {
    // Find the stored clinic in the list
    clinicToSet = clinics.find((c) => c.id === Number(storedClinicId));
  }
  
  // If not found or no stored clinic, use first one
  if (!clinicToSet) {
    clinicToSet = clinics[0];
    // Save it to cookie
    activeClinicCookie.value = clinicToSet.id.toString();
  }
  
  selectedClinic.value = clinicToSet;
  activeClinic.value = clinicToSet;
}

// Watch for clinic list changes
watch(
  () => props.clinics,
  (val) => {
    initializeActiveClinic(val);
  },
  { immediate: true }
);

// Also initialize on mount (in case clinics are already available)
onMounted(() => {
  initializeActiveClinic(props.clinics);
});
</script>

<template>
  <SidebarMenu>
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <SidebarMenuButton
            size="lg"
            class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <div
              class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
            >
              <Users class="size-4" />
            </div>
            <div class="grid flex-1 text-left text-sm leading-tight">
              <span class="truncate font-semibold">
                {{ activeClinic?.nome || "Selecione a clínica" }}
              </span>
              <span class="truncate text-xs">
                {{ activeClinic?.morada || activeClinic?.email_envio || "" }}
              </span>
            </div>
            <ChevronsUpDown class="ml-auto" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          class="w-[--reka-dropdown-menu-trigger-width] min-w-56 rounded-lg"
          :side="isMobile ? 'bottom' : 'right'"
          :side-offset="4"
        >
          <DropdownMenuLabel class="text-xs text-muted-foreground">
            Clínicas
          </DropdownMenuLabel>
          <DropdownMenuItem
            v-for="(clinic, index) in clinics"
            :key="clinic.id"
            class="gap-2 p-2"
            @click="setActiveClinic(clinic)"
          >
            <div
              class="flex size-6 items-center justify-center rounded-sm border"
            >
              <Users class="size-4 shrink-0" />
            </div>
            <div>
              <div class="font-semibold">{{ clinic.nome }}</div>
              <div class="text-xs text-muted-foreground">
                {{ clinic.morada || clinic.email_envio || "" }}
              </div>
            </div>
            <DropdownMenuShortcut>⌘{{ index + 1 }}</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            class="gap-2 p-2"
            @click="showAddClinicModal = true"
          >
            <div
              class="flex size-6 items-center justify-center rounded-md border bg-background"
            >
              <Plus class="size-4" />
            </div>
            <div class="font-medium text-muted-foreground">
              Adicionar clínica
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
    <Dialog v-model:open="showAddClinicModal">
      <DialogContent>
        <ClinicsClinicForm
          @save="handleClinicSaved"
          @cancel="handleClinicCancel"
          :clinics="clinics"
        />
      </DialogContent>
    </Dialog>
  </SidebarMenu>
</template>