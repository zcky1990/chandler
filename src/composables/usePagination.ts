import { computed, ref, watch, type ComputedRef, type Ref } from 'vue'

export const PAGE_SIZE_OPTIONS = [10, 20, 50] as const

export function usePagination<T>(
  items: Ref<T[]> | ComputedRef<T[]>,
  resetDeps: Array<Ref<unknown>> = [],
) {
  const currentPage = ref(1)
  const pageSize = ref<number>(PAGE_SIZE_OPTIONS[1])

  const totalCount = computed(() => items.value.length)

  const totalPages = computed(() =>
    Math.max(1, Math.ceil(totalCount.value / pageSize.value)),
  )

  const paginatedItems = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return items.value.slice(start, start + pageSize.value)
  })

  const paginationFrom = computed(() => {
    if (!totalCount.value) return 0
    return (currentPage.value - 1) * pageSize.value + 1
  })

  const paginationTo = computed(() =>
    Math.min(currentPage.value * pageSize.value, totalCount.value),
  )

  function goToPage(page: number) {
    currentPage.value = Math.min(Math.max(1, page), totalPages.value)
  }

  watch([pageSize, ...resetDeps], () => {
    currentPage.value = 1
  })

  watch(totalPages, (pages) => {
    if (currentPage.value > pages) {
      currentPage.value = pages
    }
  })

  return {
    currentPage,
    pageSize,
    totalCount,
    totalPages,
    paginatedItems,
    paginationFrom,
    paginationTo,
    goToPage,
    PAGE_SIZE_OPTIONS,
  }
}
