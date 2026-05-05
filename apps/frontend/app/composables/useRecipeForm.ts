import { z } from "zod";

export const recipeSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(2000).optional(),
  cookingTime: z.number().int().positive(),
  servings: z.number().int().positive(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  ingredients: z.array(
    z.object({
      ingredientId: z.string().min(1),
      amount: z.number().positive(),
    }),
  ),
});

export type RecipeFormValues = z.infer<typeof recipeSchema>;

export function useRecipeForm(initial?: Partial<RecipeFormValues>) {
  const values = reactive<RecipeFormValues>({
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    cookingTime: initial?.cookingTime ?? 30,
    servings: initial?.servings ?? 2,
    difficulty: initial?.difficulty ?? "easy",
    ingredients: initial?.ingredients ?? [],
  });

  const errors = ref<Record<string, string>>({});

  function validate() {
    const result = recipeSchema.safeParse(values);
    errors.value = {};

    if (!result.success) {
      for (const issue of result.error.issues) {
        errors.value[issue.path.join(".")] = issue.message;
      }
    }

    return result.success;
  }

  return { values, errors, validate };
}
