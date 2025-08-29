import { useMemo, useState, useEffect, useRef } from "react";
import ModelViewer from "@/components/ModelViewer";
import GlobeScene from "@/components/GlobeScene";
import lowPolyEarth from "@/assets/models/uploads_files_5480147_low_poly_earth.glb?url";
import animatedClock from "@/assets/models/animated_clock.glb?url";
import lightning from "@/assets/models/lightning_bolt_icons.glb?url";
import derDenker from "@/assets/models/der_denker.glb?url";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Search, Calendar, ArrowDown } from "lucide-react";
import FillerContent from "@/components/FillerContent";
import SampleGraph from "@/SampleGraph.jsx";
import { ReactFlowProvider } from "@xyflow/react";
import SpaceScene from "@/components/SpaceScene";
import NumberTicker from "@/components/NumberTicker";

export default function Goals2() {
  const tilt = (23.5 * Math.PI) / 180;

  const [domain, setDomain] = useState("");
  const [currentDomain, setCurrentDomain] = useState("");
  const [graphGenerated, setGraphGenerated] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const searchBarRef = useRef(null);
  const thirdSectionRef = useRef(null);
  const [showStickySearch, setShowStickySearch] = useState(false);
  const dailyUsersStart = useMemo(
    () => Math.floor(Math.random() * 9000000) + 1000000,
    []
  );
  const graphsGeneratedStart = useMemo(
    () => Math.floor(Math.random() * 90000000) + 10000000,
    []
  );
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

  useEffect(() => {
    const section = thirdSectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickySearch(entry.isIntersecting),
      { threshold: 0.3 }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {showStickySearch && !graphGenerated && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-[#FFF5EE] rounded-xl shadow p-2 flex items-center">
            <Input
              placeholder="type domain here to analyze"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-80 h-12 text-lg rounded-l-full rounded-r-none shadow-inner text-black"
            />
            <Button
              size="icon"
              variant="secondary"
              onClick={handleAnalyze}
              disabled={!domain.trim()}
              className="rounded-r-full rounded-l-none border-l-0 h-12"
              type="button"
            >
              <Search className="h-6 w-6" />
            </Button>
          </div>
        </div>
      )}
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
              modelUrl={lowPolyEarth}
              onSetRotation={(setRotation) =>
                setRotation({ x: tilt, y: 0 })
              }
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
        className={`flex flex-col items-center bg-[#FFF5EE] rounded-3xl mx-[10px] mb-[calc(1.5rem+10px)] transition-all duration-500 p-10 ${
          collapsed && !graphGenerated ? "min-h-screen justify-center" : ""
        }`}
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
        {!(collapsed && !graphGenerated) && (
          <div
            ref={searchBarRef}
            className="flex justify-center mt-8 w-full max-w-md transition-all duration-500"
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
        )}
        {collapsed && !graphGenerated ? (
          <div className="relative flex justify-center mt-20 text-gray-700 w-full">
            <div className="relative w-[24rem] h-20 bg-white rounded-xl shadow p-4 flex items-center justify-center">
              <Input
                placeholder="type domain here to analyze"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="flex-grow h-12 text-lg rounded-l-full rounded-r-none shadow-inner text-black"
              />
              <Button
                size="icon"
                variant="secondary"
                onClick={handleAnalyze}
                disabled={!domain.trim()}
                className="rounded-r-full rounded-l-none border-l-0 h-12"
                type="button"
              >
                <Search className="h-6 w-6" />
              </Button>
              <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-40 flex flex-col items-center text-center">
                <div className="w-40 h-40 bg-[#FFEDE5] rounded-xl flex items-center justify-center pointer-events-none">
                  <ModelViewer modelUrl={derDenker} scale={1.2} />
                </div>
                <h3 className="mt-2 text-xl font-bold">More Modren</h3>
                <p className="text-sm">Lorem ipsum dolor sit amet.</p>
              </div>
              <p className="absolute top-full mt-4 left-1/2 -translate-x-1/2 text-3xl font-bold flex items-center gap-2">
                Still not convinced?
                <ArrowDown className="w-16 h-16" />
              </p>
              <div className="absolute top-1/2 right-full -translate-y-1/2 mr-4 w-32 flex flex-col items-center text-center">
                <div className="w-32 h-32 bg-[#FFE1D4] rounded-xl flex items-center justify-center pointer-events-none">
                  <ModelViewer modelUrl={animatedClock} scale={1.2} />
                </div>
                <h3 className="mt-2 text-lg font-bold">More History</h3>
                <p className="text-xs">Lorem ipsum dolor sit amet.</p>
              </div>
              <div className="absolute top-1/2 left-full -translate-y-1/2 ml-4 w-32 flex flex-col items-center text-center">
                <div className="w-32 h-32 bg-[#FFD5C4] rounded-xl flex items-center justify-center pointer-events-none">
                  <ModelViewer modelUrl={lightning} scale={1.2} />
                </div>
                <h3 className="mt-2 text-lg font-bold">More Speed</h3>
                <p className="text-xs">Lorem ipsum dolor sit amet.</p>
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
      <section
        ref={thirdSectionRef}
        className="relative flex flex-col items-center h-screen rounded-3xl mx-[10px] mb-[10px] overflow-hidden bg-black"
      >
        <SpaceScene />
        <h2 className="relative z-10 text-white font-bold text-4xl sm:text-5xl md:text-6xl text-center mt-10">
          See what our users have to say
        </h2>
        <div className="relative z-10 w-72 h-72 md:w-96 md:h-96 mt-10">
          <GlobeScene
            modelUrl={lowPolyEarth}
            onSetRotation={(setRotation) => setRotation({ x: tilt, y: 0 })}
            distance={0.9}
            sunLight
          />
        </div>
        <div className="relative z-10 mt-auto mb-10 flex gap-16">
          <div className="text-center">
            <p className="text-white font-bold text-2xl md:text-3xl">
              Users Daily
            </p>
            <NumberTicker
              start={dailyUsersStart}
              className="block text-white font-bold text-4xl md:text-5xl mt-2"
            />
          </div>
          <div className="text-center">
            <p className="text-white font-bold text-2xl md:text-3xl">
              Graphs generated so far
            </p>
            <NumberTicker
              start={graphsGeneratedStart}
              className="block text-white font-bold text-4xl md:text-5xl mt-2"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
