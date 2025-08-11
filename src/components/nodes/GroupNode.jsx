import React from 'react';
import {
  PinnedTooltip,
  PinnedTooltipTrigger,
  PinnedTooltipContent,
} from '@/components/ui/tooltip';

export default function GroupNode({ data }) {
  // If tooltip text already includes the label don't prepend it again
  const tooltipText = data.tooltip || data.label;

  const ringColor = data.ringColor || 'var(--color-primary)';
  return (
    <PinnedTooltip>
      <PinnedTooltipTrigger asChild>
        <div className="relative w-full h-full">
          <div
            className="absolute left-0 right-0 top-0 bottom-0 z-10 bg-transparent rounded-2xl border p-2 transition-all duration-200 hover:ring-2"
            style={{ '--tw-ring-color': ringColor }}
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
