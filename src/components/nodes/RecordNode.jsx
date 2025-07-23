import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

export default function RecordNode({ data }) {
  return (
    <div className="relative flex flex-col items-center">
      <Handle type="target" position={Position.Top} />
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className="px-4 py-2 rounded border text-sm transition-all duration-200 hover:ring-2 hover:ring-primary"
            style={{ backgroundColor: data.bg || "var(--color-background)" }}
          >
            {data.label}
          </div>
        </TooltipTrigger>
        {data.tooltip && (
          <TooltipContent className="whitespace-pre">
            {data.tooltip}
          </TooltipContent>
        )}
      </Tooltip>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
