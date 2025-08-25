import GlobeScene from "@/components/GlobeScene";

// Update this path to point to your local globe model
const globeModel = "/models/globe.obj";

export default function Goals2() {
  return (
    <section
      className="relative min-h-screen overflow-hidden"
      style={{ backgroundColor: "#001f3f" }}
    >
      <GlobeScene modelUrl={globeModel} />
    </section>
  );
}

