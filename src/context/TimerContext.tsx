import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { WorkSession, SessionBreak, dateKey, addSessionToDay } from "@/lib/storage";

// Runtime state in localStorage per-day
const STORAGE_KEY = "current_day_state";

export type CurrentDayState = {
  date: string;
  accumulatedWorkSeconds: number; // up to last pause/break/start
  currentSession?: WorkSession;
  isOnBreak: boolean;
  currentStart?: number; // ms
  currentBreakStart?: number; // ms
};

function readState(): CurrentDayState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as CurrentDayState;
  } catch {}
  const today = dateKey();
  return { date: today, accumulatedWorkSeconds: 0, isOnBreak: false };
}

function writeState(state: CurrentDayState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function ensureToday(state: CurrentDayState): CurrentDayState {
  const today = dateKey();
  if (state.date !== today) {
    // New day resets counters
    return { date: today, accumulatedWorkSeconds: 0, isOnBreak: false };
  }
  return state;
}

function now() {
  return Date.now();
}

function diffSeconds(a: number, b: number) {
  return Math.max(0, Math.floor((b - a) / 1000));
}

export type TimerContextType = {
  isOnBreak: boolean;
  workSecondsToday: number;
  breakSecondsCurrent: number;
  startWorkOnLogin: () => void;
  startBreak: () => void;
  endBreak: () => void;
  saveTodayAndReset: () => void;
};

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<CurrentDayState>(() => ensureToday(readState()));
  const [workSeconds, setWorkSeconds] = useState(0);
  const [breakSeconds, setBreakSeconds] = useState(0);
  const rafRef = useRef<number | null>(null);

  const tick = useCallback(() => {
    const s = ensureToday(readState());
    let computed = s.accumulatedWorkSeconds;
    if (s.currentStart && !s.isOnBreak) {
      computed += diffSeconds(s.currentStart, now());
    }
    setWorkSeconds(computed);

    if (s.isOnBreak && s.currentBreakStart) {
      setBreakSeconds(diffSeconds(s.currentBreakStart, now()));
    } else {
      setBreakSeconds(0);
    }

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [tick]);

  const persist = useCallback((updater: (s: CurrentDayState) => CurrentDayState) => {
    setState((prev) => {
      const updated = ensureToday(updater(ensureToday(prev)));
      writeState(updated);
      return updated;
    });
  }, []);

  const startWorkOnLogin = useCallback(() => {
    persist((s) => {
      const date = dateKey();
      // Start a new session if none active
      if (!s.currentSession) {
        const session: WorkSession = { id: crypto.randomUUID(), start: now(), breaks: [] };
        return { ...s, date, currentSession: session, currentStart: now(), isOnBreak: false };
      }
      // Resume work if session exists but was idle
      return { ...s, currentStart: s.currentStart ?? now(), isOnBreak: false };
    });
  }, [persist]);

  const startBreak = useCallback(() => {
    persist((s) => {
      if (s.isOnBreak || !s.currentSession) return s;
      const add = s.currentStart ? diffSeconds(s.currentStart, now()) : 0;
      const updated: CurrentDayState = {
        ...s,
        accumulatedWorkSeconds: s.accumulatedWorkSeconds + add,
        currentStart: undefined,
        isOnBreak: true,
        currentBreakStart: now(),
      };
      // add a break segment placeholder
      const session = { ...updated.currentSession! };
      session.breaks = [...session.breaks, { start: now() } as SessionBreak];
      updated.currentSession = session;
      return updated;
    });
  }, [persist]);

  const endBreak = useCallback(() => {
    persist((s) => {
      if (!s.isOnBreak || !s.currentSession) return s;
      const session = { ...s.currentSession };
      const lastBreak = session.breaks[session.breaks.length - 1];
      if (lastBreak && !lastBreak.end) lastBreak.end = now();
      return { ...s, isOnBreak: false, currentBreakStart: undefined, currentSession: session, currentStart: now() };
    });
  }, [persist]);

  const saveTodayAndReset = useCallback(() => {
    const s = ensureToday(readState());
    let workDelta = 0;
    const updated: CurrentDayState = { ...s };

    if (s.currentSession) {
      // close any active work span
      if (!s.isOnBreak && s.currentStart) {
        workDelta += diffSeconds(s.currentStart, now());
      }
      const session: WorkSession = { ...s.currentSession, end: now(), breaks: [...s.currentSession.breaks] };
      // close break if active
      if (s.isOnBreak && s.currentBreakStart) {
        const lastBreak = session.breaks[session.breaks.length - 1];
        if (lastBreak && !lastBreak.end) lastBreak.end = now();
      }
      addSessionToDay(s.date, session, s.accumulatedWorkSeconds + workDelta);
    }

    // reset state for next login
    const reset: CurrentDayState = { date: s.date, accumulatedWorkSeconds: 0, isOnBreak: false };
    writeState(reset);
    setState(reset);
    setWorkSeconds(0);
    setBreakSeconds(0);
  }, []);

  const value = useMemo<TimerContextType>(() => ({
    isOnBreak: state.isOnBreak,
    workSecondsToday: workSeconds,
    breakSecondsCurrent: breakSeconds,
    startWorkOnLogin,
    startBreak,
    endBreak,
    saveTodayAndReset,
  }), [state.isOnBreak, workSeconds, breakSeconds, startWorkOnLogin, startBreak, endBreak, saveTodayAndReset]);

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
};

export function useTimer() {
  const ctx = useContext(TimerContext);
  if (!ctx) throw new Error("useTimer must be used within TimerProvider");
  return ctx;
}
