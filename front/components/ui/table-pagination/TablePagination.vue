<script setup lang="ts">
import { computed } from "vue";
import { ChevronLeft, ChevronRight } from "lucide-vue-next";

interface Props {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  pageSizeOptions?: number[];
}

const props = withDefaults(defineProps<Props>(), {
  pageSizeOptions: () => [5, 10, 20, 50, 100],
});

const emit = defineEmits<{
  (e: "update:currentPage", value: number): void;
  (e: "update:pageSize", value: number): void;
}>();

const pageCount = computed(() =>
  Math.max(1, Math.ceil(props.totalItems / props.pageSize))
);

const startItem = computed(() =>
  props.totalItems === 0 ? 0 : (props.currentPage - 1) * props.pageSize + 1
);

const endItem = computed(() =>
  Math.min(props.currentPage * props.pageSize, props.totalItems)
);

function goToPage(page: number) {
  emit("update:currentPage", page);
}

function previousPage() {
  if (props.currentPage > 1) {
    goToPage(props.currentPage - 1);
  }
}

function nextPage() {
  if (props.currentPage < pageCount.value) {
    goToPage(props.currentPage + 1);
  }
}

function updatePageSize(newSize: number) {
  emit("update:pageSize", newSize);
  // Reset to page 1 when changing page size
  emit("update:currentPage", 1);
}
</script>

<template>
  <div class="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
    <!-- Items count -->
    <div class="text-sm text-muted-foreground">
      <template v-if="totalItems > 0">
        Mostrando {{ startItem }}–{{ endItem }} de {{ totalItems }}
        {{ totalItems === 1 ? "item" : "itens" }}
      </template>
      <template v-else> Nenhum item encontrado </template>
    </div>

    <!-- Pagination controls -->
    <div class="flex items-center space-x-2">
      <!-- Previous button -->
      <Button
        variant="outline"
        size="sm"
        :disabled="currentPage === 1"
        @click="previousPage"
        class="h-8 w-8 p-0"
      >
        <ChevronLeft class="h-4 w-4" />
        <span class="sr-only">Página anterior</span>
      </Button>

      <!-- Page indicator -->
      <div class="text-sm font-medium min-w-[100px] text-center">
        Página {{ currentPage }} de {{ pageCount }}
      </div>

      <!-- Next button -->
      <Button
        variant="outline"
        size="sm"
        :disabled="currentPage === pageCount"
        @click="nextPage"
        class="h-8 w-8 p-0"
      >
        <ChevronRight class="h-4 w-4" />
        <span class="sr-only">Próxima página</span>
      </Button>

      <!-- Page size selector -->
      <Select
        :model-value="pageSize.toString()"
        @update:model-value="updatePageSize(Number($event))"
      >
        <SelectTrigger class="h-8 w-[70px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            v-for="size in pageSizeOptions"
            :key="size"
            :value="size.toString()"
          >
            {{ size }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>
</template>
