import GlobeScene from "@/components/GlobeScene";

export default function Goals2() {
  const tilt = (23.5 * Math.PI) / 180;
  return (
    <section
      className="relative flex items-center justify-center w-screen h-screen gap-8"
      style={{ backgroundColor: "#8F00FF" }}
    >
      <span className="text-white font-bold text-5xl sm:text-6xl md:text-7xl">
        The Better
      </span>
      <div className="w-72 h-72 md:w-96 md:h-96">
        <GlobeScene
          onSetRotation={(setRotation) =>
            setRotation({ x: tilt, y: 0 })
          }
        />
      </div>
      <span className="text-white font-bold text-5xl sm:text-6xl md:text-7xl">
        Dnsviz.
      </span>
    </section>
  );
}

