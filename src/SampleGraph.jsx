import React, { useCallback, useEffect, useMemo, useState } from "react";
import Graphviz from "graphviz-react";
import ErrorBoundary from "@/components/ErrorBoundary.jsx";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { API_BASE } from "@/lib/api";

/**
 * Renders a DNSSEC chain as a Graphviz diagram.
 *
 * @param {object} props
 * @param {string} props.domain - Domain to visualize
 * @param {number} [props.refreshTrigger] - Incrementing value to trigger reload
 * @param {Function} [props.onRefresh] - Callback when the reload button is clicked
 * @param {string} [props.userId] - ID of the logged in user
 * @param {string} [props.selectedDate] - Date selected from the timeline slider
 */
const SampleGraph = ({
  domain,
  refreshTrigger,
  onRefresh,
  userId,
  selectedDate,
}) => {
  const [dot, setDot] = useState("digraph DNSSEC {}");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const graphvizOptions = useMemo(() => ({ engine: "dot" }), []);
  const GRAPH_SCALE = 2;
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
      const ksk =
        level.records?.dnskey_records?.find((k) => k.is_ksk) ||
        level.key_hierarchy?.ksk_keys?.[0] ||
        (Array.isArray(level.records?.dnskey_records)
          ? level.records.dnskey_records.find((k) => k.role === "KSK")
          : null);
      const zsk =
        level.records?.dnskey_records?.find((k) => k.is_zsk) ||
        level.key_hierarchy?.zsk_keys?.[0] ||
        (Array.isArray(level.records?.dnskey_records)
          ? level.records.dnskey_records.find((k) => k.role === "ZSK")
          : null);
      const kskTooltip = ksk
        ? `Key ID: ${ksk.key_tag}\nAlg: ${
            ksk.algorithm_name || ksk.algorithm
          }\nSize: ${ksk.key_size}`
        : "No KSK";
      const zskTooltip = zsk
        ? `Key ID: ${zsk.key_tag}\nAlg: ${
            zsk.algorithm_name || zsk.algorithm
          }\nSize: ${zsk.key_size}`
        : "No ZSK";
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
      dotStr += `    zsk_${idx} [label="ZSK" fillcolor="#ffdddd" tooltip="${escape(
        zskTooltip
      )}"];\n`;

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

      dotStr += `    ksk_${idx} -> zsk_${idx} [label="signs"];\n`;
      if (idx < data.levels.length - 1) {
        dotStr += `    zsk_${idx} -> ds_${idx}_${
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
        } [ltail=cluster_${i}, lhead=cluster_${i + 1}];\n`;
      } else {
        dotStr += `  zsk_${i} -> ksk_${
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

  const fetchData = useCallback(async () => {
    if (!domain) {
      setDot("digraph DNSSEC {}");
      setSummary(null);
      return;
    }

    try {
      setLoading(true);
      let url = `http://127.0.0.1:8000/chain/${encodeURIComponent(domain)}`;
      const params = [];
      if (userId) params.push(`user_id=${encodeURIComponent(userId)}`);
      if (selectedDate) params.push(`date=${encodeURIComponent(selectedDate)}`);
      if (params.length) {
        url += `?${params.join("&")}`;
      }
      const res = await fetch(url);
      const json = await res.json();
      setDot(buildDot(json));
      setSummary(json.chain_summary || null);
    } catch (err) {
      console.error("Failed to fetch DNSSEC chain", err);
      setDot("digraph DNSSEC {}");
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [domain, buildDot, userId, selectedDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshTrigger]);

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
              </div>
            )}
            <div className="relative w-full h-96 md:h-[60vh] border border-border rounded flex items-center justify-center">
              <TransformWrapper
                initialScale={GRAPH_SCALE}
                wheel={{ step: 0.1 }}
                doubleClick={{ disabled: true }}
              >
                {({ zoomIn, zoomOut }) => (
                  <>
                    <div className="absolute top-2 right-2 z-10 flex flex-col gap-2">
                      <Button size="icon" variant="secondary" onClick={zoomIn}>
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="secondary" onClick={zoomOut}>
                        <ZoomOut className="h-4 w-4" />
                      </Button>
                    </div>
                    <TransformComponent wrapperClass="w-full h-full flex items-center justify-center">
                      <ErrorBoundary>
                        <Graphviz dot={dot} options={graphvizOptions} />
                      </ErrorBoundary>
                    </TransformComponent>
                  </>
                )}
              </TransformWrapper>
            </div>
          </div>
        </CardContent>
      </Card>
      <Button
        size="icon"
        variant="secondary"
        onClick={onRefresh}
        disabled={!domain}
        className="absolute -right-16 top-4 h-12 w-12"
      >
        <RotateCcw className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default SampleGraph;
