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
import ReviewCarousel from "@/components/ReviewCarousel";
import NumberTicker from "@/components/NumberTicker";

export default function Goals2() {
  const tilt = (23.5 * Math.PI) / 180;

  const [domain, setDomain] = useState("");
  const [currentDomain, setCurrentDomain] = useState("");
  const [graphGenerated, setGraphGenerated] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [collapseStage, setCollapseStage] = useState(0);
  const searchBarRef = useRef(null);
  const secondSectionWrapperRef = useRef(null);
  const thirdSectionRef = useRef(null);
  const secondSectionRef = useRef(null);
  const [sectionFullyVisible, setSectionFullyVisible] = useState(false);
  const lastScrollY = useRef(0);
  const [showStickySearch, setShowStickySearch] = useState(false);
  const globeMethodsRef = useRef(null);
  const randomLat = () => Math.random() * 180 - 90;
  const randomLon = () => Math.random() * 360 - 180;
  const reviews = useMemo(
    () => [
      {
        name: "Alice",
        text: "Amazing service and easy to use. The interface is intuitive and the results are always reliable for my team's projects.",
        stars: 5,
        pfp: "https://i.pravatar.cc/100?img=1",
        lat: randomLat(),
        lon: randomLon(),
      },
      {
        name: "Bob",
        text: "Helped my workflow a lot. I can analyze domains faster than ever and share insights with my colleagues effortlessly.",
        stars: 4,
        pfp: "https://i.pravatar.cc/100?img=2",
        lat: randomLat(),
        lon: randomLon(),
      },
      {
        name: "Carol",
        text: "A must-have tool for teams. It brings clarity to complex DNS data and keeps our projects on schedule.",
        stars: 5,
        pfp: "https://i.pravatar.cc/100?img=3",
        lat: randomLat(),
        lon: randomLon(),
      },
      {
        name: "Dave",
        text: "Good features and support. Whenever we hit a snag, the documentation and community have our back.",
        stars: 4,
        pfp: "https://i.pravatar.cc/100?img=4",
        lat: randomLat(),
        lon: randomLon(),
      },
      {
        name: "Eve",
        text: "Intuitive and powerful. The visualizations make it easy to explain DNS issues to non-technical teammates.",
        stars: 5,
        pfp: "https://i.pravatar.cc/100?img=5",
        lat: randomLat(),
        lon: randomLon(),
      },
    ],
    []
  );

  const dailyUsersStart = useMemo(
    () => Math.floor(Math.random() * 9000000) + 1000000,
    []
  );
  const graphsGeneratedStart = useMemo(
    () => Math.floor(Math.random() * 90000000) + 10000000,
    []
  );

  const handleNextReview = (review) => {
    if (globeMethodsRef.current) {
      globeMethodsRef.current.highlightLocation(review.lat, review.lon);
    }
  };
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
    const section = secondSectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      ([entry]) => setSectionFullyVisible(entry.intersectionRatio === 1),
      { threshold: 1 }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (graphGenerated) {
      setCollapseStage(0);
      return;
    }
    const onScroll = () => {
      const currentY = window.scrollY;
      const direction = currentY > lastScrollY.current ? "down" : "up";
      lastScrollY.current = currentY;

      if (direction === "down" && sectionFullyVisible && collapseStage === 0) {
        setCollapseStage(1);
      } else if (direction === "up" && collapseStage > 0) {
        setCollapseStage((prev) => Math.max(prev - 1, 0));
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [sectionFullyVisible, graphGenerated, collapseStage]);

  useEffect(() => {
    if (collapseStage === 1) {
      const t = setTimeout(() => setCollapseStage(2), 500);
      return () => clearTimeout(t);
    }
    if (collapseStage === 2) {
      const t = setTimeout(() => setCollapseStage(3), 500);
      return () => clearTimeout(t);
    }
  }, [collapseStage]);

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
        <div className="fixed top-8 left-8 z-50">
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
      <div
        ref={secondSectionWrapperRef}
        className="h-[200vh] mx-[10px] mb-[calc(1.5rem+10px)]"
      >
        <section
          ref={secondSectionRef}
          className="sticky top-0 flex flex-col items-center bg-[#FFF5EE] rounded-3xl p-10 h-screen"
        >
          <div
            className="relative w-full h-full overflow-hidden"
            style={{
              clipPath:
                collapseStage >= 2 ? "inset(50% 0 50% 0)" : "inset(0 0 0 0)",
              transition: "clip-path 0.5s",
            }}
          >
            <h2
              className="text-black font-bold text-4xl sm:text-5xl md:text-6xl text-center"
              style={{
                transform:
                  collapseStage >= 2 ? "translateY(-100px)" : "translateY(0)",
                transition: "transform 0.5s",
                willChange: "transform",
              }}
            >
              Limitless DNSSEC with
              <span className="bg-gradient-to-r from-pink-500 via-yellow-400 to-purple-500 bg-clip-text !text-transparent animate-gradient mx-2 inline-block">
                1
              </span>
              click
            </h2>
            <div
              ref={searchBarRef}
              className={`flex items-center mt-8 w-full max-w-md ${
                collapseStage >= 1 ? "justify-start" : "justify-center mx-auto"
              }`}
              style={{
                transform:
                  collapseStage >= 1 ? "translateY(-120px)" : "translateY(0)",
                transition: "transform 0.5s",
                willChange: "transform",
              }}
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
            <div
              className="relative w-full mt-10"
              style={{
                transform:
                  collapseStage >= 2 ? "translateY(-60px)" : "translateY(0)",
                transition: "transform 0.5s",
                willChange: "transform",
              }}
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
          </div>
          {!graphGenerated && (
            <div
              className="relative flex justify-center text-gray-700 w-full"
              style={{
                alignItems: collapseStage >= 3 ? "flex-start" : "center",
                marginTop: collapseStage >= 3 ? "0" : "5rem",
                transform:
                  collapseStage >= 3
                    ? "translateY(-80px)"
                    : "translateY(200px)",
                opacity: collapseStage >= 3 ? 1 : 0,
                transition: "transform 0.5s, opacity 0.5s, margin-top 0.5s",
                willChange: "transform, opacity, margin-top",
              }}
            >
              <div className="relative w-[24rem] h-20 bg-white rounded-xl shadow p-4 flex items-center justify-center mx-auto">
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
                <div
                  className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-40 flex flex-col items-center text-center"
                  style={{
                    transform:
                      collapseStage >= 3
                        ? "translateY(0)"
                        : "translateY(-20px)",
                    opacity: collapseStage >= 3 ? 1 : 0,
                    transition: "transform 0.5s, opacity 0.5s",
                    willChange: "transform, opacity",
                  }}
                >
                  <div className="w-40 h-40 bg-[#FFEDE5] rounded-xl flex items-center justify-center pointer-events-none">
                    <ModelViewer modelUrl={derDenker} scale={1.2} />
                  </div>
                  <h3 className="mt-2 text-xl font-bold">More Modren</h3>
                  <p className="text-sm">Lorem ipsum dolor sit amet.</p>
                </div>
                <p
                  className="absolute top-full mt-4 left-1/2 -translate-x-1/2 text-3xl font-bold flex items-center gap-2"
                  style={{
                    transform:
                      collapseStage >= 3 ? "translateY(0)" : "translateY(20px)",
                    opacity: collapseStage >= 3 ? 1 : 0,
                    transition: "transform 0.5s, opacity 0.5s",
                    willChange: "transform, opacity",
                  }}
                >
                  Still not convinced?
                  <ArrowDown className="w-16 h-16" />
                </p>
                <div
                  className="absolute top-1/2 right-full -translate-y-1/2 mr-4 w-32 flex flex-col items-center text-center"
                  style={{
                    transform:
                      collapseStage >= 3 ? "translateX(0)" : "translateX(20px)",
                    opacity: collapseStage >= 3 ? 1 : 0,
                    transition: "transform 0.5s, opacity 0.5s",
                    willChange: "transform, opacity",
                  }}
                >
                  <div className="w-32 h-32 bg-[#FFE1D4] rounded-xl flex items-center justify-center pointer-events-none">
                    <ModelViewer modelUrl={animatedClock} scale={1.2} />
                  </div>
                  <h3 className="mt-2 text-lg font-bold">More History</h3>
                  <p className="text-xs">Lorem ipsum dolor sit amet.</p>
                </div>
                <div
                  className="absolute top-1/2 left-full -translate-y-1/2 ml-4 w-32 flex flex-col items-center text-center"
                  style={{
                    transform:
                      collapseStage >= 3
                        ? "translateX(0)"
                        : "translateX(-20px)",
                    opacity: collapseStage >= 3 ? 1 : 0,
                    transition: "transform 0.5s, opacity 0.5s",
                    willChange: "transform, opacity",
                  }}
                >
                  <div className="w-32 h-32 bg-[#FFD5C4] rounded-xl flex items-center justify-center pointer-events-none">
                    <ModelViewer modelUrl={lightning} scale={1.2} />
                  </div>
                  <h3 className="mt-2 text-lg font-bold">More Speed</h3>
                  <p className="text-xs">Lorem ipsum dolor sit amet.</p>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
      <section
        ref={thirdSectionRef}
        className="relative flex items-center h-screen rounded-3xl mx-[10px] mb-[10px] overflow-hidden bg-black"
      >
        <SpaceScene />
        <h2 className="absolute top-20 right-10 z-10 text-right text-white font-bold text-5xl sm:text-6xl md:text-7xl">
          See what our users have to say
        </h2>
        <div className="relative z-10 flex items-center w-full h-full">
          <div className="absolute left-10 top-1/2 -translate-y-1/2 w-[40vw] h-[40vw] pointer-events-none">
            <GlobeScene
              modelUrl={lowPolyEarth}
              distance={1.2}
              sunLight={false}
              showDots={false}
              autoRotate={false}
              onGlobeReady={(methods) => {
                globeMethodsRef.current = methods;
                methods.setRotation({ x: tilt, y: 0 });
                methods.highlightLocation(reviews[0].lat, reviews[0].lon);
              }}
            />
          </div>
          <div className="ml-[45vw] mr-4">
            <ReviewCarousel reviews={reviews} onNext={handleNextReview} />
          </div>
        </div>
        <div className="absolute bottom-10 right-10 z-10 flex gap-16">
          <div className="text-right">
            <p className="text-white font-bold text-2xl md:text-3xl">
              Users Daily
            </p>
            <NumberTicker
              start={dailyUsersStart}
              className="block text-white font-bold text-4xl md:text-5xl mt-2"
            />
          </div>
          <div className="text-right">
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
