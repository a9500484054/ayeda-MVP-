// apps/frontend/app/composables/useDate.ts
export const useDate = () => {
  const currentYear = computed(() => new Date().getFullYear());

  return {
    currentYear
  };
};
