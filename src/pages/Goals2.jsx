import { useState, useEffect } from "react";
import GlobeScene from "@/components/GlobeScene";

export default function Goals2() {
  const [modelUrl, setModelUrl] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (modelUrl && modelUrl.startsWith("blob:")) {
        URL.revokeObjectURL(modelUrl);
      }
      const url = URL.createObjectURL(file);
      setModelUrl(url);
    }
  };

  useEffect(() => {
    return () => {
      if (modelUrl && modelUrl.startsWith("blob:")) {
        URL.revokeObjectURL(modelUrl);
      }
    };
  }, [modelUrl]);

  return (
    <section
      className="relative min-h-screen overflow-hidden"
      style={{ backgroundColor: "#001f3f" }}
    >
      <input
        type="file"
        accept=".obj"
        onChange={handleFileChange}
        className="absolute z-10 m-4"
      />
      <GlobeScene modelUrl={modelUrl} />
    </section>
  );
}
