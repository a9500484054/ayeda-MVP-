import { describe, expect, it } from "vitest";
import { aggregateIngredientsFromRecipes } from "../../app/utils/aggregateIngredients";
import type { RecipeDto } from "../../app/shared/types/domain";

const unit = { id: "g", code: "gram", name: "грамм", shortName: "г", type: "mass" as const };

describe("aggregateIngredientsFromRecipes", () => {
  it("sums ingredients with the same id", () => {
    const recipes = [
      {
        ingredients: [
          { ingredient: { id: "rice", code: "rice", name: "Рис", categoryName: "Бакалея", unit }, amount: 100 },
        ],
      },
      {
        ingredients: [
          { ingredient: { id: "rice", code: "rice", name: "Рис", categoryName: "Бакалея", unit }, amount: 50 },
        ],
      },
    ] satisfies Pick<RecipeDto, "ingredients">[];

    expect(aggregateIngredientsFromRecipes(recipes)).toEqual([
      {
        ingredientId: "rice",
        name: "Рис",
        categoryName: "Бакалея",
        unit: "г",
        amount: 150,
      },
    ]);
  });
});
