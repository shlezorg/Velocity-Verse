import { NextResponse } from "next/server";
import crypto from "crypto";
import { dbRecordArticleView } from "@/lib/db";

export const dynamic = "force-dynamic";

// Bot User-Agent substrings to filter out
const BOT_PATTERNS = [
  "bot", "crawler", "spider", "crawling", "googlebot", "bingbot", "yahoo",
  "baiduspider", "yandex", "duckduckbot", "slurp", "headless", "lighthouse",
  "facebookexternalhit", "twitterbot", "rogerbot", "linkedinbot", "embedly",
  "quora link preview", "showyoubot", "outbrain", "pinterest", "slackbot", "vkshare", "w3c_validator"
];

function isBot(userAgent: string): boolean {
  if (!userAgent) return true;
  const ua = userAgent.toLowerCase();
  return BOT_PATTERNS.some((pattern) => ua.includes(pattern));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { articleId, referrer } = body;

    if (!articleId) {
      return NextResponse.json({ error: "articleId is required" }, { status: 400 });
    }

    const headers = request.headers;
    const userAgent = headers.get("user-agent") || "";

    // Ignore bots and synthetic crawlers
    if (isBot(userAgent)) {
      return NextResponse.json({ recorded: false, reason: "bot_ignored" });
    }

    // Privacy-conscious anonymized visitor hash (salted IP + UA)
    const forwardedFor = headers.get("x-forwarded-for") || headers.get("x-real-ip") || "127.0.0.1";
    const clientIp = forwardedFor.split(",")[0].trim();
    const visitorHash = crypto
      .createHash("sha256")
      .update(`${clientIp}-${userAgent.substring(0, 100)}-velocity`)
      .digest("hex")
      .substring(0, 24);

    const result = dbRecordArticleView(
      articleId,
      visitorHash,
      referrer || "",
      userAgent
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("View recording error:", error);
    return NextResponse.json({ error: "Failed to record view" }, { status: 500 });
  }
}
