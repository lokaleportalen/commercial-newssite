export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  heroImage?: string | null;
  articleCount?: number;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary: string | null;
  metaDescription: string | null;
  image: string | null;
  sourceUrl?: string | null;
  sources?: string[] | null;
  categories?: Category[];
  status: string;
  publishedDate: Date;
  createdAt: Date;
  updatedAt: Date;
  promptId?: string | null;
}

export interface ArticleWithCategories extends Article {
  categories: Category[];
}

export type ArticlePreview = Pick<
  Article,
  "id" | "title" | "slug" | "summary" | "image" | "publishedDate"
>;

export type ArticleCreate = Omit<Article, "id" | "createdAt" | "updatedAt">;

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface UserPreferences {
  emailFrequency: "immediate" | "weekly" | "none";
  allCategories: boolean;
  categories: Category[];
}

export interface UserWithPreferences extends User {
  preferences: UserPreferences;
}

export type EmailFrequency = "immediate" | "weekly" | "none";

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
