import React from 'react';

export default function GroupNode() {
  const ringColor = 'var(--color-primary)';
  return (
    <div className="relative w-full h-full">
      <div
        className="absolute left-0 right-0 top-0 bottom-0 z-10 bg-transparent rounded-2xl border p-2 ring-2"
        style={{ '--tw-ring-color': ringColor }}
      />
    </div>
  );
}
