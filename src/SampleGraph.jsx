import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Graphviz from "graphviz-react";
import { graphviz } from "d3-graphviz";
import {
  useNodesState,
  useEdgesState,
  useReactFlow,
  getNodesBounds,
  getViewportForBounds,
} from "@xyflow/react";
import { toPng } from "html-to-image";
import dagre from "dagre";
import ErrorBoundary from "@/components/ErrorBoundary.jsx";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import RecordNode from "@/components/nodes/RecordNode.jsx";
import GroupNode from "@/components/nodes/GroupNode.jsx";
import ReactFlow from "./ReactFlow.jsx";
import { Input } from "@/components/ui/input.jsx";

import { Maximize, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";

const EDGE_COLORS = {
  signs: "#3B82F6",
  delegates: "#10B981",
};

const edgeStyle = (label) => ({
  stroke: EDGE_COLORS[label] || "#D1D5DB",
  strokeWidth: 2,
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
 * Renders a DNSSEC chain as a Graphviz diagram.
 *
 * @param {object} props
 * @param {string} props.domain - Domain to visualize
 * @param {number} [props.refreshTrigger] - Incrementing value to trigger reload
 * @param {Function} [props.onRefresh] - Callback when the reload button is clicked
 * @param {string} [props.userId] - ID of the logged in user
 * @param {string} [props.selectedDate] - Month selected from the timeline slider (YYYY-MM)
 * @param {string} props.viewMode - Display mode (graphviz or reactflow)
 * @param {string} [props.maxWidth="80rem"] - Max width of the graph container
 * @param {number|string} [props.height=1113] - Height of the graph container
 */
const SampleGraph = ({
  domain,
  refreshTrigger,
  onRefresh,
  userId,
  selectedDate,
  viewMode,
  maxWidth = "80rem",
  height = 1113,
}) => {
  const [dot, setDot] = useState("digraph DNSSEC {}");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [renderTime, setRenderTime] = useState(null);
  const [dataSource, setDataSource] = useState(null);
  const [tooltip, setTooltip] = useState({
    visible: false,
    text: "",
    x: 0,
    y: 0,
  });
  const [pinnedTooltip, setPinnedTooltip] = useState(null);
  const [flow, setFlow] = useState({ nodes: [], edges: [] });
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const cleanupRef = useRef(null);
  const graphContainerRef = useRef(null);
  const graphvizOptions = useMemo(
    () => ({ engine: "dot", width: "100%", height: "100%", zoom: true }),
    []
  );
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
    height: parseSize(height, 1113),
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
      reactFlowInstance.fitView({ includeHiddenNodes: true, padding: 0.1 });
      reactFlowInstance.zoomTo?.(scale);
    });
  }, [reactFlowInstance]);

  const handleZoom = useCallback((factor) => {
    if (!graphContainerRef.current) return;
    const el = graphContainerRef.current.querySelector("[id^='graphviz']");
    if (!el) return;
    const gv = graphviz(`#${el.id}`);
    const behavior = gv.zoomBehavior();
    const selection = gv.zoomSelection();
    if (behavior && selection) {
      behavior.scaleBy(selection, factor);
    }
  }, []);

  const zoomIn = useCallback(() => handleZoom(1.2), [handleZoom]);
  const zoomOut = useCallback(() => handleZoom(0.8), [handleZoom]);

  useEffect(() => {
    const container = graphContainerRef.current;
    if (!container) return;

    const attach = () => {
      const el = container.querySelector('[id^="graphviz"]');
      if (!el) return;
      const titles = el.querySelectorAll("title");
      const listeners = [];
      titles.forEach((title) => {
        const parent = title.parentElement;
        const text = title.textContent || "";
        title.remove();
        if (parent) {
          const show = (e) => {
            setTooltip({
              visible: true,
              text,
              x: e.clientX + 10,
              y: e.clientY + 10,
            });
          };
          const move = (e) => {
            setTooltip((t) =>
              t.visible ? { ...t, x: e.clientX + 10, y: e.clientY + 10 } : t
            );
          };
          const hide = () => setTooltip((t) => ({ ...t, visible: false }));
          const pin = (e) => {
            setPinnedTooltip({ text, x: e.clientX + 10, y: e.clientY + 10 });
          };
          parent.addEventListener("mouseenter", show);
          parent.addEventListener("mousemove", move);
          parent.addEventListener("mouseleave", hide);
          parent.addEventListener("click", pin);
          listeners.push({ parent, show, move, hide, pin });
        }
      });
      cleanupRef.current = () => {
        listeners.forEach(({ parent, show, move, hide, pin }) => {
          parent.removeEventListener("mouseenter", show);
          parent.removeEventListener("mousemove", move);
          parent.removeEventListener("mouseleave", hide);
          parent.removeEventListener("click", pin);
        });
      };
    };

    const id = setTimeout(attach, 0);
    return () => {
      clearTimeout(id);
      if (cleanupRef.current) cleanupRef.current();
    };
  }, [dot]);
  /**
   * Build a Graphviz dot string from API data.
   * The graph places each DNS level in a cluster box and connects
   * parent ZSKs to DS records and then to the child's KSK.
   * Unsigned levels are rendered in gray with red connecting arrows.
   */
  const buildDot = useCallback((data) => {
    if (!data || !Array.isArray(data.levels)) return "digraph{}";

    const escape = (s) =>
      String(s || "")
        .replace(/\n/g, "\\n")
        .replace(/"/g, '\\"');

    let dotStr =
      "digraph DNSSEC_Chain {\n" +
      "  rankdir=TB;\n" +
      "  compound=true;\n" +
      "  splines=curved;\n" +
      "  nodesep=0.6;\n" +
      "  ranksep=0.6;\n" +
      '  fontname="Arial";\n' +
      '  node [shape=ellipse, style=filled, fontname="Arial", fontsize=14, width=1.5, height=0.9];\n' +
      '  edge [color=black, penwidth=2, fontname="Arial", fontsize=12];\n';

    // Render each zone cluster
    data.levels.forEach((level, idx) => {
      const allKsk =
        (level.records?.dnskey_records || []).filter((k) => k.is_ksk) || [];
      const allZsk =
        (level.records?.dnskey_records || []).filter((k) => k.is_zsk) || [];

      const ksk = allKsk[0] || level.key_hierarchy?.ksk_keys?.[0] || null;

      const zskNodes = idx === 0 ? allZsk.slice(0, 3) : [allZsk[0]];
      const kskTooltip = ksk
        ? `Key Tag: ${ksk.key_tag}\nFlags: ${ksk.flags}\nTTL: ${ksk.ttl}s (${ksk.ttl_human})\nAlg: ${
            ksk.algorithm_name || ksk.algorithm
          }\nSize: ${ksk.key_size}`
        : "No KSK";
      const zskTooltips = zskNodes.map((z) =>
        z
          ? `Key Tag: ${z.key_tag}\nFlags: ${z.flags}\nTTL: ${z.ttl}s (${z.ttl_human})\nAlg: ${
              z.algorithm_name || z.algorithm
            }\nSize: ${z.key_size}`
          : "No ZSK"
      );
      const nsTooltip = escape((level.records?.ns_records || []).join("\n"));

      const securityTooltip =
        level.dnssec_status?.status === "signed" ? "SECURE" : "INSECURE";

      dotStr += `  subgraph cluster_${idx} {\n`;
      dotStr += `    label="${level.display_name}";\n`;
      dotStr += `    labeltooltip="${nsTooltip}";\n`;
      dotStr += `    tooltip="${securityTooltip}";\n`;
      dotStr += "    labelloc=t;\n";
      dotStr += "    labeljust=l;\n";
      dotStr += "    style=dotted;\n";
      dotStr += "    penwidth=2;\n";
      dotStr += "    color=green;\n";
      dotStr += '    fillcolor="#e6ffe6";\n\n';

      dotStr += `    ksk_${idx} [label="${
        ksk ? "KSK" : "NO KSK"
      }" fillcolor="#ffcccc" tooltip="${escape(kskTooltip)}"];\n`;

      zskNodes.forEach((z, j) => {
        const zLabel = zskNodes[j] ? "ZSK" : "NO ZSK";
        dotStr += `    zsk_${idx}_${j} [label="${zLabel}" fillcolor="#ffdddd" tooltip="${escape(
          zskTooltips[j]
        )}"];\n`;
      });

      if (idx < data.levels.length - 1) {
        const child = data.levels[idx + 1];
        const ds = child.records?.ds_records?.[0];
        const dsTooltip = ds
          ? `Key Tag: ${ds.key_tag}\nTTL: ${ds.ttl}s (${ds.ttl_human})\nAlg: ${
              ds.algorithm_name || ds.algorithm
            }\nDigest: ${ds.digest}`
          : "NO DS";
        const label = ds ? "DS" : "NO DS";
        const extra = ds ? "" : " style=dashed";
        dotStr += `    ds_${idx}_${
          idx + 1
        } [label="${label}" fillcolor="#ccccff" tooltip="${escape(
          dsTooltip
        )}"${extra}];\n`;
      }

      zskNodes.forEach((z, j) => {
        const signLabel = ksk && z ? "signs" : "no signing";
        const color = ksk && z ? "" : " color=red";
        dotStr += `    ksk_${idx} -> zsk_${idx}_${j} [label="${signLabel}"${color}];\n`;
      });
      if (idx < data.levels.length - 1) {
        dotStr += `    zsk_${idx}_0 -> ds_${idx}_${
          idx + 1
        } [label="delegates"];\n`;
      }

      dotStr += "  }\n";
    });

    for (let i = 0; i < data.levels.length - 1; i++) {
      const child = data.levels[i + 1];
      const ds = child.records?.ds_records?.[0];
      if (ds) {
        dotStr += `  ds_${i}_${i + 1} -> ksk_${
          i + 1
        } [ltail=cluster_${i}, lhead=cluster_${i + 1}, label="delegates"];\n`;
        dotStr += `  ds_${i}_${i + 1} -> zsk_${
          i + 1
        }_0 [ltail=cluster_${i}, lhead=cluster_${i + 1}];\n`;
      } else {
        dotStr += `  ds_${i}_${i + 1} -> ksk_${
          i + 1
        } [ltail=cluster_${i}, lhead=cluster_${
          i + 1
        }, label="no delegation", color=red];\n`;
      }
    }

    // Delegation edges between zones
    dotStr += "}";
    return dotStr;
  }, []);

  const buildFlow = useCallback((data) => {
    if (!data || !Array.isArray(data.levels)) return { nodes: [], edges: [] };

    const nodeWidth = 260;
    const nodeHeight = 100;
    const nodeGap = 40;
    const groupGap = 120;
    const nodeScale = 1.2;

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
      const levelType = idx === 0 ? "root" : idx === 1 ? "tld" : "net";

      const allKsk =
        (level.records?.dnskey_records || []).filter((k) => k.is_ksk) || [];
      const ksk = allKsk[0] || level.key_hierarchy?.ksk_keys?.[0] || null;
      const kskTooltip = ksk
        ? `Key Tag: ${ksk.key_tag}\nFlags: ${ksk.flags}\nTTL: ${ksk.ttl}s (${ksk.ttl_human})\nAlg: ${
            ksk.algorithm_name || ksk.algorithm
          }\nSize: ${ksk.key_size}`
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
          ? `Key Tag: ${zskRecord.key_tag}\nFlags: ${zskRecord.flags}\nTTL: ${zskRecord.ttl}s (${zskRecord.ttl_human})\nAlg: ${
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
          labelStyle: { background: "white", color: "black", padding: 2 },
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
            label: ds ? "DS" : "NO DS",
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
          labelStyle: { background: "white", color: "black", padding: 2 },
        });
        crossEdges.push({
          id: `${dsId}-ksk_${idx + 1}`,
          source: dsId,
          target: `ksk_${idx + 1}`,
          label: ds ? "delegates" : "no delegation",
          type: "bezier",
          animated: true,
          labelStyle: { background: "white", color: "black", padding: 2 },
          style: edgeStyle(ds ? "delegates" : "no delegation"),
        });
      } else {
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
            ? recs.map((r) => r.value || `${r.mname || ''}`.trim()).join("\n")
            : JSON.stringify(recs);
          nodes.push({
            id: recId,
            type: "record",
            parentId: groupId,
            extent: "parent",
            draggable: true,
            data: {
              label: type,
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
            labelStyle: { background: "white", color: "black", padding: 2 },
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
      const groupPosition = { x: -nodeWidth, y: currentY - nodeGap / 2 };
      const groupWidth = gw + nodeWidth * 2;
      const groupHeight = gh + nodeGap;
      layoutedNodes.push({
        ...groupNode,
        position: groupPosition,
        style: {
          width: groupWidth,
          height: groupHeight,
          padding: 10,
          background: "transparent",
        },
        data: groupNode.data,
      });

      nodes.forEach((node) => {
        const { x, y } = g.node(node.id);
        const relX = x + nodeWidth / 2;
        const relY = y - nodeHeight / 2 + nodeGap / 2;
        const scaledWidth = nodeWidth * nodeScale;
        const scaledHeight = nodeHeight * nodeScale;
        layoutedNodes.push({
          ...node,
          position: {
            x: relX - (scaledWidth - nodeWidth) / 2,
            y: relY - (scaledHeight - nodeHeight) / 2,
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
      setDot("digraph DNSSEC {}");
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

      setDot(buildDot(json));
      const layouted = buildFlow(json);
      setFlow(layouted);
      setNodes(layouted.nodes);
      setEdges(layouted.edges);
      setSummary(json.chain_summary || null);
    } catch (err) {
      console.error("Failed to fetch DNSSEC chain", err);
      setDot("digraph DNSSEC {}");
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
  }, [domain, buildDot, buildFlow, userId, selectedDate, setNodes, setEdges]);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshTrigger]);

  useEffect(() => {
    setNodes(flow.nodes);
    setEdges(flow.edges);
  }, [flow, setNodes, setEdges]);

  useEffect(() => {
    if (viewMode !== "reactflow") return;
    const nodes = reactFlowInstance.getNodes?.() || [];
    if (!nodes.length) return;
    const bounds = getNodesBounds(nodes);
    const scale = 0.7;
    setRfSize({ width: bounds.width / scale, height: bounds.height / scale });
    const id = requestAnimationFrame(() => {
      reactFlowInstance.fitView({ includeHiddenNodes: true, padding: 0.1 });
      reactFlowInstance.zoomTo?.(scale);
    });
    return () => cancelAnimationFrame(id);
  }, [flow, viewMode, reactFlowInstance, setRfSize]);

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
            {viewMode === "graphviz" ? (
              <div
                ref={graphContainerRef}
                className="relative w-full border border-border rounded overflow-hidden mx-auto"
                style={{ maxWidth, height }}
              >
                <div className="w-full h-full">
                  <ErrorBoundary>
                    <Graphviz
                      dot={dot}
                      options={graphvizOptions}
                      style={{ width: "100%", height: "100%" }}
                    />
                  </ErrorBoundary>
                </div>
              </div>
            ) : (
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
            )}
          </div>
        </CardContent>
      </Card>
      {tooltip.visible && (
        <div
          className="pointer-events-none fixed z-50 bg-primary text-primary-foreground rounded-md px-2 py-1 text-xs"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.text}
        </div>
      )}
      {pinnedTooltip && (
        <div
          className="fixed z-50 bg-primary text-primary-foreground rounded-md px-2 py-1 text-xs cursor-pointer"
          style={{ left: pinnedTooltip.x, top: pinnedTooltip.y }}
          onClick={() => setPinnedTooltip(null)}
        >
          {pinnedTooltip.text}
        </div>
      )}
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
          {viewMode === "reactflow" && (
          <>
            <Button
              size="icon"
              variant="secondary"
              onClick={handleFitView}
              type="button"
            >
              <Maximize className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              onClick={handleExportJson}
              type="button"
            >
              JSON
            </Button>
            <Button
              variant="secondary"
              onClick={handleExportPng}
              type="button"
            >
              PNG
            </Button>
          </>
        )}
        {viewMode === "graphviz" && (
          <>
            <Button
              size="icon"
              variant="secondary"
              onClick={zoomIn}
              type="button"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              onClick={zoomOut}
              type="button"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default SampleGraph;
