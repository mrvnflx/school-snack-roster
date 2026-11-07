"use client";

import { useEffect } from "react";

/** Re-asserts the mock session cookie from JS after login.
 *
 * The login form sets sr-mock-session via document.cookie before
 * submitting, but that value does not survive the login navigation in
 * some browsers, which then bounces authenticated users from /admin
 * back to /login on soft navigation. Setting it again here — on the
 * home page, after navigation — makes it stick. It only carries a
 * demo email address. */
export default function SessionCookieSync({ email }: { email: string }) {
  useEffect(() => {
    document.cookie = `sr-mock-session=${encodeURIComponent(email)}; Path=/; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`;
  }, [email]);

  return null;
}
