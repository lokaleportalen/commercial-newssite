import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";

// NOTE: Edge runtime removed to support authentication
// Authentication requires database access which isn't available in edge runtime

// Allowed MIME types for uploads
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Sanitize filename to prevent path traversal and other attacks
 */
function sanitizeFilename(filename: string): string {
  // Remove any path components
  const basename = filename.split(/[/\\]/).pop() || "upload";

  // Remove any characters that aren't alphanumeric, dash, underscore, or dot
  const sanitized = basename.replace(/[^a-zA-Z0-9._-]/g, "_");

  // Ensure filename isn't empty and has an extension
  if (!sanitized || sanitized === "." || sanitized === "..") {
    return `upload_${Date.now()}.jpg`;
  }

  // Prevent double extensions like .jpg.exe
  const parts = sanitized.split(".");
  if (parts.length > 2) {
    const ext = parts.pop();
    return `${parts.join("_")}.${ext}`;
  }

  return sanitized;
}

/**
 * Validate file type using magic numbers (file signature)
 */
async function validateFileType(
  buffer: ArrayBuffer,
  declaredType: string
): Promise<boolean> {
  const arr = new Uint8Array(buffer).subarray(0, 4);
  const header = Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();

  // Common image file signatures
  const signatures: Record<string, string[]> = {
    "image/jpeg": ["FFD8FFE0", "FFD8FFE1", "FFD8FFE2", "FFD8FFE3", "FFD8FFE8"],
    "image/jpg": ["FFD8FFE0", "FFD8FFE1", "FFD8FFE2", "FFD8FFE3", "FFD8FFE8"],
    "image/png": ["89504E47"],
    "image/webp": ["52494646"], // RIFF (WebP container)
    "image/gif": ["47494638"], // GIF8
  };

  const validSignatures = signatures[declaredType];
  if (!validSignatures) {
    return false;
  }

  return validSignatures.some((sig) => header.startsWith(sig));
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    // SECURITY: Require admin authentication
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const filename = searchParams.get("filename");

    if (!filename) {
      return NextResponse.json(
        { error: "Filename is required" },
        { status: 400 }
      );
    }

    if (!request.body) {
      return NextResponse.json(
        { error: "Request body is required" },
        { status: 400 }
      );
    }

    // SECURITY: Validate content type
    const contentType = request.headers.get("content-type");
    if (!contentType || !ALLOWED_MIME_TYPES.includes(contentType as any)) {
      return NextResponse.json(
        {
          error: "Invalid file type. Allowed types: JPEG, PNG, WebP, GIF",
          allowedTypes: ALLOWED_MIME_TYPES,
        },
        { status: 400 }
      );
    }

    // SECURITY: Check file size
    const contentLength = request.headers.get("content-length");
    if (contentLength) {
      const size = parseInt(contentLength, 10);
      if (isNaN(size) || size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            error: "File too large. Maximum size: 10MB",
            maxSize: MAX_FILE_SIZE,
          },
          { status: 413 }
        );
      }
    }

    // Read the file buffer for validation
    const arrayBuffer = await request.arrayBuffer();

    // SECURITY: Double-check file size from actual buffer
    if (arrayBuffer.byteLength > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: "File too large. Maximum size: 10MB",
          maxSize: MAX_FILE_SIZE,
        },
        { status: 413 }
      );
    }

    // SECURITY: Validate file type using magic numbers
    const isValidType = await validateFileType(arrayBuffer, contentType);
    if (!isValidType) {
      return NextResponse.json(
        {
          error:
            "File type mismatch. The file content does not match the declared type.",
        },
        { status: 400 }
      );
    }

    // SECURITY: Sanitize filename
    const sanitizedFilename = sanitizeFilename(filename);

    // Upload to Vercel Blob
    const blob = await put(sanitizedFilename, arrayBuffer, {
      access: "public",
      contentType,
    });

    console.log(`✓ File uploaded successfully: ${sanitizedFilename}`);

    return NextResponse.json(blob);
  } catch (error) {
    console.error("Upload error:", error);

    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (error.message.includes("Forbidden")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
