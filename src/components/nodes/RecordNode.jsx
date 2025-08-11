import React from "react";
import { Handle, Position } from "@xyflow/react";
import {
  PinnedTooltip,
  PinnedTooltipTrigger,
  PinnedTooltipContent,
} from "@/components/ui/tooltip";

export default function RecordNode({ data }) {
  const ringColor = data.ringColor || "var(--color-primary)";
  return (
    <div className="relative flex flex-col items-center">
      <Handle type="target" position={Position.Top} />
      {data.levelName && (
        <div className="text-base text-muted-foreground mb-2">
          {data.levelName}
        </div>
      )}
      <PinnedTooltip>
        <PinnedTooltipTrigger asChild>
          <div
            className="px-5 py-3 rounded border text-base transition-all duration-200 hover:ring-2 text-center"
            style={{
              backgroundColor: data.bg || "var(--color-background)",
              "--tw-ring-color": ringColor,
            }}
          >
            <div>{data.label}</div>
            {(data.flags || data.size) && (
              <div className="mt-1 text-xs">
                {data.flags && <>Flags: {data.flags}</>}
                {data.flags && data.size && " | "}
                {data.size && <>Size: {data.size}</>}
              </div>
            )}
          </div>
        </PinnedTooltipTrigger>
        {data.tooltip && (
          <PinnedTooltipContent className="whitespace-pre">
            {data.tooltip}
          </PinnedTooltipContent>
        )}
      </PinnedTooltip>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
