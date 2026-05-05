import type { MealType, MenuListDto, MenuSlotDto } from "~/shared/types/domain";

export const useMenuPlannerStore = defineStore("menuPlanner", () => {
  const menuLists = ref<MenuListDto[]>([
    { id: "family", title: "Семейное меню", weekStart: "2026-03-09" },
  ]);
  const activeMenuListId = ref("family");
  const slots = ref<MenuSlotDto[]>([]);

  const activeMenuList = computed(
    () => menuLists.value.find((list) => list.id === activeMenuListId.value) ?? null,
  );

  function addMenuList(title: string) {
    const id = crypto.randomUUID();
    menuLists.value.push({ id, title, weekStart: new Date().toISOString().slice(0, 10) });
    activeMenuListId.value = id;
  }

  function addSlot(recipeId: string, date: string, mealType: MealType) {
    slots.value.push({
      id: crypto.randomUUID(),
      menuListId: activeMenuListId.value,
      recipeId,
      date,
      mealType,
    });
  }

  return { menuLists, activeMenuListId, activeMenuList, slots, addMenuList, addSlot };
});
