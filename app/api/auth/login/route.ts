import { NextResponse } from "next/server";
import { dbGetUserByEmail } from "@/lib/db";
import { verifyPassword, createSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const user = dbGetUserByEmail(email);
    if (!user) {
      // Timing-safe response
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isValid = verifyPassword(password, user.passwordHash, user.salt);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    };

    const token = createSessionToken(safeUser);

    const response = NextResponse.json({ success: true, user: safeUser });
    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
