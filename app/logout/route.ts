import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  cookieStore.delete("sr-mock-email");
  return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
}
