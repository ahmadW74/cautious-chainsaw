import React, { useState } from "react";
import {
  ReactFlow as ReactFlowBase,
  Controls,
} from "@xyflow/react";
import { Resizable } from "re-resizable";
import ErrorBoundary from "@/components/ErrorBoundary.jsx";
import "@xyflow/react/dist/style.css";

const defaultEdgeOptions = {
  type: "bezier",
  animated: true,
  style: { stroke: "#D1D5DB", strokeWidth: 2 },
};

/**
 * Renders a ReactFlow graph with resizing support.
 *
 * @param {object} props
 * @param {Array} props.nodes - ReactFlow nodes
 * @param {Array} props.edges - ReactFlow edges
 * @param {Function} props.onNodesChange - Handler for node changes
 * @param {Function} props.onEdgesChange - Handler for edge changes
 * @param {object} props.nodeTypes - Custom node types
 * @param {{width:number|string, height:number|string}} props.rfSize - Current size of the graph
 * @param {Function} props.setRfSize - Setter for graph size
 * @param {React.MutableRefObject} props.graphContainerRef - Ref to the container element
 */
const ReactFlow = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  nodeTypes,
  rfSize,
  setRfSize,
  graphContainerRef,
}) => {
  const [interactive, setInteractive] = useState(true);

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
      <div
        className="w-full h-full"
        ref={graphContainerRef}
      >
        <ErrorBoundary>
          <ReactFlowBase
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            defaultViewport={{ x: 0, y: 0, zoom: 0.7 }}
            defaultEdgeOptions={defaultEdgeOptions}
            nodesDraggable={interactive}
            nodesConnectable={interactive}
            elementsSelectable={interactive}
            panOnDrag={interactive}
            zoomOnScroll={interactive}
            zoomOnPinch={interactive}
            panOnScroll={interactive}
            style={{
              width: "100%",
              height: "100%",
              background: "#F9FAFB",
              fontFamily: "'Source Sans Pro', sans-serif",
              "--node-font-family": "'Source Sans Pro', sans-serif",
            }}
          >
            <Controls showInteractive onInteractiveChange={setInteractive} />
          </ReactFlowBase>
        </ErrorBoundary>
      </div>
    </Resizable>
  );
};

export default ReactFlow;

