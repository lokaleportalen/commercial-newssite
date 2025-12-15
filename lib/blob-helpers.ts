import { del } from "@vercel/blob";

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
