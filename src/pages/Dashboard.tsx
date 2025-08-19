import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTimer } from "@/context/TimerContext";
import { toast } from "@/hooks/use-toast";

function formatHMS(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");
  const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0");
  const s = Math.floor(totalSeconds % 60).toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
}

const DashboardPage: React.FC = () => {
  const { isOnBreak, workSecondsToday, breakSecondsCurrent, startBreak, endBreak } = useTimer();

  return (
    <main className="p-6">
      <section className="max-w-3xl mx-auto">
        <motion.div className="text-center space-y-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="text-3xl font-semibold">Today's Focus</h1>
          <Card className="py-10">
            <CardContent className="flex flex-col items-center gap-6">
              <div className="text-6xl font-extrabold tracking-tight">
                {formatHMS(workSecondsToday)}
              </div>
              {isOnBreak ? (
                <div className="text-muted-foreground">On break — {formatHMS(breakSecondsCurrent)}</div>
              ) : (
                <div className="text-muted-foreground">Working… stay in flow ✨</div>
              )}
              <div className="flex gap-4">
                {!isOnBreak ? (
                  <Button variant="soft" onClick={() => { startBreak(); toast({ title: "Break started" }); }}>Break</Button>
                ) : (
                  <Button variant="default" onClick={() => { endBreak(); toast({ title: "Break ended" }); }}>End Break</Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>
    </main>
  );
};

export default DashboardPage;
