import type { CommentDto, RecipeDto } from "~/shared/types/domain";

const unit = { id: "g", code: "gram", name: "грамм", shortName: "г", type: "mass" as const };

export const demoRecipes: RecipeDto[] = [
  {
    id: "1",
    srcPath: "syrniki",
    title: "Сырники с ягодами",
    description: "Быстрый завтрак из творога с мягкой текстурой и понятным составом.",
    imageUrl: "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=1200&q=80",
    status: "published",
    difficulty: "easy",
    cookingTime: 25,
    servings: 2,
    category: { id: "breakfast", code: "breakfast", name: "Завтраки" },
    author: { id: "u1", username: "ayeda" },
    ingredients: [
      { ingredient: { id: "curd", code: "curd", name: "Творог", categoryName: "Молочные продукты", unit }, amount: 360 },
      { ingredient: { id: "flour", code: "flour", name: "Мука", categoryName: "Бакалея", unit }, amount: 60 },
    ],
    steps: [
      { id: "s1", order: 1, text: "Смешайте творог, муку и яйцо." },
      { id: "s2", order: 2, text: "Сформируйте сырники и обжарьте до золотистой корочки." },
    ],
    likesCount: 128,
    commentsCount: 12,
    createdAt: "2026-02-24T10:00:00.000Z",
  },
  {
    id: "2",
    srcPath: "chicken-bowl",
    title: "Боул с курицей",
    description: "Сбалансированный обед с крупой, овощами и белком.",
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80",
    status: "published",
    difficulty: "medium",
    cookingTime: 40,
    servings: 2,
    category: { id: "lunch", code: "lunch", name: "Обеды" },
    author: { id: "u1", username: "ayeda" },
    ingredients: [
      { ingredient: { id: "chicken", code: "chicken", name: "Куриное филе", categoryName: "Мясо", unit }, amount: 400 },
      { ingredient: { id: "rice", code: "rice", name: "Рис", categoryName: "Бакалея", unit }, amount: 180 },
    ],
    steps: [
      { id: "s1", order: 1, text: "Отварите рис и подготовьте овощи." },
      { id: "s2", order: 2, text: "Обжарьте курицу и соберите боул." },
    ],
    likesCount: 86,
    commentsCount: 7,
    createdAt: "2026-02-22T10:00:00.000Z",
  },
];

export const demoComments: CommentDto[] = [
  {
    id: "c1",
    recipeId: "1",
    author: { id: "u2", username: "maria" },
    text: "Получилось стабильно по граммовкам, добавила меньше муки.",
    isHidden: false,
    createdAt: "2026-02-25T12:00:00.000Z",
  },
];
