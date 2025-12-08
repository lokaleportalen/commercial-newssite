import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { getAIProvider, setAIProvider } from "@/lib/ai-client";
import { AI_PROVIDERS, type AIProvider } from "@/database/schema";

/**
 * GET /api/admin/settings/ai-provider
 * Get the current AI provider setting
 */
export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    await requireAdmin();

    const provider = await getAIProvider();

    return NextResponse.json({ provider }, { status: 200 });
  } catch (error) {
    console.error("Error fetching AI provider:", error);

    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (error.message.includes("Forbidden")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    return NextResponse.json(
      { error: "Failed to fetch AI provider" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/settings/ai-provider
 * Update the AI provider setting
 */
export async function PUT(request: NextRequest) {
  try {
    // Check if user is admin
    await requireAdmin();

    const body = await request.json();
    const { provider } = body;

    // Validate provider
    if (!provider || !AI_PROVIDERS.includes(provider as AIProvider)) {
      return NextResponse.json(
        {
          error: "Invalid provider. Must be one of: " + AI_PROVIDERS.join(", "),
        },
        { status: 400 }
      );
    }

    await setAIProvider(provider as AIProvider);

    return NextResponse.json(
      {
        provider,
        message: "AI provider updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating AI provider:", error);

    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (error.message.includes("Forbidden")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    return NextResponse.json(
      { error: "Failed to update AI provider" },
      { status: 500 }
    );
  }
}
