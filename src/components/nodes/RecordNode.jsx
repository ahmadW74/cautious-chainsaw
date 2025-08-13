import React, { useMemo } from "react";
import { Handle, Position } from "@xyflow/react";
import {
  PinnedTooltip,
  PinnedTooltipTrigger,
  PinnedTooltipContent,
} from "@/components/ui/tooltip";
import { computeDomain, HEADER_STYLE } from "@/lib/domain";

const ACCENT_GRADIENTS = {
  root: ["#3B82F6", "#60A5FA"],
  net: ["#10B981", "#34D399"],
  ds: ["#8B5CF6", "#A78BFA"],
};

const fontStack =
  "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif";

export default function RecordNode({ data }) {
  const { full: domainFull, truncated } = useMemo(
    () => computeDomain(data),
    [data]
  );

  const [start, end] = ACCENT_GRADIENTS[data.nodeType] || ACCENT_GRADIENTS.root;
  const headerBackground = `linear-gradient(to right, ${start}, ${end})`;

  return (
    <div className="relative flex flex-col items-center">
      <Handle type="target" position={Position.Top} />
      <PinnedTooltip>
        <PinnedTooltipTrigger asChild>
          <div className="relative">
            <div
              className="absolute top-0 left-0 right-0 z-0 text-white text-sm font-semibold tracking-[0.04em] pl-2 pt-2 select-none"
              style={{
                height: HEADER_STYLE.height,
                background: headerBackground,
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
                fontFamily: fontStack,
              }}
              title={domainFull}
            >
              {truncated}
            </div>
            <div
              className="relative z-10 px-5 py-3 text-base transition-all duration-200 hover:ring-2 text-center"
              style={{
                marginTop: HEADER_STYLE.visibleHeight,
                backgroundColor: "var(--color-background)",
                border: "1px solid #E5E7EB",
                borderRadius: 16,
                boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
                "--tw-ring-color": "var(--color-primary)",
                fontFamily: data.fontFamily || fontStack,
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
            style={{ fontFamily: data.fontFamily || fontStack }}
          >
            {data.tooltip}
          </PinnedTooltipContent>
        )}
      </PinnedTooltip>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
