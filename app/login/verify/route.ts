import { NextResponse } from "next/server";
import { consumeMagicToken } from "@/lib/db/in-memory-tokens";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/login?error=Missing+magic+link+token", request.url), { status: 303 });
  }

  const email = consumeMagicToken(token);
  if (!email) {
    return NextResponse.redirect(new URL("/login?error=Invalid+or+expired+magic+link", request.url), { status: 303 });
  }

  const db = getDb();
  let profile = db.profiles.getByEmail ? await db.profiles.getByEmail(email) : null;
  if (!profile && db.profiles.createWithEmail) {
    await db.profiles.createWithEmail(email);
  }

  // Set auth cookie server-side
  const cookieStore = await cookies();
  cookieStore.set("sr-mock-session", email, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });

  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}
