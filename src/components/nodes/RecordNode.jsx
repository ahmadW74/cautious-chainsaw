import React, { useMemo } from "react";
import { Handle, Position } from "@xyflow/react";
import {
  PinnedTooltip,
  PinnedTooltipTrigger,
  PinnedTooltipContent,
} from "@/components/ui/tooltip";
import { computeDomain, HEADER_STYLE } from "@/lib/domain";

export default function RecordNode({ data, id }) {
  const ringColor = data.ringColor || "var(--color-primary)";
  const { full: domainFull, truncated: domainShort } = useMemo(
    () => computeDomain(data, id),
    [data, id]
  );
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
          <div className="relative">
            <div
              className="absolute top-0 left-0 right-0 z-0 rounded-t-2xl bg-gradient-to-r from-[#F472B6] via-[#E879F9] to-[#C084FC] text-white text-xs font-bold tracking-[0.04em] pl-2 pt-1.5 select-none"
              style={{ height: HEADER_STYLE.height }}
              title={domainFull}
            >
              {domainShort}
            </div>
            <div
              className="relative z-10 px-5 py-3 rounded-2xl border text-base transition-all duration-200 hover:ring-2 text-center"
              style={{
                marginTop: HEADER_STYLE.visibleHeight,
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
