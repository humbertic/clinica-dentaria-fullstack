<script setup lang="ts">
import { cn } from "@/lib/utils";
import {
  DateFormatter,
  type DateValue,
  getLocalTimeZone,
  parseDate,
} from "@internationalized/date";
import { CalendarIcon } from "lucide-vue-next";
import { ref, watch, computed } from "vue";

const props = defineProps<{
  modelValue?: DateValue | null;
  minValue?: DateValue;
  maxValue?: DateValue;
  yearSort?: "asc" | "desc";
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: DateValue | null): void;
}>();

const df = new DateFormatter("pt-PT", { dateStyle: "long" });
const value = ref<DateValue | null>(props.modelValue ?? null);

const minYear = computed(() =>
  props.minValue
    ? props.minValue.toDate(getLocalTimeZone()).getFullYear()
    : new Date().getFullYear() - 100
);
const maxYear = computed(() =>
  props.maxValue
    ? props.maxValue.toDate(getLocalTimeZone()).getFullYear()
    : new Date().getFullYear() + 9
);

const calendarYear = ref(
  value.value?.toDate(getLocalTimeZone()).getFullYear() ??
    new Date().getFullYear()
);
const calendarMonth = ref(
  value.value?.toDate(getLocalTimeZone()).getMonth() ?? new Date().getMonth()
);

const calendarPlaceholder = computed(() => {
  const y = calendarYear.value;
  const m = calendarMonth.value + 1;
  return parseDate(`${y}-${String(m).padStart(2, "0")}-01`);
});

watch(
  () => props.modelValue,
  (val) => {
    value.value = val ?? null;
    if (val) {
      calendarYear.value = val.toDate(getLocalTimeZone()).getFullYear();
      calendarMonth.value = val.toDate(getLocalTimeZone()).getMonth();
    }
  }
);
watch(value, (val) => {
  emit("update:modelValue", val ?? null);
  if (val) {
    calendarYear.value = val.toDate(getLocalTimeZone()).getFullYear();
    calendarMonth.value = val.toDate(getLocalTimeZone()).getMonth();
  }
});

const years = computed(() => {
  const arr = Array.from(
    { length: maxYear.value - minYear.value + 1 },
    (_, i) => minYear.value + i
  );
  return props.yearSort === "desc" ? arr.reverse() : arr;
});

const months = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

// Only show allowed months for the selected year
const allowedMonths = computed(() => {
  let start = 0;
  let end = 11;
  if (
    props.minValue &&
    calendarYear.value === props.minValue.toDate(getLocalTimeZone()).getFullYear()
  ) {
    start = props.minValue.toDate(getLocalTimeZone()).getMonth();
  }
  if (
    props.maxValue &&
    calendarYear.value === props.maxValue.toDate(getLocalTimeZone()).getFullYear()
  ) {
    end = props.maxValue.toDate(getLocalTimeZone()).getMonth();
  }
  return months.map((m, i) => ({ label: m, value: i })).filter(m => m.value >= start && m.value <= end);
});

function setYear(year: number | string | null) {
  if (typeof year === 'string') year = Number(year);
  if (typeof year === 'number') {
    calendarYear.value = year;
    // Adjust month if out of allowed range for new year
    const monthRange = allowedMonths.value.map(m => m.value);
    if (!monthRange.includes(calendarMonth.value)) {
      calendarMonth.value = monthRange[0];
    }
  }
}
function setMonth(month: number | string | null) {
  if (typeof month === 'string') month = Number(month);
  if (typeof month === 'number') {
    calendarMonth.value = month;
  }
}
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button
        variant="outline"
        :class="
          cn(
            'w-full justify-start text-left font-normal',
            !value && 'text-muted-foreground'
          )
        "
      >
        <CalendarIcon class="mr-2 h-4 w-4" />
        {{
          value
            ? df.format(value.toDate(getLocalTimeZone()))
            : "Selecionar data"
        }}
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-auto p-0">
      <div class="flex justify-between gap-2 p-2">
        <Select :modelValue="calendarMonth" @update:modelValue="setMonth">
          <SelectTrigger>
            <SelectValue :placeholder="months[calendarMonth]" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="m in allowedMonths" :key="m.value" :value="m.value">
              {{ m.label }}
            </SelectItem>
          </SelectContent>
        </Select>
        <Select :modelValue="calendarYear" @update:modelValue="setYear">
          <SelectTrigger>
            <SelectValue :placeholder="String(calendarYear)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="y in years" :key="y" :value="y">
              {{ y }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Calendar
        v-model="value"
        :placeholder="calendarPlaceholder"
        :minValue="minValue"
        :maxValue="maxValue"
        initial-focus
      />
    </PopoverContent>
  </Popover>
</template>