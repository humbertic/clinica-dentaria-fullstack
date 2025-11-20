import { ref, computed, watch, type Ref } from "vue";

interface UsePaginationOptions {
  initialPageSize?: number;
  initialPage?: number;
}

export function usePagination<T>(
  items: Ref<T[]>,
  options: UsePaginationOptions = {}
) {
  const { initialPageSize = 10, initialPage = 1 } = options;

  const currentPage = ref(initialPage);
  const pageSize = ref(initialPageSize);

  // Reset to page 1 when items change
  watch(
    () => items.value.length,
    () => {
      if (currentPage.value > 1) {
        const maxPage = Math.ceil(items.value.length / pageSize.value);
        if (currentPage.value > maxPage) {
          currentPage.value = Math.max(1, maxPage);
        }
      }
    }
  );

  const paginatedItems = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return items.value.slice(start, end);
  });

  const totalItems = computed(() => items.value.length);

  const pageCount = computed(() =>
    Math.max(1, Math.ceil(items.value.length / pageSize.value))
  );

  return {
    currentPage,
    pageSize,
    paginatedItems,
    totalItems,
    pageCount,
  };
}
