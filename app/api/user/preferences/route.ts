import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { cookies } from "next/headers";

// Get user preferences
export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config });
    const cookieStore = await cookies();
    const token = cookieStore.get("payload-token");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify token and get user
    const { user } = await payload.auth({ headers: request.headers });

    if (!user || user.collection !== "users") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user data with preferences
    const userData = await payload.findByID({
      collection: "users",
      id: user.id,
    });

    return NextResponse.json({
      newsCategory: userData.newsCategory || "all",
      emailFrequency: userData.emailFrequency || "daily",
    });
  } catch (error) {
    console.error("Error fetching preferences:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Create or update user preferences
export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config });
    const cookieStore = await cookies();
    const token = cookieStore.get("payload-token");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify token and get user
    const { user } = await payload.auth({ headers: request.headers });

    if (!user || user.collection !== "users") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { newsCategory, emailFrequency } = await request.json();

    if (!newsCategory || !emailFrequency) {
      return NextResponse.json(
        { error: "News category and email frequency are required" },
        { status: 400 }
      );
    }

    // Update user preferences
    await payload.update({
      collection: "users",
      id: user.id,
      data: {
        newsCategory,
        emailFrequency,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving preferences:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
