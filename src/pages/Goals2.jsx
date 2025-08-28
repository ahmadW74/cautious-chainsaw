import GlobeScene from "@/components/GlobeScene";

export default function Goals2() {
  const tilt = (23.5 * Math.PI) / 180;
  return (
    <section
      className="relative w-screen h-screen"
      style={{ backgroundColor: "lavender" }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <GlobeScene
          onSetRotation={(setRotation) =>
            setRotation({ x: tilt, y: 0 })
          }
        />
      </div>
    </section>
  );
}

