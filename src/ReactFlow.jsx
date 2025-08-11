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
            style={{
              width: "100%",
              height: "100%",
              fontFamily: "'Roboto Flex', sans-serif",
              color: "#ffffff",
              fontWeight: "bold",
            }}
            defaultEdgeOptions={{
              style: { stroke: "#9333ea", strokeWidth: 2 },
              labelStyle: {
                color: "#ffffff",
                fontWeight: "bold",
                fontFamily: "'Roboto Flex', sans-serif",
              },
            }}
          >
            <Background />
            <Controls />
          </ReactFlowBase>
        </ErrorBoundary>
      </div>
    </Resizable>
  );
};

export default ReactFlow;

