<script setup lang="ts">
import VueCal from "vue-cal/dist/vue-cal.es.js";
import type {
  VueCalEvent,
  MarcacaoCreate,
  MarcacaoUpdate,
  MarcacaoRead,
} from "~/types/marcacao";
import { Plus } from "lucide-vue-next";
import { useMarcacoes } from "~/composables/useMarcacao";
import type { Clinica } from "~/types/clinica";
import { useToast } from "@/components/ui/toast";
import { useEntidades } from "~/composables/useEntidades";
import type { Entidade } from "~/types/entidade";
import { useFilter } from "reka-ui";
import type { PacienteMinimal } from "~/types/pacientes";
import { usePacientes } from "~/composables/usePacientes";
import type { UtilizadorResponse } from "~/types/utilizador";
import { useUtilizadores } from "~/composables/useUtilizadores";

const { toast } = useToast();
const {
  events,
  fetchMarcacoes,
  createMarcacao,
  updateMarcacao,
  deleteMarcacao,
  error,
} = useMarcacoes();

const selectedClinic = useState<Clinica | null>("selectedClinic");
const loggedUser = useState<UtilizadorResponse | null>("user");

const calendarRef = ref<InstanceType<typeof VueCal> | null>(null);
const calendarViews = ["day", "week", "month", "year", "years", "years-range"];
const toIso = (d: Date) => d.toISOString();
let clickTimer: ReturnType<typeof setTimeout> | null = null;
let holdingEvent = false;
const CLICK_DELAY = 250;
const formPacient = ref(false);

const {
  pacientes,
  fetchPacientes,
  loading: pacientesLoading,
  error: pacientesError,
} = usePacientes();

const { users, fetchMedicosByClinica } = useUtilizadores();

const selectedEntity = ref<number | null>(null);
const selectedPaciente = ref<number | null>(null);
const selectedMedico = ref<number | null>(null);
const isFormOpen = ref(false);
const pendingStart = ref<Date | null>(null);
const selectedEvent = ref<VueCalEvent | null>(null);
const formMode = ref<"create" | "edit">("create");

const pacienteName = computed(() => {
  const p = pacientes.value.find((x) => x.id === selectedPaciente.value);
  return p ? p.nome : "";
});

// Fetch when clinic changes or on mount
watch(
  selectedClinic,
  (c) => {
    if (!c) return;
    // fetch calendar events
    fetchMarcacoes(c.id);
    // fetch pacientes for this clinic
    fetchPacientes(c.id);
    // fetch users for this clinic
    fetchMedicosByClinica(c.id);
    // fetch entidades
  },
  { immediate: true }
);
watch(selectedPaciente, (p) => {
  if (!p) return;
  const paciente = pacientes.value.find((p) => p.id === selectedPaciente.value);
});
watch(selectedMedico, (m) => {
  if (m !== null && selectedClinic.value) {
    fetchMarcacoes(selectedClinic.value.id, m);
  }
});

onMounted(() => {
  if (selectedClinic.value) fetchMarcacoes(selectedClinic.value.id);
  fetchPacientes(selectedClinic.value?.id ?? undefined);
  if (selectedClinic.value?.id !== undefined) {
    fetchMedicosByClinica(selectedClinic.value.id);
  }
});

function snapToHalfHour(d: Date): Date {
  const date = new Date(d);
  const mins = date.getMinutes();
  const mod = mins % 30;
  // if within first 15' of the slot → round down, otherwise up
  const snapped = mod < 15 ? mins - mod : mins + (30 - mod);

  date.setMinutes(snapped);
  date.setSeconds(0);
  date.setMilliseconds(0);
  return date;
}

const defaultEnd = computed(() =>
  pendingStart.value
    ? new Date(pendingStart.value.getTime() + 30 * 60000)
    : null
);

function onCellDblClick(payload: any) {
  const raw: Date =
    payload instanceof Date ? payload : payload.date ?? payload.start;

  if (!raw) return console.warn("no date!", payload);

  const start = snapToHalfHour(raw);

  const now = new Date();
  if (start < now) {
    toast({
      title: "Erro",
      description: "Não é possível agendar em data/hora passada",
      variant: "destructive",
    });
    return;
  }

  const end = new Date(start.getTime() + 30 * 60_000);

  if (
    !selectedClinic.value ||
    !selectedMedico.value ||
    !selectedPaciente.value 
  ) {
    toast({
      title: "Selecione clínica/doctor/paciente",
      variant: "destructive",
    });
    return;
  }
  formMode.value = "create";
  pendingStart.value = start;
  calendarRef.value?.createEvent({ start, end });
  isFormOpen.value = true;
}

