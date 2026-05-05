import type { AggregatedIngredient, RecipeDto } from "~/shared/types/domain";

export function aggregateIngredientsFromRecipes(
  recipes: Pick<RecipeDto, "ingredients">[],
): AggregatedIngredient[] {
  const map = new Map<string, AggregatedIngredient>();

  for (const recipe of recipes) {
    for (const item of recipe.ingredients) {
      const current = map.get(item.ingredient.id);

      if (current) {
        current.amount += item.amount;
        continue;
      }

      map.set(item.ingredient.id, {
        ingredientId: item.ingredient.id,
        name: item.ingredient.name,
        categoryName: item.ingredient.categoryName,
        unit: item.ingredient.unit.shortName,
        amount: item.amount,
      });
    }
  }

  return Array.from(map.values()).sort((left, right) =>
    left.categoryName.localeCompare(right.categoryName, "ru"),
  );
}
