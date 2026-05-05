import type { MealType, MenuSlotDto, RecipeDto } from "~/shared/types/domain";
import { aggregateIngredientsFromRecipes } from "~/utils/aggregateIngredients";
import { useApi } from "./useApi";

export function useMenuPlanner() {
  const slots = ref<MenuSlotDto[]>([]);
  const api = useApi();

  function addRecipeToSlot(recipeId: string, menuListId: string, date: string, mealType: MealType) {
    slots.value.push({
      id: crypto.randomUUID(),
      menuListId,
      recipeId,
      date,
      mealType,
    });
  }

  function removeSlot(slotId: string) {
    slots.value = slots.value.filter((slot) => slot.id !== slotId);
  }

  async function generateShoppingList(menuListId: string) {
    const recipeIds = slots.value
      .filter((slot) => slot.menuListId === menuListId)
      .map((slot) => slot.recipeId);
    const recipes = await Promise.all(
      recipeIds.map((recipeId) => api<RecipeDto>(`/recipes/${recipeId}`)),
    );
    const items = aggregateIngredientsFromRecipes(recipes);

    return await api("/shopping-lists", {
      method: "POST",
      body: { menuListId, items },
    });
  }

  return { slots, addRecipeToSlot, removeSlot, generateShoppingList };
}
