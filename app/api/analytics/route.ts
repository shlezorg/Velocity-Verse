import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { dbGetAnalytics } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser();
  if (!user || !["ADMIN", "EDITOR"].includes(user.role)) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  const analytics = dbGetAnalytics();
  return NextResponse.json(analytics);
}
