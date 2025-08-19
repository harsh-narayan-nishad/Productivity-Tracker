import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTimer } from "@/context/TimerContext";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const LoginPage: React.FC = () => {
  const nav = useNavigate();
  const { user, login } = useAuth();
  const timer = useTimer();

  const [email, setEmail] = useState("harsh@gmail.com");
  const [password, setPassword] = useState("123");

  useEffect(() => {
    if (user) {
      nav("/dashboard", { replace: true });
    }
  }, [user, nav]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await login(email, password);
    if (ok) {
      timer.startWorkOnLogin();
      toast({ title: "Welcome back!", description: "Work timer started automatically." });
      nav("/dashboard");
    } else {
      toast({ title: "Login failed", description: "Invalid credentials" });
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Ambient gradient blobs */}
      <motion.div
        className="absolute -top-24 -left-24 h-72 w-72 rounded-full blur-3xl"
        style={{ background: "linear-gradient(135deg, hsl(var(--gradient-primary-start)), hsl(var(--gradient-primary-end)))" }}
        animate={{ x: [0, 20, -10, 0], y: [0, -10, 10, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-0 h-96 w-96 rounded-full blur-3xl opacity-70"
        style={{ background: "linear-gradient(135deg, hsla(18,90%,88%,0.9), hsla(200,60%,92%,0.9))" }}
        animate={{ x: [0, -30, 10, 0], y: [0, 20, -10, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      />

      <main className="min-h-screen flex items-center justify-center p-6">
        <Card className="w-full max-w-md animate-enter">
          <CardHeader>
            <CardTitle className="text-2xl">Lovable Time Tracker</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <Button type="submit" className="w-full" variant="hero">
                Sign in & Start Work
              </Button>
              <p className="text-center text-sm text-muted-foreground">Use email: harsh@gmail.com, password: 123</p>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default LoginPage;
