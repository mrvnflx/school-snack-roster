"use client";

import { useTransition } from "react";
import { generateScheduleForSection } from "@/lib/admin-actions";

export default function GenerateButton({
  sectionId,
  year,
  month,
}: {
  sectionId: string;
  year: number;
  month: number;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      disabled={pending}
      onClick={() =>
        startTransition(() => {
          generateScheduleForSection(sectionId, year, month);
        })
      }
      className="text-xs bg-green-800 text-white rounded px-2 py-1 disabled:opacity-50"
    >
      {pending ? "…" : "Generate"}
    </button>
  );
}
