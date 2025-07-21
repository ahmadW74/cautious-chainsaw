import React from 'react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

export default function GroupNode({ data }) {
  const tooltipText = `${data.label}${data.tooltip ? ` - ${data.tooltip}` : ''}`;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="w-full h-full bg-muted rounded border p-2 text-sm flex items-start justify-start">
          {data.label}
        </div>
      </TooltipTrigger>
      <TooltipContent className="whitespace-pre">{tooltipText}</TooltipContent>
    </Tooltip>
  );
}
