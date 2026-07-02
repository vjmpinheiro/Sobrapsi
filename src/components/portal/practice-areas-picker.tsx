"use client";

import { Label } from "@/components/ui/label";
import { PSYCHOANALYTIC_PRACTICE_AREAS } from "@/lib/constants";

export function parseStudyAreas(value: string | null | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((area) => area.trim())
    .filter(Boolean);
}

export function formatStudyAreas(areas: string[]): string {
  return areas.join(", ");
}

interface PracticeAreasPickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  description?: string;
}

export function PracticeAreasPicker({
  value,
  onChange,
  label = "Áreas de atuação clínica",
  description = "Selecione todas as áreas em que você mais trabalha (sem limite).",
}: PracticeAreasPickerProps) {
  const selectedAreas = parseStudyAreas(value);

  function toggleArea(area: string) {
    const next = selectedAreas.includes(area)
      ? selectedAreas.filter((item) => item !== area)
      : [...selectedAreas, area];
    onChange(formatStudyAreas(next));
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <span className="text-[10px] uppercase tracking-wide text-muted">Opcional</span>
      </div>
      {description && <p className="text-xs text-muted">{description}</p>}
      <div className="grid gap-2 sm:grid-cols-2">
        {PSYCHOANALYTIC_PRACTICE_AREAS.map((area) => (
          <label
            key={area}
            className={`flex cursor-pointer items-start gap-2 rounded-lg border p-3 text-sm transition-colors ${
              selectedAreas.includes(area)
                ? "border-primary bg-primary/10 text-white"
                : "border-white/10 text-muted hover:border-primary/30"
            }`}
          >
            <input
              type="checkbox"
              className="mt-0.5"
              checked={selectedAreas.includes(area)}
              onChange={() => toggleArea(area)}
            />
            {area}
          </label>
        ))}
      </div>
    </div>
  );
}

interface PracticeAreasDisplayProps {
  value: string | null | undefined;
  emptyLabel?: string;
}

export function PracticeAreasDisplay({
  value,
  emptyLabel = "Nenhuma área informada.",
}: PracticeAreasDisplayProps) {
  const areas = parseStudyAreas(value);

  if (areas.length === 0) {
    return <p className="text-sm text-muted">{emptyLabel}</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {areas.map((area) => (
        <span
          key={area}
          className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm text-white"
        >
          {area}
        </span>
      ))}
    </div>
  );
}
