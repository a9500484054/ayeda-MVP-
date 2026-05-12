export type UserRole = "user" | "moderator" | "admin";
export type RecipeStatus = "draft" | "pending" | "published" | "rejected";
export type Difficulty = "easy" | "medium" | "hard";
export type MealType = "breakfast" | "lunch" | "dinner";

export interface UserDto {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  bio?: string;
}

export interface CategoryDto {
  id: string;
  code: string;
  name: string;
  description?: string;
}

export interface UnitDto {
  id: string;
  code: string;
  name: string;
  shortName: string;
  type: "mass" | "volume" | "piece";
}

export interface IngredientDto {
  id: string;
  code: string;
  name: string;
  categoryName: string;
  unit: UnitDto;
}

export interface RecipeIngredientDto {
  ingredient: IngredientDto;
  amount: number;
}

export interface RecipeStepDto {
  id: string;
  order: number;
  text: string;
  imageUrl?: string;
}

export interface RecipeDto {
  id: string;
  srcPath: string;
  title: string;
  description: string;
  imageUrl: string;
  status: RecipeStatus;
  difficulty: Difficulty;
  cookingTime: number;
  servings: number;
  category: CategoryDto;
  author: Pick<UserDto, "id" | "username">;
  ingredients: RecipeIngredientDto[];
  steps: RecipeStepDto[];
  likesCount: number;
  commentsCount: number;
  createdAt: string;
}

export interface CommentDto {
  id: string;
  recipeId: string;
  author: Pick<UserDto, "id" | "username" | "avatarUrl">;
  text: string;
  isHidden: boolean;
  createdAt: string;
}

export interface MenuListDto {
  id: string;
  title: string;
  weekStart: string;
}

export interface MenuSlotDto {
  id: string;
  menuListId: string;
  recipeId: string;
  date: string;
  mealType: MealType;
}

export interface AggregatedIngredient {
  ingredientId: string;
  name: string;
  categoryName: string;
  unit: string;
  amount: number;
}

export interface ShoppingListItemDto extends AggregatedIngredient {
  id: string;
  checked: boolean;
}

export interface ShoppingListDto {
  id: string;
  title: string;
  menuListId?: string;
  archived: boolean;
  items: ShoppingListItemDto[];
}


// Добавьте эти типы в ваш существующий файл

export interface LikeDto {
  id: string;
  recipeId: string;
  userId: string;
  createdAt: string;
}

export interface LikeStatusResponse {
  liked: boolean;
  likesCount: number;
}

export interface FavoriteStatusResponse {
  isFavorite: boolean;
}

export interface FavoriteRecipe {
  id: string;
  title: string;
  // ... другие поля рецепта
}

export interface CommentAuthor {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  bio: string;
  avatar: string;
  isEmailVerified: boolean;
  role: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
}

export interface CommentDto {
  id: string;
  text: string;
  recipeId: string;
  author: CommentAuthor;
  isHidden: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CommentsResponse {
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
  items?: CommentDto[];
}

export interface CreateCommentDto {
  text: string;
}

export interface UpdateCommentDto {
  text: string;
}
