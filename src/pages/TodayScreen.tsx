/**
 * TodayScreen — Timeline of today's medications with action buttons.
 */

import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useStore } from "@/lib/store";
import { AppHeader } from "@/components/AppHeader";
import { GlassCard } from "@/components/GlassCard";
import { ProgressRing } from "@/components/ProgressRing";
import { getIcon } from "@/components/DynamicIcon";
import { CATEGORY_MAP, STATUS_CONFIG } from "@/lib/constants";
import { formatTime } from "@/lib/helpers";
import { Check, SkipForward, Bell, Clock, Pill } from "lucide-react";
import { toast } from "sonner";

export default function TodayScreen() {
  const navigate = useNavigate();
  const { todaySchedule, markLogStatus, snoozeLog, settings } = useStore();

  const takenCount = todaySchedule.filter((s) => s.status === "taken").length;
  const totalCount = todaySchedule.length;
  const pct = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 0;

  const handleAction = (medicineId: string, time: string, action: "taken" | "skipped" | "snoozed") => {
    if (action === "snoozed") {
      snoozeLog(medicineId, time);
      toast.success("Reminder snoozed");
    } else {
      markLogStatus(medicineId, time, action);
      toast.success(action === "taken" ? "Marked as taken" : "Marked as skipped");
    }
  };

  // Group by time periods
  const periods = {
    morning: todaySchedule.filter((s) => parseInt(s.time) < 12),
    afternoon: todaySchedule.filter((s) => parseInt(s.time) >= 12 && parseInt(s.time) < 17),
    evening: todaySchedule.filter((s) => parseInt(s.time) >= 17 && parseInt(s.time) < 21),
    night: todaySchedule.filter((s) => parseInt(s.time) >= 21),
  };

  const periodLabels = {
    morning: { label: "Morning", icon: "🌅" },
    afternoon: { label: "Afternoon", icon: "☀️" },
    evening: { label: "Evening", icon: "🌆" },
    night: { label: "Night", icon: "🌙" },
  };

  return (
    <div>
      <AppHeader title="Today" subtitle={new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} />

      <div className="px-5 mt-3 pb-28">
        {/* Progress summary */}
        <GlassCard variant="glass-strong" className="p-5 flex items-center gap-5">
          <ProgressRing percentage={pct} size={90} strokeWidth={9} color="hsl(var(--accent))" sublabel="Done" />
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">Today's Progress</p>
            <p className="text-2xl font-bold text-foreground">{takenCount} / {totalCount}</p>
            <p className="text-xs text-muted-foreground mt-1">medications taken</p>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-accent" />
              <span className="text-xs font-medium text-muted-foreground">{takenCount} taken</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-primary" />
              <span className="text-xs font-medium text-muted-foreground">{todaySchedule.filter(s => s.status === "pending").length} pending</span>
            </div>
          </div>
        </GlassCard>

        {/* Timeline */}
        {totalCount === 0 ? (
          <GlassCard className="p-12 text-center mt-4">
            <Pill className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">No medicines scheduled</p>
            <p className="text-xs text-muted-foreground mt-1">Enjoy your medicine-free day!</p>
          </GlassCard>
        ) : (
          <div className="mt-5 space-y-6">
            {(Object.keys(periods) as Array<keyof typeof periods>).map((periodKey) => {
              const items = periods[periodKey];
              if (items.length === 0) return null;

              return (
                <div key={periodKey}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">{periodLabels[periodKey].icon}</span>
                    <h3 className="text-sm font-bold text-foreground">{periodLabels[periodKey].label}</h3>
                    <span className="text-xs text-muted-foreground">({items.length})</span>
                  </div>
                  <div className="relative space-y-3">
                    {/* Timeline line */}
                    <div className="absolute left-[22px] top-2 bottom-2 w-0.5 bg-border" />

                    {items.map((item, i) => {
                      const cat = CATEGORY_MAP[item.medicine.category];
                      const CatIcon = getIcon(cat.icon);
                      const statusCfg = STATUS_CONFIG[item.status];
                      const isCompleted = item.status === "taken" || item.status === "skipped";

                      return (
                        <motion.div
                          key={`${item.medicine.id}-${item.time}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06 }}
                          className="relative pl-12"
                        >
                          {/* Timeline dot */}
                          <div
                            className={`absolute left-0 top-3 flex h-11 w-11 items-center justify-center rounded-xl ${cat.bgClass} z-10`}
                          >
                            <CatIcon className={`h-5 w-5 ${cat.textClass}`} />
                          </div>

                          <GlassCard className="p-3.5" hover>
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-bold text-foreground">{item.medicine.name}</p>
                                  <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold ${statusCfg.bgClass} ${statusCfg.textClass}`}>
                                    {statusCfg.label}
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {formatTime(item.time, settings.timeFormat)} · {item.medicine.dosage}
                                </p>
                              </div>
                            </div>

                            {/* Action buttons */}
                            {!isCompleted && (
                              <div className="flex gap-2 mt-3">
                                <button
                                  onClick={() => handleAction(item.medicine.id, item.time, "taken")}
                                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-accent py-2 text-xs font-semibold text-accent-foreground active:scale-95 transition-transform"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                  Taken
                                </button>
                                <button
                                  onClick={() => handleAction(item.medicine.id, item.time, "skipped")}
                                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-warning/15 py-2 text-xs font-semibold text-warning active:scale-95 transition-transform"
                                >
                                  <SkipForward className="h-3.5 w-3.5" />
                                  Skip
                                </button>
                                <button
                                  onClick={() => handleAction(item.medicine.id, item.time, "snoozed")}
                                  className="flex items-center justify-center gap-1.5 rounded-xl bg-muted px-3 py-2 text-xs font-semibold text-muted-foreground active:scale-95 transition-transform"
                                >
                                  <Clock className="h-3.5 w-3.5" />
                                  Snooze
                                </button>
                              </div>
                            )}
                            {isCompleted && (
                              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                {item.status === "taken" ? (
                                  <><Check className="h-3.5 w-3.5 text-accent" /> Completed</>
                                ) : (
                                  <><SkipForward className="h-3.5 w-3.5 text-warning" /> Skipped</>
                                )}
                              </div>
                            )}
                          </GlassCard>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
