import React from 'react';
import { Handle, Position } from '@xyflow/react';
import {
  PinnedTooltip,
  PinnedTooltipTrigger,
  PinnedTooltipContent,
} from '@/components/ui/tooltip';

export default function RecordNode({ data }) {
  const ringColor = data.ringColor || 'var(--color-primary)';
  return (
    <div className="relative flex flex-col items-center">
      <Handle type="target" position={Position.Top} />
      {data.levelName && (
        <div className="text-xs text-muted-foreground mb-1">
          {data.levelName}
        </div>
      )}
      <PinnedTooltip>
        <PinnedTooltipTrigger asChild>
          <div
            className="px-4 py-2 rounded border text-sm transition-all duration-200 hover:ring-2"
            style={{
              backgroundColor: data.bg || 'var(--color-background)',
              '--tw-ring-color': ringColor,
            }}
          >
            {data.label}
          </div>
        </PinnedTooltipTrigger>
        {data.tooltip && (
          <PinnedTooltipContent className="whitespace-pre">
            {data.tooltip}
          </PinnedTooltipContent>
        )}
      </PinnedTooltip>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
