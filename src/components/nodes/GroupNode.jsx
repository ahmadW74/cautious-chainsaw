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
        <div
          className="w-full h-full bg-transparent rounded-3xl border p-2 transition-all duration-200 hover:ring-2 text-white font-bold"
          style={{ '--tw-ring-color': ringColor, fontFamily: "'Roboto Flex', sans-serif" }}
        />
      </PinnedTooltipTrigger>
      {tooltipText && (
        <PinnedTooltipContent className="whitespace-pre">
          {tooltipText}
        </PinnedTooltipContent>
      )}
    </PinnedTooltip>
  );
}