async function onFormConfirm(payload: { title: string; observacoes: string }) {
  const start = pendingStart.value!;
  const end = new Date(start.getTime() + 30 * 60000);
  calendarRef.value?.createEvent({ title: payload.title, start, end });

  const body: MarcacaoCreate & { observacoes?: string } = {
    paciente_id: selectedPaciente.value!,
    medico_id: selectedMedico.value!,
    clinic_id: selectedClinic.value!.id,
    entidade_id: selectedEntity.value!,
    data_hora_inicio: toIso(start),
    data_hora_fim: toIso(end),
    titulo: payload.title,
    observacoes: payload.observacoes,
  };

  try {
    const ok = await createMarcacao(body);
    if (ok) {
      toast({ title: "Marcação criada", description: payload.title });
    } else {
      throw new Error(error.value || "Desconhecido");
    }
  } catch (err: any) {
    calendarRef.value?.deleteEvent({ title: payload.title, start, end });
    toast({
      title: "Erro ao criar",
      description: err.message,
      variant: "destructive",
    });
  }
}

function onEventClick(event: VueCalEvent, e: PointerEvent) {
  if (holdingEvent) return;
  selectedEvent.value = toRaw(event);
  formMode.value = "edit";
  isFormOpen.value = true;
}

async function onUpdateEvent({
  event,
  observacoes,
  start,
  end,
}: {
  event: VueCalEvent;
  observacoes: string;
  start?: Date;
  end?: Date;
}) {
  if (!event.id) {
    return toast({ title: "Evento sem ID", variant: "destructive" });
  }
  const payload: MarcacaoUpdate = {
    observacoes,
    ...(start ? { data_hora_inicio: start.toISOString() } : {}),
    ...(end ? { data_hora_fim: end.toISOString() } : {}),
  };

  try {
    const updated = await updateMarcacao(Number(event.id), payload);
    if (updated) {
      toast({ title: "Marcação atualizada com sucesso" });
      event.observacoes = updated.observacoes;
      if (start) event.start = start;
      if (end) event.end = end;
      fetchMarcacoes(
        selectedClinic.value?.id ?? undefined,
        selectedMedico.value ?? undefined
      );
      isFormOpen.value = false;
    } else {
      throw new Error(error.value || "Sem resposta da API");
    }
  } catch (err: any) {
    toast({
      title: "Erro ao atualizar",
      description: err.message,
      variant: "destructive",
    });
  }
}

async function onConsultaStart(event: VueCalEvent) {
  if (!event.id) {
    return toast({ title: "Evento sem ID", variant: "destructive" });
  }

  try {
    // actualiza só o estado para 'iniciada'
    const updated = await updateMarcacao(Number(event.id), {
      estado: "iniciada",
    });
    if (updated) {
      toast({ title: "Consulta iniciada" });
      // refresca ou actualiza o evento localmente
      event.estado = "iniciada";
      isFormOpen.value = false;
      fetchMarcacoes(
        selectedClinic.value?.id,
        selectedMedico.value ?? undefined
      );
    }
  } catch (err: any) {
    toast({
      title: "Erro ao iniciar",
      description: err.message,
      variant: "destructive",
    });
  }
}

async function onFailAppointment(event: VueCalEvent) {
  if (!event.id) {
    return toast({ title: "Evento sem ID", variant: "destructive" });
  }

  try {
    // actualiza só o estado para 'falta'
    const updated = await updateMarcacao(Number(event.id), { estado: "falta" });
    if (updated) {
      toast({ title: "Marcação assinalada como falta" });
      event.estado = "falta";
      isFormOpen.value = false;
      fetchMarcacoes(
        selectedClinic.value?.id,
        selectedMedico.value ?? undefined
      );
    }
  } catch (err: any) {
    toast({
      title: "Erro ao assinalar falta",
      description: err.message,
      variant: "destructive",
    });
  }
}

