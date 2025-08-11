import React, { useMemo } from 'react';
import {
  PinnedTooltip,
  PinnedTooltipTrigger,
  PinnedTooltipContent,
} from '@/components/ui/tooltip';
import { computeDomain, HEADER_STYLE } from '@/lib/domain';

export default function GroupNode({ data, id }) {
  // If tooltip text already includes the label don't prepend it again
  const tooltipText = data.tooltip || data.label;

  const ringColor = data.ringColor || 'var(--color-primary)';
  const { full: domainFull, truncated: domainShort } = useMemo(
    () => computeDomain(data, id),
    [data, id]
  );
  return (
    <PinnedTooltip>
      <PinnedTooltipTrigger asChild>
        <div className="relative w-full h-full">
          <div
            className="absolute top-0 left-0 right-0 z-0 rounded-t-2xl bg-gradient-to-r from-[#F472B6] via-[#E879F9] to-[#C084FC] text-white text-xs font-bold tracking-[0.04em] pl-2 pt-1.5 select-none"
            style={{ height: HEADER_STYLE.height }}
            title={domainFull}
          >
            {domainShort}
          </div>
          <div
            className="absolute left-0 right-0 bottom-0 z-10 bg-transparent rounded-2xl border p-2 transition-all duration-200 hover:ring-2"
            style={{ top: HEADER_STYLE.visibleHeight, '--tw-ring-color': ringColor }}
          />
        </div>
      </PinnedTooltipTrigger>
      {tooltipText && (
        <PinnedTooltipContent className="whitespace-pre">
          {tooltipText}
        </PinnedTooltipContent>
      )}
    </PinnedTooltip>
  );
}
