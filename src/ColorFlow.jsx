import React from "react";
import {
  ReactFlow as ReactFlowBase,
  Background,
  Controls,
} from "@xyflow/react";
import { Resizable } from "re-resizable";
import ErrorBoundary from "@/components/ErrorBoundary.jsx";
import "@xyflow/react/dist/style.css";

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
      <div className="w-full h-full" ref={graphContainerRef}>
        <ErrorBoundary>
          <ReactFlowBase
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            style={{ width: "100%", height: "100%", background: "white" }}
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
