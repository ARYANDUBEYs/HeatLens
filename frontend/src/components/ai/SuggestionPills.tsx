"use client";

import React from "react";
import { Sparkles } from "lucide-react";

interface SuggestionPillsProps {
  onSelectQuery: (query: string) => void;
  disabled?: boolean;
}

export const SUGGESTED_QUERIES = [
  "Show top 3 wards for hydration kiosks in East Delhi",
  "Identify severe canopy deficit zones (NDVI < 0.12)",
  "पूर्वी दिल्ली में सबसे ज्यादा गर्मी वाले क्षेत्र दिखाएं",
];

export function SuggestionPills({
  onSelectQuery,
  disabled = false,
}: SuggestionPillsProps) {
  return (
    <div className="flex flex-col gap-1.5 py-1">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-text-secondary">
        <Sparkles className="h-3 w-3 text-azure-primary" />
        <span>Suggested AI Prompts:</span>
      </div>
      <div className="flex flex-col gap-1.5">
        {SUGGESTED_QUERIES.map((query, idx) => (
          <button
            key={idx}
            type="button"
            disabled={disabled}
            onClick={() => onSelectQuery(query)}
            className="text-left text-[11px] font-medium text-text-secondary hover:text-text-primary bg-surface-muted hover:bg-slate-200/70 border border-border rounded-lg px-2.5 py-1.5 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed leading-snug cursor-pointer flex items-center justify-between group"
          >
            <span className="truncate pr-2">{query}</span>
            <span className="text-[10px] text-azure-primary opacity-0 group-hover:opacity-100 transition-opacity font-mono shrink-0">
              Run →
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
