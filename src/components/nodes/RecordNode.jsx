import React, { useMemo } from "react";
import { Handle, Position } from "@xyflow/react";
import {
  PinnedTooltip,
  PinnedTooltipTrigger,
  PinnedTooltipContent,
} from "@/components/ui/tooltip";
import { computeDomain, HEADER_STYLE } from "@/lib/domain";

export default function RecordNode({ data }) {
  const { full: domainFull, truncated } = useMemo(
    () => computeDomain(data),
    [data]
  );
  const headerColor = "var(--color-primary)";
  return (
    <div className="relative flex flex-col items-center">
      <Handle type="target" position={Position.Top} />
      <PinnedTooltip>
        <PinnedTooltipTrigger asChild>
          <div className="relative">
            <div
              className="absolute top-0 left-0 right-0 z-0 rounded-t-2xl text-white text-sm font-bold tracking-[0.04em] pl-2 pt-2 select-none"
              style={{ height: HEADER_STYLE.height, backgroundColor: headerColor }}
              title={domainFull}
            >
              {truncated}
            </div>
            <div
              className="relative z-10 px-5 py-3 rounded-2xl border text-base transition-all duration-200 hover:ring-2 text-center"
              style={{
                marginTop: HEADER_STYLE.visibleHeight,
                backgroundColor: "var(--color-background)",
                borderColor: "var(--color-primary)",
                "--tw-ring-color": "var(--color-primary)",
                fontFamily: "var(--node-font-family, inherit)",
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
          <PinnedTooltipContent
            className="whitespace-pre"
            style={{ fontFamily: "var(--node-font-family, inherit)" }}
          >
            {data.tooltip}
          </PinnedTooltipContent>
        )}
      </PinnedTooltip>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
