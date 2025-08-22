import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  useNodesState,
  useEdgesState,
  useReactFlow,
  getNodesBounds,
  getViewportForBounds,
} from "@xyflow/react";
import { toPng } from "html-to-image";
import dagre from "dagre";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import RecordNode from "@/components/nodes/RecordNode.jsx";
import GroupNode from "@/components/nodes/GroupNode.jsx";
import ReactFlow from "./ReactFlow.jsx";
import { Input } from "@/components/ui/input.jsx";

import { Maximize, RotateCcw } from "lucide-react";

const EDGE_COLORS = {
  signs: "#3B82F6",
  delegates: "#3B82F6",
};

const edgeStyle = (label) => ({
  stroke: EDGE_COLORS[label] || "#D1D5DB",
  strokeWidth: 2,
});

const edgeLabelStyle = (label) => ({
  background: "white",
  color: "black",
  padding: 2,
  fontSize: label === "delegates" || label === "signs" ? 16 : 12,
});

const getCache = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const setCache = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore write errors
  }
};

/**
 * Renders a DNSSEC chain using ReactFlow.
 *
 * @param {object} props
 * @param {string} props.domain - Domain to visualize
 * @param {number} [props.refreshTrigger] - Incrementing value to trigger reload
 * @param {Function} [props.onRefresh] - Callback when the reload button is clicked
 * @param {string} [props.userId] - ID of the logged in user
 * @param {string} [props.selectedDate] - Month selected from the timeline slider (YYYY-MM)
 * @param {string} [props.maxWidth="100rem"] - Max width of the graph container
 */
