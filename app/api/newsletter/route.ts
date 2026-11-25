import { NextResponse } from "next/server";
import { dbSubscribeNewsletter } from "@/lib/db";

export const dynamic = "force-dynamic";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
    }

    const result = dbSubscribeNewsletter(email.trim(), "homepage_newsletter");

    if (result.alreadySubscribed) {
      return NextResponse.json({
        success: true,
        message: "You're already subscribed to VELOCITY VERSE stories.",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Thank you for subscribing to VELOCITY VERSE. Expect the next story dispatch on Thursday.",
    });
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return NextResponse.json({ error: "Unable to process subscription. Please try again." }, { status: 500 });
  }
}
