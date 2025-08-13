import React, { useState } from "react";
import {
  ReactFlow as ReactFlowBase,
  Background,
  Controls,
} from "@xyflow/react";
import { Resizable } from "re-resizable";
import ErrorBoundary from "@/components/ErrorBoundary.jsx";
import NebulaBackground from "@/components/NebulaBackground.jsx";
import "@xyflow/react/dist/style.css";

const defaultEdgeOptions = {
  type: "bezier",
  animated: true,
  style: { stroke: "#D1D5DB", strokeWidth: 2 },
};

/**
 * ReactFlow graph with animated background.
 */
const ColorFlow = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  nodeTypes,
  rfSize,
  setRfSize,
  graphContainerRef,
}) => {
  const [zoom, setZoom] = useState(0.7);
  const [focus, setFocus] = useState({ x: 0, y: 0 });

  return (
    <Resizable
      size={rfSize}
      onResizeStop={(e, dir, ref, d) =>
        setRfSize({
          width: rfSize.width + d.width,
          height: rfSize.height + d.height,
        })
      }
      className="relative border border-border rounded overflow-hidden mx-auto"
    >
      <div className="absolute top-1 left-1 z-10 text-xs bg-secondary/80 px-2 py-1 rounded">
        Zoom: {zoom.toFixed(2)} • {Math.round(rfSize.width)}×
        {Math.round(rfSize.height)} • Focus: {Math.round(focus.x)},
        {Math.round(focus.y)}
      </div>
      <div className="w-full h-full relative" ref={graphContainerRef}>
        <NebulaBackground />
        <ErrorBoundary>
          <ReactFlowBase
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            defaultViewport={{ x: 0, y: 0, zoom: 0.7 }}
            onMove={(e, vp) => {
              setZoom(vp.zoom);
              setFocus({ x: vp.x, y: vp.y });
            }}
            defaultEdgeOptions={defaultEdgeOptions}
            style={{ width: "100%", height: "100%", background: "transparent" }}
          >
            <Background />
            <Controls />
          </ReactFlowBase>
        </ErrorBoundary>
      </div>
    </Resizable>
  );
};

export default ColorFlow;