const SampleGraph = ({
  domain,
  refreshTrigger,
  onRefresh,
  userId,
  selectedDate,
  maxWidth = "100rem",
}) => {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [renderTime, setRenderTime] = useState(null);
  const [dataSource, setDataSource] = useState(null);
  const [flow, setFlow] = useState({ nodes: [], edges: [] });
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const graphContainerRef = useRef(null);
  const nodeTypes = useMemo(
    () => ({ record: RecordNode, dnsGroup: GroupNode }),
    []
  );

  const reactFlowInstance = useReactFlow();

  const parseSize = (value, fallback) => {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const num = parseFloat(value);
      if (Number.isNaN(num)) return fallback;
      return value.endsWith("rem") ? num * 16 : num;
    }
    return fallback;
  };

  const [rfSize, setRfSize] = useState({
    width: parseSize(maxWidth, 1280),
    height: 600,
  });

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
          const family = decodeURIComponent(familyParam.split(":")[0]).replace(
            /\+/g,
            " "
          );
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

  const handleExportJson = useCallback(() => {
    if (!reactFlowInstance) return;
    const flowObj = reactFlowInstance.toObject();
    const blob = new Blob([JSON.stringify(flowObj, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${domain || "graph"}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [reactFlowInstance, domain]);

  const handleExportPng = useCallback(async () => {
    if (!reactFlowInstance || !graphContainerRef.current) return;

    const viewportEl = graphContainerRef.current.querySelector(
      ".react-flow__viewport"
    );
    if (!viewportEl) return;
    const hiddenEls = [];
    viewportEl.querySelectorAll(".react-flow__edge-text").forEach((el) => {
      const text = el.textContent?.trim().toLowerCase();
      if (text === "delegates" || text === "signs") {
        const wrapper = el.closest(".react-flow__edge-textwrapper") || el;
        hiddenEls.push(wrapper);
        wrapper.style.display = "none";
      }
    });

    try {
      const nodes = reactFlowInstance.getNodes?.() || [];
      let dataUrl;
      if (nodes.length) {
        const bounds = getNodesBounds(nodes);
        const padding = 40;
        const imageWidth = bounds.width + padding;
        const imageHeight = bounds.height + padding;
        const viewport = getViewportForBounds(
          bounds,
          imageWidth,
          imageHeight,
          0.5,
          2
        );
        dataUrl = await toPng(viewportEl, {
          backgroundColor: "#ffffff",
          width: imageWidth,
          height: imageHeight,
          style: {
            width: imageWidth,
            height: imageHeight,
            transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
          },
        });
      } else {
        dataUrl = await toPng(viewportEl, {
          backgroundColor: "#ffffff",
        });
      }
      const link = document.createElement("a");
      link.setAttribute("download", `${domain || "graph"}.png`);
      link.setAttribute("href", dataUrl);
      link.click();
    } finally {
      hiddenEls.forEach((el) => {
        el.style.display = "";
      });
    }
  }, [reactFlowInstance, domain]);

  const handleFitView = useCallback(() => {
    if (!reactFlowInstance) return;
    const nodes = reactFlowInstance.getNodes?.() || [];
    if (!nodes.length) return;
    const bounds = getNodesBounds(nodes);
    const scale = 0.7;
    setRfSize({ width: bounds.width / scale, height: bounds.height / scale });
    requestAnimationFrame(() => {
      reactFlowInstance.fitView({ includeHiddenNodes: true, padding: 0.01 });
      reactFlowInstance.zoomTo?.(scale);
    });
  }, [reactFlowInstance]);



  const buildFlow = useCallback((data) => {
    if (!data || !Array.isArray(data.levels)) return { nodes: [], edges: [] };

    const nodeWidth = 260;
    const nodeHeight = 100;
    const nodeGap = 40;
    const groupGap = 120;
    const nodeScale = 1.2;
    const horizontalPadding = nodeWidth / 2;
    const topPadding = nodeGap;
    const bottomPadding = nodeGap / 2;

    const levelNodes = [];
    const levelEdges = [];
    const crossEdges = [];
    const groupNodes = [];

    data.levels.forEach((level, idx) => {
      const groupId = `level_${idx}`;
      const securityTooltip =
        level.dnssec_status?.status === "signed" ? "SECURE" : "INSECURE";

      const nodes = [];
      const edges = [];
      const levelType = idx === 0 ? "root" : "net";

      const allKsk =
        (level.records?.dnskey_records || []).filter((k) => k.is_ksk) || [];
      const ksk = allKsk[0] || level.key_hierarchy?.ksk_keys?.[0] || null;
      const kskTooltip = ksk
        ? `Key Tag: ${ksk.key_tag}\nFlags: ${ksk.flags}\nTTL: ${ksk.ttl}s (${
            ksk.ttl_human
          })\nAlg: ${ksk.algorithm_name || ksk.algorithm}\nSize: ${
            ksk.key_size
          }`
        : "No KSK";
      const kskId = `ksk_${idx}`;
      const zskRecords = (level.records?.dnskey_records || []).filter(
        (r) => r.is_zsk
      );

      groupNodes.push({
        id: groupId,
        type: "dnsGroup",
        draggable: true,
        data: {
          label: level.display_name || `Level ${idx}`,
          tooltip: `${
            level.display_name || `Level ${idx}`
          }\n${securityTooltip}`,
          nodeType: levelType,
        },
        position: { x: 0, y: 0 },
      });
      nodes.push({
        id: kskId,
        type: "record",
        parentId: groupId,
        extent: "parent",
        draggable: true,
        data: {
          label: ksk ? "KSK" : "NO KSK",
          tooltip: kskTooltip,
          domain: level.display_name,
          flags: ksk?.flags,
          size: ksk?.key_size,
          nodeType: levelType,
        },
        style: { width: nodeWidth },
      });

      const numZsk = idx === 0 ? Math.min(3, zskRecords.length) : 1;
      const firstZskId = `zsk_${idx}_0`;
      for (let j = 0; j < numZsk; j++) {
        const zskId = `zsk_${idx}_${j}`;
        const zskRecord = zskRecords[j];
        const zskTooltip = zskRecord
          ? `Key Tag: ${zskRecord.key_tag}\nFlags: ${zskRecord.flags}\nTTL: ${
              zskRecord.ttl
            }s (${zskRecord.ttl_human})\nAlg: ${
              zskRecord.algorithm_name || zskRecord.algorithm
            }\nSize: ${zskRecord.key_size}`
          : "No ZSK";
        nodes.push({
          id: zskId,
          type: "record",
          parentId: groupId,
          extent: "parent",
          draggable: true,
          data: {
            label: zskRecord ? "ZSK" : "NO ZSK",
            tooltip: zskTooltip,
            domain: level.display_name,
            flags: zskRecord?.flags,
            size: zskRecord?.key_size,
            nodeType: levelType,
          },
          style: { width: nodeWidth },
        });
        const signLabel = ksk && zskRecord ? "signs" : "no signing";
        edges.push({
          id: `${kskId}-${zskId}`,
          source: kskId,
          target: zskId,
          label: signLabel,
          type: "bezier",
          animated: true,
          style: edgeStyle(signLabel),
          labelStyle: edgeLabelStyle(signLabel),
        });
      }

      if (idx < data.levels.length - 1) {
        const dsId = `ds_${idx}_${idx + 1}`;
        const child = data.levels[idx + 1];
        const ds = child.records?.ds_records?.[0];
        const dsTooltip = ds
          ? `Key Tag: ${ds.key_tag}\nTTL: ${ds.ttl}s (${ds.ttl_human})\nAlg: ${
              ds.algorithm_name || ds.algorithm
            }\nDigest: ${ds.digest}`
          : "NO DS";
        nodes.push({
          id: dsId,
          type: "record",
          parentId: groupId,
          extent: "parent",
          draggable: true,
          data: {
            label: ds ? "Delegation Signer (DS)" : "NO DS",
            tooltip: dsTooltip,
            domain: level.display_name,
            nodeType: "ds",
          },
          style: { width: nodeWidth },
        });
        edges.push({
          id: `zsk_${idx}_0-${dsId}`,
          source: firstZskId,
          target: dsId,
          label: "signs",
          type: "bezier",
          animated: true,
          style: edgeStyle("signs"),
          labelStyle: edgeLabelStyle("signs"),
        });
        crossEdges.push({
          id: `${dsId}-ksk_${idx + 1}`,
          source: dsId,
          target: `ksk_${idx + 1}`,
          label: ds ? "delegates" : "no delegation",
          type: "bezier",
          animated: true,
          labelStyle: edgeLabelStyle(ds ? "delegates" : "no delegation"),
          style: edgeStyle(ds ? "delegates" : "no delegation"),
        });
      } else {
        const recordLabels = {
          TXT: "Text (TXT)",
          MX: "Mail Exchange (MX)",
          A: "IPV4 Address (A)",
          AAAA: "IPv6 Address (AAAA)",
          SOA: "Start of Authority (SOA)",
        };
        const recordTypes = [
          ["TXT", level.records?.txt_records],
          ["MX", level.records?.mx_records],
          ["A", level.records?.a_records],
          ["AAAA", level.records?.aaaa_records],
          ["SOA", level.records?.soa_record ? [level.records.soa_record] : []],
        ];
        recordTypes.forEach(([type, recs], rIdx) => {
          if (!recs || recs.length === 0) return;
          const rec = recs[0];
          const recId = `${type.toLowerCase()}_${idx}_${rIdx}`;
          const tooltip = Array.isArray(recs)
            ? recs.map((r) => r.value || `${r.mname || ""}`.trim()).join("\n")
            : JSON.stringify(recs);
          nodes.push({
            id: recId,
            type: "record",
            parentId: groupId,
            extent: "parent",
            draggable: true,
            data: {
              label: recordLabels[type] || type,
              tooltip,
              domain: level.display_name,
              nodeType: levelType,
            },
            style: { width: nodeWidth },
          });
          const edgeLabel = rec.signed ? "signs" : "unsigned";
          edges.push({
            id: `${firstZskId}-${recId}`,
            source: firstZskId,
            target: recId,
            label: edgeLabel,
            type: "bezier",
            animated: true,
            labelStyle: edgeLabelStyle(edgeLabel),
            style: edgeStyle(edgeLabel),
          });
        });
      }

      levelNodes.push(nodes);
      levelEdges.push(edges);
    });

    const layoutedNodes = [];
    let currentY = 0;

    levelNodes.forEach((nodes, idx) => {
      const g = new dagre.graphlib.Graph();
      g.setDefaultEdgeLabel(() => ({}));
      g.setGraph({ rankdir: "TB", nodesep: nodeGap, ranksep: nodeGap });

      nodes.forEach((node) => {
        g.setNode(node.id, { width: nodeWidth, height: nodeHeight });
      });
      levelEdges[idx].forEach((edge) => {
        g.setEdge(edge.source, edge.target);
      });

      dagre.layout(g);

      const { width: gw, height: gh } = g.graph();

      const groupNode = groupNodes[idx];
      const groupPosition = { x: -horizontalPadding, y: currentY - topPadding };
      const groupWidth = gw + horizontalPadding * 2;
      const groupHeight = gh + topPadding + bottomPadding;
      layoutedNodes.push({
        ...groupNode,
        position: groupPosition,
        style: {
          width: groupWidth,
          height: groupHeight,
          padding: 0,
          background: "transparent",
        },
        data: groupNode.data,
      });

      nodes.forEach((node) => {
        const { x, y } = g.node(node.id);
        const scaledWidth = nodeWidth * nodeScale;
        const scaledHeight = nodeHeight * nodeScale;
        layoutedNodes.push({
          ...node,
          position: {
            x: horizontalPadding + x - scaledWidth / 2,
            y: topPadding + y - scaledHeight / 2,
          },
          sourcePosition: "bottom",
          targetPosition: "top",
          style: { ...node.style, width: scaledWidth, height: scaledHeight },
        });
      });

      currentY += gh + groupGap;
    });

    const edges = levelEdges.flat().concat(crossEdges);

    return { nodes: layoutedNodes, edges };
  }, []);

  const fetchData = useCallback(async () => {
    if (!domain) {
      setFlow({ nodes: [], edges: [] });
      setNodes([]);
      setEdges([]);
      setSummary(null);
      return;
    }

    const start = performance.now();
    let json = null;
    let source = "network";
    const key = `chain_${domain.toLowerCase()}`;

    try {
      setLoading(true);

      const cached = getCache(key);
      if (cached) {
        try {
          json = JSON.parse(cached);
          source = "cache";
        } catch {
          json = null;
        }
      }

      if (!json) {
        let url = `http://127.0.0.1:8000/chain/${encodeURIComponent(domain)}`;
        const params = [];
        if (userId) params.push(`user_id=${encodeURIComponent(userId)}`);
        if (selectedDate)
          params.push(`date=${encodeURIComponent(selectedDate)}`);
        if (params.length) {
          url += `?${params.join("&")}`;
        }
        const res = await fetch(url);
        json = await res.json();
        setCache(key, JSON.stringify(json));
      }

      const layouted = buildFlow(json);
      setFlow(layouted);
      setNodes(layouted.nodes);
      setEdges(layouted.edges);
      setSummary(json.chain_summary || null);
    } catch (err) {
      console.error("Failed to fetch DNSSEC chain", err);
      setSummary(null);
    } finally {
      setLoading(false);
      const elapsed = Math.round(performance.now() - start);
      setRenderTime(elapsed);
      setDataSource(source);
      console.log(
        `Chain data for ${domain} loaded in ${elapsed} ms from ${source}`
      );
    }
  }, [domain, buildFlow, userId, selectedDate, setNodes, setEdges]);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshTrigger]);

  useEffect(() => {
    setNodes(flow.nodes);
    setEdges(flow.edges);
  }, [flow, setNodes, setEdges]);

  useEffect(() => {
    const nodes = reactFlowInstance.getNodes?.() || [];
    if (!nodes.length) return;
    const bounds = getNodesBounds(nodes);
    const scale = 0.7;
    setRfSize({ width: bounds.width / scale, height: bounds.height / scale });
    const id = requestAnimationFrame(() => {
      reactFlowInstance.fitView({ includeHiddenNodes: true, padding: 0.01 });
      reactFlowInstance.zoomTo?.(scale);
    });
    return () => cancelAnimationFrame(id);
  }, [flow, reactFlowInstance, setRfSize]);

  if (!domain) {
    return (
      <div className="text-center text-gray-500">
        Enter a domain to visualize
      </div>
    );
  }

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="relative">
      <Card
        className="w-full bg-card border-border mx-auto"
        style={{ maxWidth }}
      >
        <CardContent className="relative px-6 py-6 lg:px-8 lg:py-8 flex justify-center overflow-auto">
          <div className="w-full overflow-hidden flex flex-col gap-4">
            {summary && (
              <div className="text-left">
                <h2 className="font-semibold text-lg text-foreground">
                  {domain}
                </h2>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <span>
                    Levels: {summary.total_levels} • Signed {""}
                    {summary.signed_levels} • Breaks {""}
                    {summary.chain_breaks?.length - 1 || 0}
                  </span>
                  <Input
                    type="text"
                    placeholder="Font CSS URL"
                    value={fontUrl}
                    onChange={handleFontUrlChange}
                    className="h-8 w-48"
                  />
                </div>
                {renderTime !== null && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Loaded in {renderTime} ms
                    {dataSource ? ` from ${dataSource}` : ""}
                  </p>
                )}
              </div>
            )}
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                rfSize={rfSize}
                setRfSize={setRfSize}
                graphContainerRef={graphContainerRef}
              />
            </div>
        </CardContent>
      </Card>
      <div className="absolute -right-16 top-4 flex flex-col gap-2 items-center">
        <Button
          size="icon"
          variant="secondary"
          onClick={onRefresh}
          disabled={!domain}
          className="h-12 w-12"
          type="button"
        >
          <RotateCcw className="h-6 w-6" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          onClick={handleFitView}
          type="button"
        >
          <Maximize className="h-4 w-4" />
        </Button>
        <Button variant="secondary" onClick={handleExportJson} type="button">
          JSON
        </Button>
        <Button variant="secondary" onClick={handleExportPng} type="button">
          PNG
        </Button>
      </div>
    </div>
  );
};

export default SampleGraph;
