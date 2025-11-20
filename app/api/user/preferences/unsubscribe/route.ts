import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { cookies } from "next/headers";

// Unsubscribe from all emails
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

    // Unsubscribe user from emails
    await payload.update({
      collection: "users",
      id: user.id,
      data: {
        emailPreferences: false,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error unsubscribing:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
