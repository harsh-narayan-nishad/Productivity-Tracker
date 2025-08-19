import React, { useMemo, useState } from "react";
import { addDays, endOfMonth, format, startOfMonth, startOfWeek } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getDayLogs } from "@/lib/storage";

const CalendarPage: React.FC = () => {
  const [current, setCurrent] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(current), { weekStartsOn: 1 });
    const end = addDays(endOfMonth(current), 6);
    const res: Date[] = [];
    let d = start;
    while (d <= end) {
      res.push(d);
      d = addDays(d, 1);
    }
    return res;
  }, [current]);

  const logs = getDayLogs();

  const openDetail = (key: string) => {
    setSelectedKey(key);
    setOpen(true);
  };

  const gridCols = "grid grid-cols-7 gap-2";

  return (
    <main className="p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-3xl font-semibold">Calendar</h1>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <button onClick={() => setCurrent(addDays(current, -30))} className="story-link">Prev</button>
              <span>{format(current, "MMMM yyyy")}</span>
              <button onClick={() => setCurrent(addDays(current, 30))} className="story-link">Next</button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={gridCols}>
              {days.map((d) => {
                const key = d.toISOString().slice(0, 10);
                const total = logs[key]?.workSeconds || 0;
                return (
                  <button key={key} onClick={() => openDetail(key)} className={`rounded-lg p-3 text-left border hover:bg-secondary/60 ${d.getMonth() === current.getMonth() ? "" : "opacity-50"}`}>
                    <div className="text-xs text-muted-foreground">{format(d, "EEE d")}</div>
                    <div className="mt-2 text-sm font-medium">{(total / 3600).toFixed(2)}h</div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Day Details</DialogTitle>
          </DialogHeader>
          {selectedKey && (
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Date: {selectedKey}</div>
              <div className="text-sm">Total: {((logs[selectedKey]?.workSeconds || 0) / 3600).toFixed(2)} hours</div>
              <div className="mt-2">
                <div className="font-medium">Sessions</div>
                <ul className="list-disc pl-4 text-sm">
                  {logs[selectedKey]?.sessions.map((s) => (
                    <li key={s.id}>Start: {new Date(s.start).toLocaleTimeString()} — End: {s.end ? new Date(s.end).toLocaleTimeString() : "ongoing"} ({s.breaks.length} breaks)</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default CalendarPage;
