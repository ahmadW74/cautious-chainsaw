import React from 'react';
import LiquidGlass from 'liquid-glass-react';
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
        <LiquidGlass
          className="relative w-full h-full rounded-2xl border p-2 transition-all duration-200 hover:ring-2"
          padding="0"
          style={{ '--tw-ring-color': ringColor }}
        >
          <div className="w-full h-full" />
        </LiquidGlass>
      </PinnedTooltipTrigger>
      {tooltipText && (
        <PinnedTooltipContent className="whitespace-pre">
          {tooltipText}
        </PinnedTooltipContent>
      )}
    </PinnedTooltip>
  );
}
