import React from "react";
import {
  PinnedTooltip,
  PinnedTooltipTrigger,
  PinnedTooltipContent,
} from "@/components/ui/tooltip";

export default function GroupNode({ data }) {
  // If tooltip text already includes the label don't prepend it again
  const tooltipText = data.tooltip || data.label;

  return (
    <PinnedTooltip>
      <PinnedTooltipTrigger asChild>
        <div className="relative w-full h-full">
          <div
            className="absolute left-0 right-0 top-0 bottom-0 z-10 bg-white p-2 transition-all duration-200 hover:ring-2"
            style={{
              border: "1px solid #E5E7EB",
              borderRadius: 16,
              boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
              "--tw-ring-color": "var(--color-primary)",
            }}
          />
        </div>
      </PinnedTooltipTrigger>
      {tooltipText && (
        <PinnedTooltipContent
          className="whitespace-pre"
          style={{ fontFamily: "var(--node-font-family, inherit)" }}
        >
          {tooltipText}
        </PinnedTooltipContent>
      )}
    </PinnedTooltip>
  );
}
