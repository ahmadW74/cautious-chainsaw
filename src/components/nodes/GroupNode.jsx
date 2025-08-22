import React, { useState } from "react";
import {
  PinnedTooltip,
  PinnedTooltipTrigger,
  PinnedTooltipContent,
} from "@/components/ui/tooltip";

const BORDER_COLOR = "#9CA3AF";

export default function GroupNode({ data }) {
  const tooltipText = data.tooltip || data.label;
  const [hovered, setHovered] = useState(false);

  return (
    <PinnedTooltip>
      <PinnedTooltipTrigger asChild>
        <div className="relative w-full h-full">
          <div
            className="absolute left-0 right-0 top-0 bottom-0 z-10 bg-white p-2 transition-all duration-200"
            style={{
              borderRadius: 16,
              border: hovered
                ? `1px solid ${BORDER_COLOR}`
                : `1px solid ${BORDER_COLOR}80`,
              boxShadow: hovered
                ? `0 2px 4px rgba(0,0,0,0.06), 0 0 0 2px ${BORDER_COLOR}, 0 0 8px ${BORDER_COLOR}`
                : `0 2px 4px rgba(0,0,0,0.06), 0 0 0 1px ${BORDER_COLOR}80`,
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          />
        </div>
      </PinnedTooltipTrigger>
      {tooltipText && (
        <PinnedTooltipContent
          className="whitespace-pre"
          color={BORDER_COLOR}
          style={{ fontFamily: "var(--node-font-family, inherit)" }}
        >
          {tooltipText}
        </PinnedTooltipContent>
      )}
    </PinnedTooltip>
  );
}
