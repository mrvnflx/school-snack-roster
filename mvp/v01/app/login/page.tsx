"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type LoginFormProps = {
  isInMemoryMode: boolean;
};

export function LoginForm({ isInMemoryMode }: LoginFormProps) {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [stage, setStage] = useState<"phone" | "code">("phone");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const tidy = phone.replace(/[\s-]/g, "");
    if (!/^\+?\d{10,15}$/.test(tidy)) {
      setLoading(false);
      return setError("Enter a valid phone number (e.g. +919876543210).");
    }

    setStage("code");
    setLoading(false);
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (code.length < 4) {
      setLoading(false);
      return setError("Enter the code you received.");
    }

    // In-memory mode: accept any non-empty code and redirect.
    setLoading(false);
    router.push("/");
    router.refresh();
  }

  return (
    <main className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-2xl font-bold mb-6">Snack Roster Login</h1>

      {stage === "phone" && (
        <form onSubmit={sendCode} className="space-y-3">
          <label className="block text-sm font-medium">Phone number</label>
          <input
            type="tel"
            required
            placeholder="+91XXXXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />
          <button
            disabled={loading}
            className="w-full bg-green-800 text-white rounded-lg py-2 font-medium disabled:opacity-50"
          >
            {loading ? "Sending…" : "Send code"}
          </button>
        </form>
      )}

      {stage === "code" && (
        <form onSubmit={verifyCode} className="space-y-3">
          <p className="text-sm text-gray-600">Enter the code sent to {phone}.</p>
          <input
            type="text"
            required
            inputMode="numeric"
            placeholder="6-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />
          <button
            disabled={loading}
            className="w-full bg-green-800 text-white rounded-lg py-2 font-medium disabled:opacity-50"
          >
            {loading ? "Verifying…" : "Verify & Log in"}
          </button>
        </form>
      )}

      {error && <p className="text-red-600 text-sm mt-3">{error}</p>}

      <p className="text-xs text-gray-400 mt-6">
        {isInMemoryMode
          ? "Development mode — any code is accepted."
          : "MVP note: no SMS provider is wired up yet. Configure a Test Phone Number in Supabase Auth settings to log in during development."}
      </p>
    </main>
  );
}
