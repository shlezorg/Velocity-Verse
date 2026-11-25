// Run after setting ADMIN_EMAIL and ADMIN_PASSWORD in your environment.
// For .env.local, use: node --env-file=.env.local scripts/set-admin-password.mjs
import { DatabaseSync } from "node:sqlite";
import { pbkdf2Sync, randomBytes } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD || "";
if (!email.includes("@") || password.length < 12 || password.includes("replace-with-")) {
  console.error("Set ADMIN_EMAIL and a strong ADMIN_PASSWORD (12+ characters).");
  process.exit(1);
}
const dir = path.join(process.cwd(), "data");
fs.mkdirSync(dir, { recursive: true });
const db = new DatabaseSync(path.join(dir, "velocity_verse.db"));
db.exec(`CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL, password_hash TEXT NOT NULL, salt TEXT NOT NULL,
  avatar TEXT, created_at TEXT NOT NULL
)`);
const salt = randomBytes(16).toString("hex");
const hash = pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
const user = db.prepare("SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1").get();
if (user) {
  db.prepare("UPDATE users SET email=?, password_hash=?, salt=? WHERE id=?")
    .run(email, hash, salt, user.id);
} else {
  db.prepare("INSERT INTO users (id,name,email,role,password_hash,salt,avatar,created_at) VALUES (?,?,?,?,?,?,?,?)")
    .run(`usr-admin-${Date.now()}`,"Velocity Verse Editor",email,"ADMIN",hash,salt,null,new Date().toISOString());
}
db.close();
console.log(`Admin login updated for ${email}. Keep your password private.`);
