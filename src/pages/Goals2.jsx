import GlobeScene from "@/components/GlobeScene";
import globeModel from "@/assets/models/globe.obj?url";

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
