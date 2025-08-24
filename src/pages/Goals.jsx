import chainModel from "@/assets/models/chain.obj?url";
import lockModel from "@/assets/models/lock.obj?url";
import keyModel from "@/assets/models/key.obj?url";

// Use locally imported models so the background works offline
const modelUrls = [chainModel, lockModel, keyModel];

export default function Goals() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#f8f8f8]">
      <GoalsBackground modelUrls={modelUrls} />
      <div className="relative z-10 p-6 pt-24 text-center">
        <h2 className="text-2xl font-bold mb-4">Goals</h2>
        <p>This is a placeholder page for goals.</p>
      </div>
    </section>
  );
}
