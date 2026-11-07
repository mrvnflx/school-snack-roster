import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { cookies } from "next/headers";

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

  const cookieStore = await cookies();
  cookieStore.set("sr-mock-email", email, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  const response = NextResponse.redirect(new URL("/", request.url), { status: 303 });
  response.cookies.set("sr-mock-email", email, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return response;
}
