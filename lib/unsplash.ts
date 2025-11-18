import { createApi } from "unsplash-js";

// Initialize Unsplash API client
// Documentation: https://github.com/unsplash/unsplash-js
const unsplash = createApi({
  accessKey: process.env.UNSPLASH_ACCESS_KEY || "",
});

export interface UnsplashImageData {
  id: string;
  url: string; // Full quality image URL
  unsplashUrl: string; // Link to photo page on Unsplash
  photographerName: string;
  photographerUsername: string;
  photographerUrl: string;
  downloadLocation: string; // Required for download tracking
  description: string | null;
}

/**
 * Search Unsplash for images matching the given keywords
 * Returns the best match or null if no results found
 *
 * @param keywords - Search terms (e.g., "commercial real estate denmark")
 * @param orientation - Optional image orientation filter
 * @returns Image data or null if not found
 */
export async function searchUnsplashImage(
  keywords: string,
  orientation: "landscape" | "portrait" | "squarish" = "landscape"
): Promise<UnsplashImageData | null> {
  if (!process.env.UNSPLASH_ACCESS_KEY) {
    console.error("UNSPLASH_ACCESS_KEY not configured");
    return null;
  }

  try {
    console.log(`Searching Unsplash for: "${keywords}"`);

    const result = await unsplash.search.getPhotos({
      query: keywords,
      page: 1,
      perPage: 1, // We only need the best match
      orientation,
    });

    if (result.errors) {
      console.error("Unsplash API errors:", result.errors);
      return null;
    }

    const photos = result.response?.results;

    if (!photos || photos.length === 0) {
      console.log(`No images found for: "${keywords}"`);
      return null;
    }

    const photo = photos[0];

    // Trigger download tracking (required by Unsplash API terms)
    // This doesn't actually download the image, just tracks usage
    if (photo.links.download_location) {
      await trackDownload(photo.links.download_location);
    }

    return {
      id: photo.id,
      url: photo.urls.regular, // High quality but not full size (saves bandwidth)
      unsplashUrl: photo.links.html, // Link to photo page on Unsplash
      photographerName: photo.user.name,
      photographerUsername: photo.user.username,
      photographerUrl: photo.user.links.html,
      downloadLocation: photo.links.download_location,
      description: photo.description || photo.alt_description || null,
    };
  } catch (error) {
    console.error("Error searching Unsplash:", error);
    return null;
  }
}

/**
 * Track image download with Unsplash (required by API terms)
 * This doesn't download the image, it just notifies Unsplash that we're using it
 *
 * @param downloadLocation - The download_location URL from the photo object
 */
async function trackDownload(downloadLocation: string): Promise<void> {
  try {
    await unsplash.photos.trackDownload({
      downloadLocation,
    });
  } catch (error) {
    console.error("Error tracking Unsplash download:", error);
    // Don't throw - this is not critical for our app to function
  }
}

/**
 * Search for an image using multiple keywords with fallback
 * Tries each keyword set until an image is found
 *
 * @param keywordSets - Array of search terms to try in order
 * @returns Image data or null if none found
 */
export async function searchUnsplashWithFallback(
  keywordSets: string[]
): Promise<UnsplashImageData | null> {
  for (const keywords of keywordSets) {
    const image = await searchUnsplashImage(keywords);
    if (image) {
      return image;
    }
  }

  console.log("No images found after trying all keyword sets");
  return null;
}
