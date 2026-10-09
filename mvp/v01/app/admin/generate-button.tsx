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
      className="sr-btn sr-btn-primary sr-btn-sm"
    >
      {pending ? "…" : "Generate"}
    </button>
  );
}
