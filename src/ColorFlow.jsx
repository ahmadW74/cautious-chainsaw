import React, { useState } from "react";
import {
  ReactFlow as ReactFlowBase,
  Background,
  Controls,
} from "@xyflow/react";
import { Resizable } from "re-resizable";
import ErrorBoundary from "@/components/ErrorBoundary.jsx";
import NebulaBackground from "@/components/NebulaBackground.jsx";
import { Input } from "@/components/ui/input.jsx";
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
  const [zoom, setZoom] = useState(0.8);
  const [focus, setFocus] = useState({ x: 0, y: 0 });
  const [fontUrl, setFontUrl] = useState("");

  const handleFontUrlChange = (e) => {
    const url = e.target.value;
    setFontUrl(url);

    const existing = document.getElementById("dynamic-node-font");
    if (existing) existing.remove();

    if (url) {
      const link = document.createElement("link");
      link.id = "dynamic-node-font";
      link.rel = "stylesheet";
      link.href = url;
      document.head.appendChild(link);

      try {
        const u = new URL(url);
        const familyParam = u.searchParams.get("family");
        if (familyParam) {
          const family = decodeURIComponent(familyParam.split(":")[0]).replace(/\+/g, " ");
          document.documentElement.style.setProperty(
            "--node-font-family",
            `'${family}', sans-serif`
          );
        }
      } catch {
        // ignore URL parse errors
      }
    } else {
      document.documentElement.style.removeProperty("--node-font-family");
    }
  };

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
      <div className="absolute top-1 right-1 z-10 w-48">
        <Input
          type="text"
          placeholder="Font CSS URL"
          value={fontUrl}
          onChange={handleFontUrlChange}
          className="h-8"
        />
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
            defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
            onMove={(e, vp) => {
              setZoom(vp.zoom);
              setFocus({ x: vp.x, y: vp.y });
            }}
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
