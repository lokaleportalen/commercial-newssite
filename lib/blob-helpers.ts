import { del } from "@vercel/blob";

/**
 * Delete a blob image from Vercel Blob storage
 * Only deletes if the URL is a vercel-storage.com URL
 */
export async function deleteBlobImage(imageUrl: string | null): Promise<void> {
  if (!imageUrl) {
    return;
  }

  // Only delete if it's a Vercel Blob URL
  if (imageUrl.includes("vercel-storage.com")) {
    try {
      await del(imageUrl);
      console.log(`✓ Deleted blob image: ${imageUrl}`);
    } catch (error) {
      console.error("Failed to delete blob image:", error);
      throw error;
    }
  } else {
    console.log(
      `Skipping deletion - not a Vercel Blob URL: ${imageUrl}`
    );
  }
}

/**
 * Delete a blob image (non-throwing version)
 * Logs errors but doesn't throw - useful for cleanup operations
 */
export async function deleteBlobImageSafe(
  imageUrl: string | null
): Promise<boolean> {
  try {
    await deleteBlobImage(imageUrl);
    return true;
  } catch (error) {
    console.error("Error in deleteBlobImageSafe:", error);
    return false;
  }
}
