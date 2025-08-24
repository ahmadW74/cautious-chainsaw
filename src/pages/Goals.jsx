import GoalsBackground from "@/components/GoalsBackground.jsx";

export default function Goals() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#f8f8f8]">
      <GoalsBackground />
      <div className="relative z-10 p-6 pt-24 text-center">
        <h2 className="text-2xl font-bold mb-4">Goals</h2>
        <p>This is a placeholder page for goals.</p>
      </div>
    </section>
  );
}

