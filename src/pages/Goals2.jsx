import { useMemo, useState } from "react";
import GlobeScene from "@/components/GlobeScene";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Search, Calendar } from "lucide-react";
import FillerContent from "@/components/FillerContent";
import SampleGraph from "@/SampleGraph.jsx";
import { ReactFlowProvider } from "@xyflow/react";

export default function Goals2() {
  const tilt = (23.5 * Math.PI) / 180;

  const [domain, setDomain] = useState("");
  const [currentDomain, setCurrentDomain] = useState("");
  const [graphGenerated, setGraphGenerated] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const dateOptions = useMemo(() => {
    const dates = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(1);
      d.setMonth(now.getMonth() - i);
      dates.push(d);
    }
    return dates;
  }, []);
  const [timelineIndex, setTimelineIndex] = useState(dateOptions.length - 1);
  const selectedDate = dateOptions[timelineIndex] || new Date();
  const tooltipLabel =
    timelineIndex === dateOptions.length - 1
      ? "Today"
      : selectedDate.toLocaleDateString(undefined, {
          month: "long",
          year: "numeric",
        });

  const handleAnalyze = () => {
    const cleaned = domain.trim().toLowerCase();
    if (!cleaned) return;
    setCurrentDomain(cleaned);
    setGraphGenerated(true);
  };

  const handleRefresh = () => {
    if (!currentDomain) return;
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
        <section
          className="relative flex flex-col items-center justify-center h-[calc(100vh-1.5rem-20px)] rounded-3xl overflow-hidden pt-6 pl-6 pr-8 mt-[10px] mx-[10px] mb-[calc(1.5rem+10px)]"
          style={{ backgroundColor: "#8F00FF" }}
        >
        <div className="flex items-center justify-center gap-8">
          <span className="text-white font-bold text-7xl sm:text-7xl md:text-8xl">
            The Better
          </span>
          <div className="w-72 h-72 md:w-96 md:h-96">
            <GlobeScene
              onSetRotation={(setRotation) => setRotation({ x: tilt, y: 0 })}
            />
          </div>
          <span className="text-white font-bold text-7xl sm:text-7xl md:text-8xl">
            Dnsviz.
          </span>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full flex flex-col items-center px-4">
          <div className="flex justify-center mb-6 w-full max-w-md">
            <Input
              placeholder="type domain here to analyze"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-80 h-12 lg:h-14 text-lg rounded-l-full rounded-r-none shadow-inner text-black"
            />
            <Button
              size="icon"
              variant="secondary"
              onClick={handleAnalyze}
              disabled={!domain.trim()}
              className="rounded-r-full rounded-l-none border-l-0 h-12 lg:h-14"
              type="button"
            >
              <Search className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </section>
      <div className="relative">
        <div
          className={`transition-all duration-500 ${
            graphGenerated ? "opacity-0 max-h-0 overflow-hidden" : "opacity-100"
          }`}
        >
          <FillerContent />
        </div>
        <div
          className={`transition-all duration-500 transform ${
            graphGenerated
              ? "opacity-100 scale-100"
              : "opacity-0 scale-95 max-h-0 overflow-hidden"
          }`}
        >
          {graphGenerated && (
            <div className="p-6 lg:p-10 flex justify-center">
              <div className="w-full max-w-[100rem]">
                <div className="flex items-center justify-end gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-gray-700" />
                  <Slider
                    min={0}
                    max={dateOptions.length - 1}
                    step={1}
                    value={[timelineIndex]}
                    onValueChange={(v) => setTimelineIndex(v[0])}
                    className="w-48"
                  />
                  <span className="text-sm text-gray-700">{tooltipLabel}</span>
                </div>
                <ReactFlowProvider>
                  <SampleGraph
                    domain={currentDomain}
                    refreshTrigger={refreshTrigger}
                    onRefresh={handleRefresh}
                    userId={null}
                    selectedDate={selectedDate.toISOString().slice(0, 7)}
                    viewMode="graphviz"
                  />
                </ReactFlowProvider>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

