<script setup lang="ts">
import { usePacientes } from "~/composables/usePacientes";
import { useEntidades } from "~/composables/useEntidades";
import { useUtilizadores } from "~/composables/useUtilizadores";
import type { PacienteMinimal } from "~/types/pacientes";
import type { Entidade } from "~/types/entidade";
import type { UtilizadorResponse } from "~/types/utilizador";


// recebe por v-model
const props = defineProps({
  selectedPaciente: { type: Number as () => number | null, default: null },
  selectedEntity: { type: Number as () => number | null, default: null },
  selectedMedico: { type: Number as () => number | null, default: null },
});
const emit = defineEmits([
  "update:selectedPaciente",
  "update:selectedEntity",
  "update:selectedMedico",
]);

// Composables
const selectedClinic = useState<any>("selectedClinic");
const { pacientes, fetchPacientes } = usePacientes();
const { entidades, fetchEntidades } = useEntidades();
const { users, fetchMedicosByClinica } = useUtilizadores();

// sempre que trocar de clínica recarrega as listas
watch(
  selectedClinic,
  (c) => {
    if (!c) return;
    fetchPacientes(c.id);
    fetchEntidades();
    fetchMedicosByClinica(c.id);
  },
  { immediate: true }
);

// computed para options
const pacienteOptions = computed(() =>
  pacientes.value.map((p: PacienteMinimal) => ({ value: p.id, label: p.nome }))
);
const entityOptions = computed(() =>
  entidades.value.map((e: Entidade) => ({ value: e.id, label: e.nome }))
);
const medicoOptions = computed(() =>
  users.value.map((m: UtilizadorResponse) => ({ value: m.id, label: m.nome }))
);

// criar getters/setters para v-model
const localPaciente = computed<number | null>({
  get: () => props.selectedPaciente,
  set: (v) => emit("update:selectedPaciente", v),
});
const localEntity = computed<number | null>({
  get: () => props.selectedEntity,
  set: (v) => emit("update:selectedEntity", v),
});
const localMedico = computed<number | null>({
  get: () => props.selectedMedico,
  set: (v) => emit("update:selectedMedico", v),
});
</script>

<template>
  <div class="flex gap-4 p-4">
    <FormField name="paciente">
      <FormItem>
        <FormLabel>Paciente</FormLabel>
        <Select v-model="localPaciente">
          <SelectTrigger as="button" class="w-full justify-between">
            {{
              pacienteOptions.find((o) => o.value === localPaciente)?.label ||
              "Selecione…"
            }}
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem
                v-for="opt in pacienteOptions"
                :key="opt.value"
                :value="opt.value"
                >{{ opt.label }}</SelectItem
              >
            </SelectGroup>
          </SelectContent>
        </Select>
      </FormItem>
    </FormField>
    <FormField name="entidade">
      <FormItem>
        <FormLabel>Entidade</FormLabel>
        <Select v-model="localEntity">
          <SelectTrigger as="button" class="w-full justify-between">
            {{
              entityOptions.find((o) => o.value === localEntity)?.label ||
              "Selecione…"
            }}
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem
                v-for="opt in entityOptions"
                :key="opt.value"
                :value="opt.value"
                >{{ opt.label }}</SelectItem
              >
            </SelectGroup>
          </SelectContent>
        </Select>
      </FormItem>
    </FormField>
    <FormField name="medico">
      <FormItem>
        <FormLabel>Doctor</FormLabel>
        <Select v-model="localMedico">
          <SelectTrigger as="button" class="w-full justify-between">
            {{
              medicoOptions.find((o) => o.value === localMedico)?.label ||
              "Selecione…"
            }}
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem
                v-for="opt in medicoOptions"
                :key="opt.value"
                :value="opt.value"
                >{{ opt.label }}</SelectItem
              >
            </SelectGroup>
          </SelectContent>
        </Select>
      </FormItem>
    </FormField>
    
  </div>
</template>
