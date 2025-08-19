import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCompleted, getDayLogs, getTasks } from "@/lib/storage";
import { addDays } from "date-fns";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis, Pie, PieChart, Cell } from "recharts";
const COLORS = ["#8b5cf6", "#06b6d4", "#f59e0b", "#ec4899", "#10b981", "#f97316"];

const Analyzer: React.FC = () => {
  const logs = getDayLogs();
  const today = new Date();
  const last7 = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => addDays(today, -6 + i));
    return days.map((d) => {
      const key = d.toISOString().slice(0, 10);
      const sec = logs[key]?.workSeconds || 0;
      return { day: d.toLocaleDateString(undefined, { weekday: "short" }), hours: +(sec / 3600).toFixed(2) };
    });
  }, [logs, today]);

  const completed = getCompleted();
  const tasks = getTasks();
  const byTopic = useMemo(() => {
    const map: Record<string, number> = {};
    completed.forEach((c) => {
      const t = tasks.find((t) => t.id === c.taskId);
      if (!t) return;
      map[t.topic] = (map[t.topic] || 0) + (t.estMinutes / 60);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value: +value.toFixed(2) }));
  }, [completed, tasks]);

  return (
    <main className="p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-3xl font-semibold">Analyzer</h1>
        <Card>
          <CardHeader>
            <CardTitle>Weekly Hours</CardTitle>
          </CardHeader>
          <CardContent style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last7}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="hours" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>By Topic (completed)</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byTopic} dataKey="value" nameKey="name" outerRadius={100} label>
                  {byTopic.map((_, i) => (
                    <Cell key={`c-${i}`} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default Analyzer;
