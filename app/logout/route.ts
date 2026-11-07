import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// POST-only on purpose: a GET logout is unsafe because link prefetchers
// (including the Next.js router) will invoke it in the background and
// silently delete the session cookie, bouncing authenticated users to
// /login on their next navigation.
export async function POST(request: Request) {
  const cookieStore = await cookies();
  cookieStore.delete("sr-mock-session");
  return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
}
