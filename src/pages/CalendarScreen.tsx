/**
 * CalendarScreen — Monthly calendar with adherence color indicators.
 * Selecting a date opens medication history for that day.
 */

import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "@/lib/store";
import { AppHeader } from "@/components/AppHeader";
import { GlassCard } from "@/components/GlassCard";
import { getIcon } from "@/components/DynamicIcon";
import { CATEGORY_MAP, STATUS_CONFIG } from "@/lib/constants";
import { toISODate, formatTime, todayISO } from "@/lib/helpers";
import { ChevronLeft, ChevronRight, Check, X, SkipForward, Clock } from "lucide-react";
import type { MedicationLog } from "@/lib/types";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function CalendarScreen() {
  const navigate = useNavigate();
  const { logs, settings } = useStore();
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(todayISO());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // Build calendar grid
  const calendar = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startWeekday = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days: (Date | null)[] = [];
    for (let i = 0; i < startWeekday; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));
    // Fill trailing to complete grid
    while (days.length % 7 !== 0) days.push(null);
    return days;
  }, [year, month]);

  // Group logs by date
  const logsByDate = useMemo(() => {
    const map = new Map<string, MedicationLog[]>();
    for (const log of logs) {
      const arr = map.get(log.date) ?? [];
      arr.push(log);
      map.set(log.date, arr);
    }
    return map;
  }, [logs]);

  /** Get day status: "all-taken", "some-missed", "partial", "none", "future" */
  const getDayStatus = (date: Date): string => {
    const iso = toISODate(date);
    if (iso > todayISO()) return "future";
    const dayLogs = logsByDate.get(iso);
    if (!dayLogs || dayLogs.length === 0) return "none";
    const hasMissed = dayLogs.some((l) => l.status === "missed");
    const allTaken = dayLogs.every((l) => l.status === "taken" || l.status === "skipped");
    if (allTaken) return "all-taken";
    if (hasMissed) return "some-missed";
    return "partial";
  };

  const statusColors: Record<string, string> = {
    "all-taken": "bg-accent",
    "some-missed": "bg-danger",
    "partial": "bg-warning",
    "none": "bg-slate-300 dark:bg-slate-600",
    "future": "",
  };

  const selectedLogs = logsByDate.get(selectedDate) ?? [];
  const today = todayISO();

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  return (
    <div>
      <AppHeader
        title="Calendar"
        subtitle="Your medication history"
        right={
          <button
            onClick={() => navigate("/history")}
            className="text-xs font-semibold text-primary px-2 py-1"
          >
            History
          </button>
        }
      />

      <div className="px-5 mt-3 pb-36">
        {/* Calendar */}
        <GlassCard variant="glass-strong" className="p-4">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted active:scale-90 transition-transform">
              <ChevronLeft className="h-5 w-5 text-foreground" />
            </button>
            <h2 className="text-base font-bold text-foreground">{MONTHS[month]} {year}</h2>
            <button onClick={nextMonth} className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted active:scale-90 transition-transform">
              <ChevronRight className="h-5 w-5 text-foreground" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-2">
            {WEEKDAYS.map((day, i) => (
              <div key={i} className="text-center text-xs font-semibold text-muted-foreground py-1">{day}</div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendar.map((date, i) => {
              if (!date) return <div key={i} />;
              const iso = toISODate(date);
              const status = getDayStatus(date);
              const isSelected = iso === selectedDate;
              const isToday = iso === today;

              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(iso)}
                  className="relative flex flex-col items-center justify-center py-2 rounded-xl transition-all active:scale-90"
                  style={{
                    backgroundColor: isSelected ? "hsl(var(--primary))" : undefined,
                  }}
                  className-active="scale-90"
                >
                  <span
                    className={`text-sm font-medium ${
                      isSelected ? "text-primary-foreground" :
                      isToday ? "text-primary font-bold" :
                      "text-foreground"
                    }`}
                  >
                    {date.getDate()}
                  </span>
                  {status !== "future" && status !== "none" && (
                    <span className={`h-1.5 w-1.5 rounded-full ${statusColors[status]} mt-0.5`} />
                  )}
                  {isToday && !isSelected && (
                    <span className="absolute inset-0 rounded-xl border-2 border-primary/30" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-border/50">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-accent" />
              <span className="text-[10px] text-muted-foreground">Taken</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-danger" />
              <span className="text-[10px] text-muted-foreground">Missed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-warning" />
              <span className="text-[10px] text-muted-foreground">Partial</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span className="text-[10px] text-muted-foreground">Today</span>
            </div>
          </div>
        </GlassCard>

        {/* Selected date logs */}
        <div className="mt-4">
          <h3 className="text-sm font-bold text-foreground mb-3">
            {selectedDate === today ? "Today's Medications" : new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </h3>

          {selectedLogs.length === 0 ? (
            <GlassCard className="p-8 text-center">
              <Clock className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No medication records for this day</p>
            </GlassCard>
          ) : (
            <div className="space-y-2.5">
              <AnimatePresence mode="popLayout">
                {selectedLogs.map((log, i) => {
                  const cat = CATEGORY_MAP[
                    // Find medicine by id to get category — fallback to general
                    log.medicineId
                  ];
                  const statusCfg = STATUS_CONFIG[log.status];
                  const StatusIcon = getIcon(statusCfg.icon);

                  return (
                    <motion.div
                      key={log.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <GlassCard className="p-3.5 flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${statusCfg.bgClass}`}>
                          <StatusIcon className={`h-5 w-5 ${statusCfg.textClass}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{log.medicineName}</p>
                          <p className="text-xs text-muted-foreground">{formatTime(log.time, settings.timeFormat)}</p>
                        </div>
                        <span className={`text-xs font-semibold ${statusCfg.textClass}`}>
                          {statusCfg.label}
                        </span>
                      </GlassCard>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
