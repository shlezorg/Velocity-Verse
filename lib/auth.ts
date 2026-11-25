import crypto from "crypto";

export type UserRole = "ADMIN" | "EDITOR" | "AUTHOR";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface UserRecord extends SessionUser {
  passwordHash: string;
  salt: string;
  createdAt: string;
}

const AUTH_SECRET = process.env.AUTH_SECRET || (process.env.NODE_ENV === "production" ? "" : "velocity-verse-local-dev-only");
const SESSION_COOKIE_NAME = "vv_session";

// Hash password with PBKDF2
export function hashPassword(password: string, salt = crypto.randomBytes(16).toString("hex")): { hash: string; salt: string } {
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const testHash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(testHash, "hex"));
}

// Create cryptographically signed session token (HMAC-SHA256)
export function createSessionToken(user: SessionUser, expiresInDays = 7): string {
  if (!AUTH_SECRET) throw new Error("AUTH_SECRET must be set before launching in production.");
  const expiresAt = Date.now() + expiresInDays * 24 * 60 * 60 * 1000;
  const payload = JSON.stringify({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    exp: expiresAt,
  });

  const payloadB64 = Buffer.from(payload).toString("base64url");
  const signature = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(payloadB64)
    .digest("base64url");

  return `${payloadB64}.${signature}`;
}

// Verify signed session token
export function verifySessionToken(token: string): SessionUser | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [payloadB64, signature] = parts;

    const expectedSig = crypto
      .createHmac("sha256", AUTH_SECRET)
      .update(payloadB64)
      .digest("base64url");

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf-8"));
    if (payload.exp && Date.now() > payload.exp) {
      return null; // Expired
    }

    return {
      id: payload.id,
      name: payload.name,
      email: payload.email,
      role: payload.role as UserRole,
      avatar: payload.avatar,
    };
  } catch {
    return null;
  }
}

// Get authenticated user from request cookies (Server Component / Route Handler)
export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifySessionToken(token);
  } catch {
    return null;
  }
}

// Helper to check roles
export function hasRequiredRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole);
}

export { SESSION_COOKIE_NAME };
