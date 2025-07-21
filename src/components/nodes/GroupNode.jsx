import React from 'react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

export default function GroupNode({ data }) {
  const tooltipText = data.tooltip ? `${data.label}\n${data.tooltip}` : data.label;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="w-full h-full rounded border-2 border-dotted border-green-500 bg-[#e6ffe6] p-2" />
      </TooltipTrigger>
      {tooltipText && (
        <TooltipContent className="whitespace-pre">{tooltipText}</TooltipContent>
      )}
    </Tooltip>
  );
}
