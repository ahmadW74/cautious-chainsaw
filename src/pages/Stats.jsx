import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  LineChart,
  Line,
} from "recharts";

export default function Stats() {
  const [stats, setStats] = useState({ total: 0, domains: {} });
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [domainHistory, setDomainHistory] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => setStats({ total: 0, domains: {} }));
  }, []);

  useEffect(() => {
    if (!selectedDomain) return;
    fetch(`http://127.0.0.1:8000/stats/history/${encodeURIComponent(selectedDomain)}`)
      .then((res) => res.json())
      .then((data) => {
        const counts = (data.events || []).reduce((acc, ts) => {
          const date = ts.slice(0, 10);
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        }, {});
        const historyData = Object.entries(counts)
          .map(([date, count]) => ({ date: new Date(date).getTime(), count }))
          .sort((a, b) => a.date - b.date);
        setDomainHistory(historyData);
      })
      .catch(() => setDomainHistory([]));
  }, [selectedDomain]);

  const domainData = Object.entries(stats.domains || {})
    .map(([domain, count]) => ({ domain, count }))
    .sort((a, b) => b.count - a.count);

  const chartConfig = {
    count: {
      label: "Views",
      color: "hsl(var(--chart-1))",
    },
  };

  return (
    <div className="max-w-3xl mx-auto p-6 pt-24 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Website Statistics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Total graphs generated: {stats.total || 0}</p>

          {domainData.length > 0 ? (
            <>
              <ChartContainer
                config={chartConfig}
                className="h-[300px] w-full"
              >
                <BarChart data={domainData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="domain"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent />}
                  />
                  <Bar
                    dataKey="count"
                    fill="var(--color-count)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>

              <ul className="space-y-1">
                {domainData.map((item, index) => (
                  <li
                    key={item.domain}
                    className="flex justify-between text-sm cursor-pointer"
                    onClick={() => setSelectedDomain(item.domain)}
                  >
                    <span>
                      {index + 1}. {item.domain}
                    </span>
                    <span>{item.count}</span>
                  </li>
                ))}
              </ul>

              {selectedDomain && domainHistory.length > 0 && (
                <div className="mt-6 space-y-2">
                  <h3 className="text-base font-semibold">
                    Views for {selectedDomain}
                  </h3>
                  <ChartContainer
                    config={chartConfig}
                    className="h-[300px] w-full"
                  >
                    <LineChart data={domainHistory}>
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="date"
                        type="number"
                        domain={["auto", "auto"]}
                        tickFormatter={(value) =>
                          new Date(value).toLocaleDateString()
                        }
                      />
                      <YAxis
                        allowDecimals={false}
                        tickLine={false}
                        axisLine={false}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="var(--color-count)"
                        dot={false}
                      />
                    </LineChart>
                  </ChartContainer>
                </div>
              )}
            </>
          ) : (
            <p>No domain data available.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
