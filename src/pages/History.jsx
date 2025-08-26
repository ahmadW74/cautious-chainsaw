import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ReactFlowProvider } from "@xyflow/react";
import SampleGraph from "@/SampleGraph.jsx";

export default function History({ userId, viewMode }) {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    if (!userId) return;
    try {
      const key = `graph_history_${userId}`;
      const stored = localStorage.getItem(key);
      setEntries(stored ? JSON.parse(stored) : []);
    } catch {
      setEntries([]);
    }
  }, [userId]);

  if (!userId) {
    return (
      <div className="max-w-3xl mx-auto p-6 pt-24">
        <Card>
          <CardHeader>
            <CardTitle>Graph History</CardTitle>
          </CardHeader>
          <CardContent>Please log in to view your history.</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 pt-24 space-y-6">
      {entries.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Graph History</CardTitle>
          </CardHeader>
          <CardContent>No history yet.</CardContent>
        </Card>
      ) : (
        entries.map((item, idx) => (
          <Card key={idx} className="p-4">
            <CardHeader>
              <CardTitle>
                {item.domain} ({item.date})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full overflow-x-auto">
                <div style={{ height: 400 }} className="mx-auto">
                  <ReactFlowProvider>
                    <SampleGraph
                      domain={item.domain}
                      userId={userId}
                      selectedDate={item.date}
                      viewMode={viewMode}
                    />
                  </ReactFlowProvider>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
