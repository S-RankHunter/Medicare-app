/**
 * HistoryScreen — Full medication history timeline with filters.
 */

import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { useStore } from "@/lib/store";
import { AppHeader } from "@/components/AppHeader";
import { GlassCard } from "@/components/GlassCard";
import { getIcon } from "@/components/DynamicIcon";
import { STATUS_CONFIG } from "@/lib/constants";
import { formatDate, formatTime } from "@/lib/helpers";
import type { LogStatus } from "@/lib/types";
import { Check, X, SkipForward, Clock, History } from "lucide-react";

type FilterStatus = "all" | LogStatus;

export default function HistoryScreen() {
  const { logs, settings } = useStore();
  const [filter, setFilter] = useState<FilterStatus>("all");

  const filtered = useMemo(() => {
    const sorted = [...logs].sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      return b.time.localeCompare(a.time);
    });
    if (filter === "all") return sorted;
    return sorted.filter((l) => l.status === filter);
  }, [logs, filter]);

  // Group by date
  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const log of filtered) {
      const arr = map.get(log.date) ?? [];
      arr.push(log);
      map.set(log.date, arr);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const filters: { id: FilterStatus; label: string }[] = [
    { id: "all", label: "All" },
    { id: "taken", label: "Taken" },
    { id: "missed", label: "Missed" },
    { id: "skipped", label: "Skipped" },
  ];

  return (
    <div>
      <AppHeader title="History" subtitle="Complete medication log" onBack={() => window.history.back()} />

      <div className="px-5 mt-3 pb-28">
        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mb-4 -mx-5 px-5">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`rounded-full px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-all active:scale-95 ${
                filter === f.id
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "bg-white/60 dark:bg-slate-800/60 text-muted-foreground border border-slate-200 dark:border-slate-700"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {grouped.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <History className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">No history found</p>
            <p className="text-xs text-muted-foreground mt-1">Try a different filter</p>
          </GlassCard>
        ) : (
          <div className="space-y-5">
            <AnimatePresence>
              {grouped.map(([date, dayLogs]) => (
                <motion.div
                  key={date}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-xs font-bold text-muted-foreground px-2">
                      {formatDate(date, { weekday: "long", month: "short", day: "numeric" })}
                    </span>
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  <div className="space-y-2 relative">
                    <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-border" />
                    {dayLogs.map((log, i) => {
                      const statusCfg = STATUS_CONFIG[log.status];
                      const StatusIcon = getIcon(statusCfg.icon);
                      return (
                        <motion.div
                          key={log.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className="relative pl-10"
                        >
                          <div className={`absolute left-0 top-3 flex h-8 w-8 items-center justify-center rounded-lg ${statusCfg.bgClass} z-10`}>
                            <StatusIcon className={`h-4 w-4 ${statusCfg.textClass}`} />
                          </div>
                          <GlassCard className="p-3 flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-foreground">{log.medicineName}</p>
                              <p className="text-xs text-muted-foreground">{formatTime(log.time, settings.timeFormat)}</p>
                            </div>
                            <span className={`text-xs font-semibold ${statusCfg.textClass}`}>
                              {statusCfg.label}
                            </span>
                          </GlassCard>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
