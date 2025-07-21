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
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import dagre from "dagre";
import ErrorBoundary from "@/components/ErrorBoundary.jsx";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import RecordNode from "@/components/nodes/RecordNode.jsx";
import GroupNode from "@/components/nodes/GroupNode.jsx";

import { RotateCcw, ZoomIn, ZoomOut } from "lucide-react";

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
 * @param {string} [props.maxWidth="56rem"] - Max width of the graph container
 * @param {string} [props.height="28rem"] - Height of the graph container
 */
const SampleGraph = ({
  domain,
  refreshTrigger,
  onRefresh,
  userId,
  selectedDate,
  viewMode,
  maxWidth = "56rem",
  height = "28rem",
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
          parent.addEventListener("mouseenter", show);
          parent.addEventListener("mousemove", move);
          parent.addEventListener("mouseleave", hide);
          listeners.push({ parent, show, move, hide });
        }
      });
      cleanupRef.current = () => {
        listeners.forEach(({ parent, show, move, hide }) => {
          parent.removeEventListener("mouseenter", show);
          parent.removeEventListener("mousemove", move);
          parent.removeEventListener("mouseleave", hide);
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
        ? `Key ID: ${ksk.key_tag}\nAlg: ${
            ksk.algorithm_name || ksk.algorithm
          }\nSize: ${ksk.key_size}`
        : "No KSK";
      const zskTooltips = zskNodes.map((z) =>
        z
          ? `Key ID: ${z.key_tag}\nAlg: ${
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

      dotStr += `    ksk_${idx} [label="KSK" fillcolor="#ffcccc" tooltip="${escape(
        kskTooltip
      )}"];\n`;

      zskNodes.forEach((z, j) => {
        dotStr += `    zsk_${idx}_${j} [label="ZSK" fillcolor="#ffdddd" tooltip="${escape(
          zskTooltips[j]
        )}"];\n`;
      });

      if (idx < data.levels.length - 1) {
        const child = data.levels[idx + 1];
        const ds = child.records?.ds_records?.[0];
        const dsTooltip = ds
          ? `Key ID: ${ds.key_tag}\nAlg: ${
              ds.algorithm_name || ds.algorithm
            }\nDigest: ${ds.digest}`
          : "No DS";
        if (ds) {
          dotStr += `    ds_${idx}_${
            idx + 1
          } [label="DS" fillcolor="#ccccff" tooltip="${escape(dsTooltip)}"];\n`;
        } else {
          dotStr += `    ds_${idx}_${
            idx + 1
          } [label="No DS" fillcolor="#ffe6e6" tooltip="No DS record" style=dashed];\n`;
        }
      }

      zskNodes.forEach((_, j) => {
        dotStr += `    ksk_${idx} -> zsk_${idx}_${j} [label="signs"];\n`;
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
        dotStr += `  zsk_${i}_0 -> ksk_${
          i + 1
        } [ltail=cluster_${i}, lhead=cluster_${
          i + 1
        }, style=dashed, label="unsigned"];\n`;
      }
    }

    // Delegation edges between zones
    dotStr += "}";
    return dotStr;
  }, []);


  const buildFlow = useCallback((data) => {
    if (!data || !Array.isArray(data.levels)) return { nodes: [], edges: [] };

    const levelNodes = [];
    const levelEdges = [];
    const crossEdges = [];
    const groupNodes = [];

    data.levels.forEach((level, idx) => {
      const groupId = `level_${idx}`;
      const securityTooltip =
        level.dnssec_status?.status === 'signed' ? 'SECURE' : 'INSECURE';
      groupNodes.push({
        id: groupId,
        type: 'dnsGroup',
        draggable: true,
        data: {
          label: level.display_name || `Level ${idx}`,
          tooltip: securityTooltip,
        },
        position: { x: 0, y: 0 },
      });

      const nodes = [];
      const edges = [];

      const allKsk = (level.records?.dnskey_records || []).filter((k) => k.is_ksk) || [];
      const ksk = allKsk[0] || level.key_hierarchy?.ksk_keys?.[0] || null;
      const kskTooltip = ksk
        ? `Key ID: ${ksk.key_tag}\nAlg: ${ksk.algorithm_name || ksk.algorithm}\nSize: ${ksk.key_size}`
        : 'No KSK';
      const kskId = `ksk_${idx}`;
      nodes.push({
        id: kskId,
        type: 'record',
        parentNode: groupId,
        extent: 'parent',
        draggable: true,
        data: { label: 'KSK', tooltip: kskTooltip },
        style: { background: '#ffcccc' },
      });

      const zskRecords = (level.records?.dnskey_records || []).filter((r) => r.is_zsk);
      const numZsk = idx === 0 ? Math.min(3, zskRecords.length) : 1;
      const firstZskId = `zsk_${idx}_0`;
      for (let j = 0; j < numZsk; j++) {
        const zskId = `zsk_${idx}_${j}`;
        const zskRecord = zskRecords[j];
        const zskTooltip = zskRecord
          ? `Key ID: ${zskRecord.key_tag}\nAlg: ${zskRecord.algorithm_name || zskRecord.algorithm}\nSize: ${zskRecord.key_size}`
          : 'No ZSK';
        nodes.push({
          id: zskId,
          type: 'record',
          parentNode: groupId,
          extent: 'parent',
          draggable: true,
          data: { label: 'ZSK', tooltip: zskTooltip },
          style: { background: '#ffdddd' },
        });
        edges.push({ id: `${kskId}-${zskId}`, source: kskId, target: zskId, label: 'signs' });
      }

      if (idx < data.levels.length - 1) {
        const dsId = `ds_${idx}_${idx + 1}`;
        const child = data.levels[idx + 1];
        const ds = child.records?.ds_records?.[0];
        const dsTooltip = ds
          ? `Key ID: ${ds.key_tag}\nAlg: ${ds.algorithm_name || ds.algorithm}\nDigest: ${ds.digest}`
          : 'No DS';
        nodes.push({
          id: dsId,
          type: 'record',
          parentNode: groupId,
          extent: 'parent',
          draggable: true,
          data: { label: 'DS', tooltip: dsTooltip },
          style: { background: '#ccccff' },
        });
        edges.push({ id: `zsk_${idx}_0-${dsId}`, source: firstZskId, target: dsId, label: 'delegates' });
        crossEdges.push({
          id: `${dsId}-ksk_${idx + 1}`,
          source: dsId,
          target: `ksk_${idx + 1}`,
          label: 'delegates',
          animated: true,
          style: { stroke: '#ff0000' },
        });
      }

      levelNodes.push(nodes);
      levelEdges.push(edges);
    });

    const nodeWidth = 100;
    const nodeHeight = 50;
    const nodeGap = 80;
    const groupGap = 160;

    const layoutedNodes = [];
    let currentY = 0;

    levelNodes.forEach((nodes, idx) => {
      const g = new dagre.graphlib.Graph();
      g.setDefaultEdgeLabel(() => ({}));
      g.setGraph({ rankdir: 'TB', nodesep: nodeGap, ranksep: nodeGap });

      nodes.forEach((node) => {
        g.setNode(node.id, { width: nodeWidth, height: nodeHeight });
      });
      levelEdges[idx].forEach((edge) => {
        g.setEdge(edge.source, edge.target);
      });

      dagre.layout(g);

      const { width: gw, height: gh } = g.graph();

      nodes.forEach((node) => {
        const { x, y } = g.node(node.id);
        layoutedNodes.push({
          ...node,
          position: { x: x - nodeWidth / 2, y: y - nodeHeight / 2 + currentY },
          sourcePosition: 'bottom',
          targetPosition: 'top',
        });
      });

      const groupNode = groupNodes[idx];
      layoutedNodes.push({
        ...groupNode,
        position: { x: -nodeWidth, y: currentY - nodeGap / 2 },
        style: { padding: 10 },
        data: groupNode.data,
        width: gw + nodeWidth * 2,
        height: gh + nodeGap,
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
      <Card className="w-full bg-card border-border">
        <CardContent className="relative px-6 py-6 lg:px-8 lg:py-8 flex justify-center overflow-auto">
          <div className="w-full overflow-hidden flex flex-col gap-4">
            {summary && (
              <div className="text-left">
                <h2 className="font-semibold text-lg text-foreground">
                  {domain}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Levels: {summary.total_levels} • Signed:{" "}
                  {summary.signed_levels + 1} • Breaks:{" "}
                  {summary.chain_breaks?.length - 1 || 0}
                </p>
                {renderTime !== null && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Loaded in {renderTime} ms
                    {dataSource ? ` from ${dataSource}` : ""}
                  </p>
                )}
              </div>
            )}
            <div
              ref={graphContainerRef}
              className="relative w-full border border-border rounded overflow-hidden mx-auto"
              style={{ maxWidth, height }}
            >
              <div className="w-full h-full">
                <ErrorBoundary>
                  {viewMode === "graphviz" ? (
                    <Graphviz
                      dot={dot}
                      options={graphvizOptions}
                      style={{ width: "100%", height: "100%" }}
                    />
                  ) : (
                    <ReactFlow
                      nodes={nodes}
                      edges={edges}
                      onNodesChange={onNodesChange}
                      onEdgesChange={onEdgesChange}
                      nodeTypes={nodeTypes}
                      fitView
                      style={{ width: "100%", height: "100%" }}
                    >
                      <Background />
                      <Controls />
                    </ReactFlow>
                  )}
                </ErrorBoundary>
              </div>
            </div>
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
      {viewMode === "graphviz" && (
        <div className="absolute -right-16 top-20 flex flex-col gap-2">
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
        </div>
      )}
      <Button
        size="icon"
        variant="secondary"
        onClick={onRefresh}
        disabled={!domain}
        className="absolute -right-16 top-4 h-12 w-12"
        type="button"
      >
        <RotateCcw className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default SampleGraph;