async function extendEvent(event: VueCalEvent) {
  // 1) compute new end
  const newEnd = new Date(event.end.getTime() + 30 * 60_000);

  // 2) check overlap _only_ against this doctor’s other events
  const conflict = events.value.some(
    (e) =>
      e.id !== event.id &&
      e.medico_id === event.medico_id &&
      // ranges [start, newEnd) intersect?
      event.start < e.end &&
      newEnd > e.start
  );
  if (conflict) {
    toast({
      title: "Erro: há outra marcação nesse horário",
      variant: "destructive",
    });
    return;
  }

  // 3) push to API
  try {
    await updateMarcacao(Number(event.id), {
      data_hora_inicio: event.start.toISOString(),
      data_hora_fim: newEnd.toISOString(),
    });
    toast({ title: "Evento estendido +30 min" });

    // 4) update the calendar UI instantly
    event.end = newEnd;
    // if you need to force VueCal to re-render, you can:
    // calendarRef.value?.updateEvent(event)
    isFormOpen.value = false;
  } catch (err: any) {
    toast({
      title: "Falha ao estender",
      description: err.message,
      variant: "destructive",
    });
  }
}

// dispara quando o utilizador confirmar a eliminação (double-click no evento)
// recebe um payload cujo campo `event` é o VueCalEvent
async function onEventDelete(event: VueCalEvent) {
  if (!event.id) {
    return toast({ title: "Evento sem ID", variant: "destructive" });
  }

  try {
    const ok = await deleteMarcacao(Number(event.id));
    if (!ok) throw new Error(error.value || "Erro ao eliminar");
    // o Vue-Cal já removeu da UI; só mostramos toast
    toast({ title: "Marcação eliminada" });
  } catch (err: any) {
    toast({
      title: "Erro ao eliminar",
      description: err.message,
      variant: "destructive",
    });
    // repõe a lista caso falhe
    fetchMarcacoes(selectedClinic.value?.id, selectedMedico.value ?? undefined);
  }
}

function logEvents(e: PointerEvent, calEvent: VueCalEvent) {
  console.log("Calendar Event:", calEvent);
  console.log("Pointer Event:", e);
}
async function onEventResizeEnd({ event }: { event: VueCalEvent }) {
  try {
    console.log("onEventResizeEnd", event);
    await updateMarcacao(Number(event.id), {
      data_hora_inicio: event.start.toISOString(),
      data_hora_fim: event.end.toISOString(),
    });
    toast({ title: "Marcação atualizada" });
  } catch (err: any) {
    toast({ title: "Erro ao salvar resize", variant: "destructive" });
    // optionally you could refetch events to roll back UI
  }
}
async function onSavePaciente() {
  fetchPacientes(selectedClinic.value?.id ?? undefined);
  formPacient.value = false;
  toast({ title: "Paciente salvo com sucesso" });
  selectedPaciente.value = null;
  selectedEntity.value = null;
}
</script>

<template>
  <div class="calendar-page">
    <div class="vuecal__event hidden"></div>
    <!-- <div class="flex items-center justify-between">
      <MarcacoesSelectorMarcacoes
        v-model:selectedPaciente="selectedPaciente"
        v-model:selectedEntity="selectedEntity"
        v-model:selectedMedico="selectedMedico"
      />
      <Button @click="formPacient = true" class="mt-8 mr-2">
        <Plus class="mr-2 h-4 w-4" /> Novo Paciente
      </Button>
    </div> -->

    <ClientOnly>
      <vue-cal
        class="vuecal"
        ref="calendarRef"
        locale="pt-br"
        :time-step="30"
        time-at-cursor
        :time-from="8 * 60"
        :time-to="18 * 60"
        :views="calendarViews"
        :events="events"
        :min-event-width="0"
        :editable-events="{
          create: false,
          drag: false,
          resize: true,
          delete: true,
        }"
        @cell-dblclick="null"
        @event-click="onEventClick"
        @event-resize-end="null"
        @event-delete="null"
      >
        <template #event="{ event }">
          <div class="p-2">
            <div class="truncate">
              {{ event.title }} – {{ event.paciente.telefone }}
              {{ event.observacoes }}
            </div>
          </div>
        </template>
      </vue-cal>
    </ClientOnly>
    <MarcacoesForm
      v-model="isFormOpen"
      :mode="formMode"
      :defaultTitle="pacienteName"
      :defaultStart="pendingStart"
      :defaultEnd="defaultEnd"
      :eventData="selectedEvent"
      @confirm="onFormConfirm"
      @update-event="null"
      @extend-event="null"
      @consulta-start="null"
      @fail-appointment="null"
    />
    <!-- <PatientsForm v-model:open="formPacient" @saved="onSavePaciente" /> -->
  </div>
</template>
