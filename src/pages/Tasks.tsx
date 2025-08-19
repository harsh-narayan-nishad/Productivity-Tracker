import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { addCompleted, getTasks, saveTasks, Task, WeekPlan, saveWeekPlan, getWeekPlan, weekKey } from "@/lib/storage";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function distribute(tasks: Task[], dailyTarget: number): Record<number, string[]> {
  const assignments: Record<number, string[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
  // Greedy: spread across days with least load
  tasks.forEach((t) => {
    const picks: number[] = [];
    for (let i = 0; i < t.frequencyPerWeek; i++) {
      let bestDay = 0;
      let bestLen = Number.MAX_VALUE;
      for (let d = 0; d < 7; d++) {
        const len = assignments[d].length;
        if (len < bestLen && assignments[d].length < dailyTarget) {
          bestLen = len;
          bestDay = d;
        }
      }
      assignments[bestDay].push(t.id);
    }
  });
  return assignments;
}

const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(getTasks());
  const [name, setName] = useState("");
  const [topic, setTopic] = useState("");
  const [est, setEst] = useState(30);
  const [freq, setFreq] = useState(2);
  const [dailyTarget, setDailyTarget] = useState(3);
  const wKey = weekKey();
  const existingPlan = getWeekPlan(wKey);
  const initialAssignments = useMemo(() => existingPlan?.assignments || distribute(tasks, dailyTarget), []);
  const [assignments, setAssignments] = useState<Record<number, string[]>>(initialAssignments);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  const addTask = () => {
    if (!name || !topic) return;
    const t: Task = { id: crypto.randomUUID(), name, topic, estMinutes: est, frequencyPerWeek: freq };
    const next = [...tasks, t];
    setTasks(next);
    setName("");
    setTopic("");
  };

  const autoDistribute = () => {
    const a = distribute(tasks, dailyTarget);
    setAssignments(a);
    const plan: WeekPlan = { weekOf: wKey, dailyTarget, assignments: a };
    saveWeekPlan(plan);
  };

  // DnD minimal
  const onDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("text/plain", taskId);
  };
  const onDrop = (e: React.DragEvent, dayIdx: number) => {
    const taskId = e.dataTransfer.getData("text/plain");
    if (!taskId) return;
    setAssignments((prev) => {
      const next: Record<number, string[]> = { ...prev } as any;
      for (let d = 0; d < 7; d++) next[d] = next[d].filter((id) => id !== taskId);
      next[dayIdx] = [...next[dayIdx], taskId];
      return next;
    });
  };
  const onDragOver = (e: React.DragEvent) => e.preventDefault();

  const markDone = (taskId: string) => {
    addCompleted(taskId, new Date().toISOString().slice(0, 10));
  };

  return (
    <main className="p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-semibold">Tasks</h1>

        <Card>
          <CardHeader>
            <CardTitle>Add Task</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-5">
            <div>
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Deep work" />
            </div>
            <div>
              <Label>Topic</Label>
              <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Project X" />
            </div>
            <div>
              <Label>Est. minutes</Label>
              <Input type="number" value={est} onChange={(e) => setEst(parseInt(e.target.value || "0"))} />
            </div>
            <div>
              <Label>Frequency / week</Label>
              <Input type="number" value={freq} onChange={(e) => setFreq(parseInt(e.target.value || "0"))} />
            </div>
            <div className="flex items-end">
              <Button onClick={addTask} variant="hero">Add</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Weekly Planner</span>
              <span className="text-sm text-muted-foreground">Daily target: {dailyTarget}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Label>Daily task count</Label>
              <Slider min={1} max={10} step={1} value={[dailyTarget]} onValueChange={(v) => setDailyTarget(v[0])} />
              <div className="mt-2">
                <Button variant="outline" onClick={autoDistribute}>Auto-distribute</Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
              {days.map((d, i) => (
                <div key={d} className="rounded-lg border p-3 min-h-48" onDrop={(e) => onDrop(e, i)} onDragOver={onDragOver}>
                  <div className="font-medium mb-2">{d}</div>
                  <div className="space-y-2">
                    {assignments[i]?.map((id) => {
                      const t = tasks.find((t) => t.id === id);
                      if (!t) return null;
                      return (
                        <div key={id} draggable onDragStart={(e) => onDragStart(e, id)} className="rounded-md bg-secondary px-3 py-2 text-sm flex items-center justify-between">
                          <div>
                            <div className="font-medium">{t.name}</div>
                            <div className="text-xs text-muted-foreground">{t.topic} • {t.estMinutes}m</div>
                          </div>
                          <Button size="sm" onClick={() => markDone(id)}>Done</Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </main>
  );
};

export default TasksPage;
