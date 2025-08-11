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
    <div
      className="relative flex flex-col items-center text-white font-bold"
      style={{ fontFamily: "'Roboto Flex', sans-serif" }}
    >
      <Handle type="target" position={Position.Top} />
      {data.levelName && (
        <div
          className="w-full mb-4 text-center bg-purple-700 text-white font-bold rounded-3xl"
          style={{ fontFamily: "'Fjalla One', sans-serif" }}
        >
          {data.levelName}
        </div>
      )}
      <PinnedTooltip>
        <PinnedTooltipTrigger asChild>
          <div
            className="px-5 py-3 rounded-3xl border text-base transition-all duration-200 hover:ring-2 text-center text-white"
            style={{
              backgroundColor: data.bg || "var(--color-background)",
              "--tw-ring-color": ringColor,
              fontFamily: "'Roboto Flex', sans-serif",
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
