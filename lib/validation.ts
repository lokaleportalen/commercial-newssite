/**
 * Zod validation schemas for API endpoints
 * Provides centralized, type-safe input validation
 */

import { z } from "zod";

// ============================================================================
// Article Schemas
// ============================================================================

/**
 * Article status enum
 */
export const articleStatusSchema = z.enum(["draft", "published", "archived"]);

/**
 * Schema for creating a new article (POST /api/admin/articles)
 */
export const createArticleSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be 200 characters or less")
    .trim(),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(200, "Slug must be 200 characters or less")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase alphanumeric with hyphens"
    )
    .trim(),
  content: z
    .string()
    .min(1, "Content is required")
    .max(50000, "Content must be 50000 characters or less"),
  summary: z
    .string()
    .max(500, "Summary must be 500 characters or less")
    .optional()
    .nullable(),
  metaDescription: z
    .string()
    .max(160, "Meta description must be 160 characters or less")
    .optional()
    .nullable(),
  image: z
    .union([z.string().url("Image must be a valid URL"), z.literal("")])
    .optional()
    .nullable(),
  sources: z
    .union([
      z.array(z.union([z.string().url(), z.literal("")])), // Allow empty strings in sources
      z.string(), // Allow string that will be split into array
    ])
    .optional(),
  categories: z.array(z.string().uuid("Each category must be a valid UUID")).optional(),
  status: articleStatusSchema.optional().default("draft"),
});

/**
 * Schema for updating an article (PUT /api/admin/articles/[id])
 */
export const updateArticleSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be 200 characters or less")
    .trim()
    .optional(),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(200, "Slug must be 200 characters or less")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase alphanumeric with hyphens"
    )
    .trim()
    .optional(),
  content: z
    .string()
    .min(1, "Content is required")
    .max(50000, "Content must be 50000 characters or less")
    .optional(),
  summary: z
    .string()
    .max(500, "Summary must be 500 characters or less")
    .optional()
    .nullable(),
  metaDescription: z
    .string()
    .max(160, "Meta description must be 160 characters or less")
    .optional()
    .nullable(),
  image: z
    .union([z.string().url("Image must be a valid URL"), z.literal("")])
    .optional()
    .nullable(),
  sources: z
    .union([
      z.array(z.union([z.string().url(), z.literal("")])), // Allow empty strings in sources
      z.string(), // Allow string that will be split into array
    ])
    .optional()
    .nullable(),
  categories: z.array(z.string().uuid("Each category must be a valid UUID")).optional(),
  status: articleStatusSchema.optional(),
});

/**
 * Schema for article image regeneration (POST /api/admin/articles/[id]/regenerate-image)
 */
export const regenerateImageSchema = z.object({
  customDescription: z
    .string()
    .max(500, "Custom description must be 500 characters or less")
    .optional(),
});

/**
 * Schema for article image selection (POST /api/admin/articles/[id]/select-image)
 */
export const selectImageSchema = z.object({
  selectedImage: z.enum(["original", "new"], {
    required_error: "Selected image must be 'original' or 'new'",
  }),
  rejectedImageUrl: z
    .string()
    .url("Rejected image URL must be valid")
    .optional()
    .nullable(),
});

// ============================================================================
// Category Schemas
// ============================================================================

/**
 * Schema for creating a new category (POST /api/admin/categories)
 */
export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(100, "Category name must be 100 characters or less")
    .trim(),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100, "Slug must be 100 characters or less")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase alphanumeric with hyphens"
    )
    .trim(),
  description: z
    .string()
    .max(500, "Description must be 500 characters or less")
    .optional()
    .nullable(),
  heroImage: z.string().url("Hero image must be a valid URL").optional().nullable(),
});

/**
 * Schema for updating a category (PUT /api/admin/categories/[id])
 */
export const updateCategorySchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(100, "Category name must be 100 characters or less")
    .trim()
    .optional(),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100, "Slug must be 100 characters or less")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase alphanumeric with hyphens"
    )
    .trim()
    .optional(),
  description: z
    .string()
    .max(500, "Description must be 500 characters or less")
    .optional()
    .nullable(),
  heroImage: z.string().url("Hero image must be a valid URL").optional().nullable(),
});

// ============================================================================
// User Preference Schemas
// ============================================================================

/**
 * Email frequency enum
 */
export const emailFrequencySchema = z.enum(["immediate", "weekly", "none"]);

/**
 * Schema for updating user preferences (PUT /api/user/preferences)
 */
export const updateUserPreferencesSchema = z.object({
  allCategories: z.boolean().optional(),
  emailFrequency: emailFrequencySchema.optional(),
  categories: z.array(z.string().uuid("Each category must be a valid UUID")).optional(),
});

// ============================================================================
// Email Schemas
// ============================================================================

/**
 * Schema for unsubscribe token
 */
export const unsubscribeTokenSchema = z.object({
  token: z.string().min(1, "Unsubscribe token is required"),
});

/**
 * Schema for manual article notification trigger
 */
export const triggerNotificationSchema = z.object({
  articleId: z.string().uuid("Article ID must be a valid UUID"),
});

// ============================================================================
// Upload Schemas
// ============================================================================

/**
 * Schema for file upload validation
 */
export const uploadFileSchema = z.object({
  filename: z
    .string()
    .min(1, "Filename is required")
    .max(255, "Filename must be 255 characters or less")
    .regex(/\.(jpg|jpeg|png|webp|gif)$/i, "Invalid file extension"),
});

// ============================================================================
// Search/Query Schemas
// ============================================================================

/**
 * Schema for article search query
 */
export const articleSearchSchema = z.object({
  search: z.string().max(200, "Search query too long").optional(),
  status: articleStatusSchema.optional(),
  category: z.string().uuid("Category must be a valid UUID").optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

// ============================================================================
// Helper Types
// ============================================================================

export type CreateArticleInput = z.infer<typeof createArticleSchema>;
export type UpdateArticleInput = z.infer<typeof updateArticleSchema>;
export type RegenerateImageInput = z.infer<typeof regenerateImageSchema>;
export type SelectImageInput = z.infer<typeof selectImageSchema>;

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

export type UpdateUserPreferencesInput = z.infer<typeof updateUserPreferencesSchema>;

export type TriggerNotificationInput = z.infer<typeof triggerNotificationSchema>;

export type ArticleSearchInput = z.infer<typeof articleSearchSchema>;

// ============================================================================
// Validation Helper Function
// ============================================================================

/**
 * Helper function to validate data and format errors
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validation result with typed data or formatted errors
 */
export function validateSchema<T extends z.ZodType>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  // Format Zod errors into readable messages
  const errors = result.error.errors.map((err) => {
    const path = err.path.join(".");
    return path ? `${path}: ${err.message}` : err.message;
  });

  return { success: false, errors };
}
