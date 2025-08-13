import React, { useState } from "react";
import {
  PinnedTooltip,
  PinnedTooltipTrigger,
  PinnedTooltipContent,
} from "@/components/ui/tooltip";

const ACCENT_GRADIENTS = {
  root: ["#3B82F6", "#60A5FA"],
  tld: ["#3B82F6", "#60A5FA"],
  net: ["#3B82F6", "#60A5FA"],
  ds: ["#8B5CF6", "#A78BFA"],
};

export default function GroupNode({ data }) {
  const tooltipText = data.tooltip || data.label;
  const [start] = ACCENT_GRADIENTS[data.nodeType] || ACCENT_GRADIENTS.root;
  const [hovered, setHovered] = useState(false);

  return (
    <PinnedTooltip>
      <PinnedTooltipTrigger asChild>
        <div className="relative w-full h-full">
          <div
            className="absolute left-0 right-0 top-0 bottom-0 z-10 bg-white p-2 transition-all duration-200"
            style={{
              borderRadius: 16,
              border: hovered ? `1px solid ${start}` : `1px solid ${start}80`,
              boxShadow: hovered
                ? `0 2px 4px rgba(0,0,0,0.06), 0 0 0 2px ${start}, 0 0 8px ${start}`
                : `0 2px 4px rgba(0,0,0,0.06), 0 0 0 1px ${start}80`,
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          />
        </div>
      </PinnedTooltipTrigger>
      {tooltipText && (
        <PinnedTooltipContent
          className="whitespace-pre"
          color={start}
          style={{ fontFamily: "var(--node-font-family, inherit)" }}
        >
          {tooltipText}
        </PinnedTooltipContent>
      )}
    </PinnedTooltip>
  );
}
