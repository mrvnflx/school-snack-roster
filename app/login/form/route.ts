import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { storeMagicToken } from "@/lib/db/in-memory-tokens";
import { Resend } from "resend";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = formData.get("email")?.toString().trim();

  if (!email || !email.includes("@")) {
    return NextResponse.redirect(new URL("/login?error=Please+enter+a+valid+email+address", request.url), { status: 303 });
  }

  // Ensure profile exists or create if needed
  const db = getDb();
  let profile = db.profiles.getByEmail ? await db.profiles.getByEmail(email) : null;
  if (!profile && db.profiles.createWithEmail) {
    await db.profiles.createWithEmail(email);
  }

  // Generate secure token
  const token = crypto.randomUUID();
  storeMagicToken(token, email);

  const url = new URL(request.url);
  const origin = url.origin;
  const magicLink = `${origin}/login/verify?token=${token}`;

  const resendApiKey = process.env.RESEND_API_KEY;
  const resendFrom = process.env.RESEND_FROM || "School Snack Roster <onboarding@resend.dev>";

  if (resendApiKey) {
    try {
      const resend = new Resend(resendApiKey);
      await resend.emails.send({
        from: resendFrom,
        to: email,
        subject: "Sign in to School Snack Roster (Magic Link)",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #2D4A26;">School Snack Roster Sign In</h2>
            <p>You requested a magic link to sign in to School Snack Roster.</p>
            <p style="margin: 24px 0;">
              <a href="${magicLink}" style="background-color: #2D4A26; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Sign In Now
              </a>
            </p>
            <p style="color: #718096; font-size: 14px;">If you didn't request this email, you can safely ignore it.</p>
            <p style="color: #a0aec0; font-size: 12px; margin-top: 24px;">Magic link expires in 15 minutes.</p>
          </div>
        `,
      });
    } catch (err) {
      console.error("Failed to send email via Resend:", err);
      return NextResponse.redirect(new URL(`/login?error=Failed+to+send+email+via+Resend:+${encodeURIComponent(err instanceof Error ? err.message : String(err))}`, request.url), { status: 303 });
    }
  } else {
    // Fallback development console log if API key not configured yet
    console.log("========================================");
    console.log("MOCK RESEND MAGIC LINK for:", email);
    console.log(magicLink);
    console.log("========================================");
  }

  return NextResponse.redirect(new URL(`/login?sent=true&email=${encodeURIComponent(email)}`, request.url), { status: 303 });
}
