import { useMemo, useState, useEffect, useRef } from "react";
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
  const [collapsed, setCollapsed] = useState(false);
  const searchBarRef = useRef(null);
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

  useEffect(() => {
    if (graphGenerated) {
      setCollapsed(false);
      return;
    }
    const handleScroll = () => {
      setCollapsed(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [graphGenerated]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <section
        className="relative flex flex-col items-center justify-center h-[calc(100vh-1.5rem-20px)] rounded-3xl overflow-hidden pt-6 pl-6 pr-8 mt-[10px] mx-[10px] mb-[calc(1.5rem+10px)]"
        style={{ backgroundColor: "#8F00FF" }}
      >
        <div className="flex items-center justify-center gap-8">
          <span
            className="text-white font-bold text-7xl sm:text-7xl md:text-8xl"
            style={{ color: "white" }}
          >
            The Better
          </span>
          <div className="w-72 h-72 md:w-96 md:h-96">
            <GlobeScene
              onSetRotation={(setRotation) => setRotation({ x: tilt, y: 0 })}
            />
          </div>
          <span
            className="text-white font-bold text-7xl sm:text-7xl md:text-8xl"
            style={{ color: "white" }}
          >
            Dnsviz.
          </span>
        </div>
      </section>
      <section
        className={`flex flex-col items-center bg-[#FFF5EE] rounded-3xl mx-[10px] mb-[calc(1.5rem+10px)] transition-all duration-500 p-10`}
      >
        <h2
          className={`text-black font-bold text-4xl sm:text-5xl md:text-6xl text-center transition-all duration-500 ${
            collapsed && !graphGenerated
              ? "opacity-0 max-h-0 overflow-hidden"
              : ""
          }`}
        >
          Limitless DNSSEC with
          <span className="bg-gradient-to-r from-pink-500 via-yellow-400 to-purple-500 bg-clip-text !text-transparent animate-gradient mx-2 inline-block">
            1
          </span>
          click
        </h2>
        <div
          ref={searchBarRef}
          className={`flex justify-center mt-8 w-full max-w-md transition-all duration-500 ${
            collapsed && !graphGenerated
              ? "fixed left-1/2 -translate-x-1/2 z-50 bg-[#FFF5EE] p-2 rounded-full shadow"
              : ""
          }`}
          style={
            collapsed && !graphGenerated ? { top: "20px" } : undefined
          }
        >
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
        {collapsed && !graphGenerated ? (
          <div className="grid grid-cols-3 grid-rows-3 gap-4 w-full max-w-4xl mt-20 text-gray-700">
            <div className="col-span-3 flex justify-center">
              <p>Dummy top text</p>
            </div>
            <div className="row-span-2 flex items-center justify-end">
              <p className="text-right">Dummy left text</p>
            </div>
            <div className="col-start-3 row-span-2 flex items-center justify-start">
              <p>Dummy right text</p>
            </div>
            <div className="col-span-3 row-start-3 flex justify-center">
              <p>Dummy bottom text</p>
            </div>
            <div className="col-start-2 row-start-2 flex justify-center items-center">
              <div className="w-64 h-40 bg-white rounded-xl shadow flex items-center justify-center text-sm text-gray-500">
                Minimized Content
              </div>
            </div>
          </div>
        ) : (
          <div
            className={`relative w-full mt-10 transition-all duration-500 ${
              collapsed && !graphGenerated ? "opacity-0 max-h-0 overflow-hidden" : ""
            }`}
          >
            <div
              className={`transition-all duration-500 ${
                graphGenerated
                  ? "opacity-0 max-h-0 overflow-hidden"
                  : "opacity-100"
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
                  <div className="w-full max-w-8xl">
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
                      <span className="text-sm text-gray-700">
                        {tooltipLabel}
                      </span>
                    </div>
                    <ReactFlowProvider>
                      <SampleGraph
                        domain={currentDomain}
                        refreshTrigger={refreshTrigger}
                        onRefresh={handleRefresh}
                        userId={null}
                        selectedDate={selectedDate.toISOString().slice(0, 7)}
                        viewMode="reactflow"
                      />
                    </ReactFlowProvider>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
