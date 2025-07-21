import React from 'react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

export default function GroupNode({ data }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="w-full h-full bg-muted rounded border p-2 text-sm flex items-start justify-start">
          {data.label}
        </div>
      </TooltipTrigger>
      {data.tooltip && (
        <TooltipContent className="whitespace-pre">
          {data.tooltip}
        </TooltipContent>
      )}
    </Tooltip>
  );
}
