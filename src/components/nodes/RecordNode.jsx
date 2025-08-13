import React, { useMemo, useState } from "react";
import { Handle, Position } from "@xyflow/react";
import {
  PinnedTooltip,
  PinnedTooltipTrigger,
  PinnedTooltipContent,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Globe, Shield, Check, X } from "lucide-react";
import { computeDomain, HEADER_STYLE } from "@/lib/domain";

const ACCENT_GRADIENTS = {
  root: ["#3B82F6", "#60A5FA"],
  net: ["#10B981", "#34D399"],
  ds: ["#8B5CF6", "#A78BFA"],
};

const NODE_ICONS = {
  root: Globe,
  net: Globe,
  ds: Shield,
};

const fontStack =
  "'Source Sans Pro', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif";

export default function RecordNode({ data }) {
  const { full: domainFull, truncated } = useMemo(
    () => computeDomain(data),
    [data]
  );

  const [start, end] = ACCENT_GRADIENTS[data.nodeType] || ACCENT_GRADIENTS.root;
  const headerBackground = `linear-gradient(to right, ${start}, ${end})`;
  const Icon = NODE_ICONS[data.nodeType] || Globe;
  const [hovered, setHovered] = useState(false);
  const StatusIcon = data.isBroken ? X : data.signed ? Check : null;

  return (
    <div className="relative flex flex-col items-center">
      <Handle type="target" position={Position.Top} />
      <PinnedTooltip>
        <PinnedTooltipTrigger asChild>
          <div className="relative">
            <div
              className="absolute top-0 left-0 right-0 z-0 text-white text-base font-semibold tracking-[0.04em] pl-2 pr-2 pt-1 flex items-center gap-1 select-none"
              style={{
                height: HEADER_STYLE.height,
                background: headerBackground,
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
                fontFamily: fontStack,
              }}
              title={domainFull}
            >
              <Icon className="w-4 h-4" />
              <span>{truncated}</span>
              {StatusIcon && <StatusIcon className="w-4 h-4 ml-auto" />}
            </div>
            <div
                className="relative z-10 px-5 py-3 text-xl transition-all duration-200 text-center"
              style={{
                marginTop: HEADER_STYLE.visibleHeight,
                backgroundColor: "var(--color-background)",
                borderRadius: 16,
                border: hovered
                  ? `1px solid ${start}`
                  : `1px solid ${start}80`,
                boxShadow: hovered
                  ? `0 2px 4px rgba(0,0,0,0.06), 0 0 0 2px ${start}, 0 0 8px ${start}`
                  : `0 2px 4px rgba(0,0,0,0.06), 0 0 0 1px ${start}80`,
                fontFamily: data.fontFamily || fontStack,
                lineHeight: 1.2,
              }}
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
            >
              <div>{data.label}</div>
              {(data.flags || data.size) && (
                <div className="mt-1 flex gap-1 flex-wrap justify-center">
                  {data.flags && (
                    <Badge variant="secondary" className="text-xs px-1 py-0">
                      Flags: {data.flags}
                    </Badge>
                  )}
                  {data.size && (
                    <Badge variant="secondary" className="text-xs px-1 py-0">
                      Size: {data.size}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </PinnedTooltipTrigger>
        {data.tooltip && (
          <PinnedTooltipContent
            className="whitespace-pre"
            color={start}
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
