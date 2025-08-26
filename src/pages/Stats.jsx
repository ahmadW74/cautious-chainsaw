import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function Stats() {
  const [stats, setStats] = useState({ total: 0, domains: {} });

  useEffect(() => {
    fetch("http://127.0.0.1:8000/stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => setStats({ total: 0, domains: {} }));
  }, []);

  const popularDomain = Object.entries(stats.domains || {})
    .sort((a, b) => b[1] - a[1])[0]?.[0];

  return (
    <div className="max-w-3xl mx-auto p-6 pt-24">
      <Card>
        <CardHeader>
          <CardTitle>Website Statistics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Total graphs generated: {stats.total || 0}</p>
          <p>Most popular domain: {popularDomain || "N/A"}</p>
        </CardContent>
      </Card>
    </div>
  );
}
