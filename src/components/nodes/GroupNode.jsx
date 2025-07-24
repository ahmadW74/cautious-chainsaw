import React from 'react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

export default function GroupNode({ data }) {
  // If tooltip text already includes the label don't prepend it again
  const tooltipText = data.tooltip || data.label;

  const ringColor = data.ringColor || 'var(--color-primary)';
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className="w-full h-full bg-transparent rounded border p-2 transition-all duration-200 hover:ring-2"
          style={{ '--tw-ring-color': ringColor }}
        />
      </TooltipTrigger>
      {tooltipText && (
        <TooltipContent className="whitespace-pre">{tooltipText}</TooltipContent>
      )}
    </Tooltip>
  );
}
