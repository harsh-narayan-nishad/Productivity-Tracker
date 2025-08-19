import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useTimer } from "@/context/TimerContext";

const tabs = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/tasks", label: "Tasks" },
  { href: "/calendar", label: "Calendar" },
  { href: "/analyzer", label: "Analyzer" },
];

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const nav = useNavigate();
  const { logout } = useAuth();
  const timer = useTimer();

  const onLogout = () => {
    timer.saveTodayAndReset();
    logout();
    nav("/");
  };

  return (
    <div className="min-h-screen relative">
      {/* Ambient gradient background */}
      <motion.div
        className="pointer-events-none absolute inset-0 -z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full blur-3xl"
          style={{ background: "linear-gradient(135deg, hsl(var(--gradient-primary-start)), hsl(var(--gradient-primary-end)))" }} />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full blur-3xl opacity-80"
          style={{ background: "linear-gradient(135deg, hsla(18,90%,88%,0.9), hsla(200,60%,92%,0.9))" }} />
      </motion.div>

      <header className="sticky top-0 z-10 bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/dashboard" className="font-extrabold tracking-tight">Lovable</Link>
          <nav className="flex items-center gap-1">
            {tabs.map((t) => (
              <Link key={t.href} to={t.href} className={`px-3 py-2 rounded-md text-sm ${location.pathname === t.href ? "bg-secondary" : "hover:bg-secondary/60"}`}>
                {t.label}
              </Link>
            ))}
          </nav>
          <div>
            <Button variant="outline" onClick={onLogout}>Logout</Button>
          </div>
        </div>
      </header>

      {children}
    </div>
  );
};

export default AppLayout;
