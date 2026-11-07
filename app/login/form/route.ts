import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = formData.get("email")?.toString().trim();

  if (!email || !email.includes("@")) {
    return NextResponse.redirect(new URL("/login?error=Please+enter+a+valid+email+address", request.url), { status: 303 });
  }

  const db = getDb();
  let profile = db.profiles.getByEmail ? await db.profiles.getByEmail(email) : null;
  if (!profile && db.profiles.createWithEmail) {
    await db.profiles.createWithEmail(email);
  }

  // The mock session cookie is set client-side by the login form (see
  // LoginForm.setMockSessionCookie). It is deliberately not set here via
  // Set-Cookie: server-set cookies are omitted by some browsers on App
  // Router soft-navigation fetches (while sent on document navigations),
  // which bounces authenticated users from /admin back to /login.
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}
