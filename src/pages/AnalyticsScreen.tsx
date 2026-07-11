/**
 * AnalyticsScreen — Analytics dashboard with charts and stats.
 */

import { motion } from "framer-motion";
import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { AppHeader } from "@/components/AppHeader";
import { GlassCard } from "@/components/GlassCard";
import { ProgressRing } from "@/components/ProgressRing";
import { getIcon } from "@/components/DynamicIcon";
import { CATEGORIES, CATEGORY_MAP } from "@/lib/constants";
import { calculateAdherence, calculateStreak, toISODate } from "@/lib/helpers";
import {
  BarChart, Bar, XAxis, ResponsiveContainer, Tooltip, Cell,
  PieChart, Pie, Sector, RadialBarChart, RadialBar,
} from "recharts";
import { CheckCircle2, XCircle, Flame, TrendingUp, Activity } from "lucide-react";

export default function AnalyticsScreen() {
  const { logs, medicines } = useStore();

  // Weekly data (last 7 days)
  const weeklyData = useMemo(() => {
    const days: { day: string; taken: number; missed: number; skipped: number; date: string }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = toISODate(d);
      const dayLogs = logs.filter((l) => l.date === iso);
      days.push({
        day: d.toLocaleDateString("en-US", { weekday: "short" }),
        date: iso,
        taken: dayLogs.filter((l) => l.status === "taken").length,
        missed: dayLogs.filter((l) => l.status === "missed").length,
        skipped: dayLogs.filter((l) => l.status === "skipped").length,
      });
    }
    return days;
  }, [logs]);

  // Monthly data (last 4 weeks)
  const monthlyData = useMemo(() => {
    const weeks: { week: string; adherence: number }[] = [];
    for (let w = 3; w >= 0; w--) {
      const end = new Date();
      end.setDate(end.getDate() - w * 7);
      const start = new Date(end);
      start.setDate(start.getDate() - 6);
      const startIso = toISODate(start);
      const endIso = toISODate(end);
      const adherence = calculateAdherence(logs, startIso, endIso);
      weeks.push({
        week: `W${4 - w}`,
        adherence: adherence.percentage,
      });
    }
    return weeks;
  }, [logs]);

  // Category distribution
  const categoryData = useMemo(() => {
    return CATEGORIES.map((cat) => {
      const count = medicines.filter((m) => m.category === cat.id).length;
      return { name: cat.label, value: count, color: cat.color, id: cat.id };
    }).filter((d) => d.value > 0);
  }, [medicines]);

  // Overall stats
  const overallAdherence = calculateAdherence(logs);
  const streak = calculateStreak(logs);
  const last7Adherence = calculateAdherence(logs, toISODate(new Date(Date.now() - 6 * 86400000)));

  const stats = [
    { label: "Taken",    value: overallAdherence.taken,   icon: CheckCircle2, color: "#22C55E", bg: "bg-accent/10" },
    { label: "Missed",   value: overallAdherence.missed,  icon: XCircle,       color: "#EF4444", bg: "bg-danger/10" },
    { label: "Streak",   value: streak,                    icon: Flame,         color: "#F59E0B", bg: "bg-warning/10" },
    { label: "Adherence",value: `${overallAdherence.percentage}%`, icon: TrendingUp, color: "#2563EB", bg: "bg-primary/10" },
  ];

  return (
    <div>
      <AppHeader title="Analytics" subtitle="Your medication insights" />

      <div className="px-5 mt-3 pb-28 space-y-4">
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06, type: "spring", stiffness: 300, damping: 25 }}
              >
                <GlassCard className="p-4">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${stat.bg} mb-2`}>
                    <Icon className="h-4.5 w-4.5" style={{ color: stat.color }} />
                  </div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>

        {/* Adherence ring + status */}
        <GlassCard variant="glass-strong" className="p-5 flex items-center gap-5">
          <ProgressRing
            percentage={overallAdherence.percentage}
            size={100}
            strokeWidth={10}
            color={overallAdherence.status.color}
            sublabel="Overall"
          />
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">Adherence Score</p>
            <p className="text-xl font-bold text-foreground mt-0.5">{overallAdherence.status.label}</p>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Last 7 days</span>
                <span className="font-semibold text-foreground">{last7Adherence.percentage}%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Total logged</span>
                <span className="font-semibold text-foreground">{overallAdherence.total} doses</span>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Weekly chart */}
        <div>
          <h3 className="text-sm font-bold text-foreground mb-2.5">Weekly Activity</h3>
          <GlassCard className="p-4">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={weeklyData} barGap={2}>
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted) / 0.3)" }}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid hsl(var(--border))",
                    background: "hsl(var(--popover))",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="taken" stackId="a" fill="#22C55E" radius={[0, 0, 0, 0]} />
                <Bar dataKey="skipped" stackId="a" fill="#F59E0B" radius={[0, 0, 0, 0]} />
                <Bar dataKey="missed" stackId="a" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-4 mt-2">
              <Legend color="#22C55E" label="Taken" />
              <Legend color="#F59E0B" label="Skipped" />
              <Legend color="#EF4444" label="Missed" />
            </div>
          </GlassCard>
        </div>

        {/* Monthly trend */}
        <div>
          <h3 className="text-sm font-bold text-foreground mb-2.5">Monthly Trend</h3>
          <GlassCard className="p-4">
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={monthlyData}>
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted) / 0.3)" }}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid hsl(var(--border))",
                    background: "hsl(var(--popover))",
                    fontSize: 12,
                  }}
                  formatter={(v: number) => [`${v}%`, "Adherence"]}
                />
                <Bar dataKey="adherence" radius={[6, 6, 0, 0]}>
                  {monthlyData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.adherence >= 85 ? "#22C55E" : entry.adherence >= 65 ? "#2563EB" : "#F59E0B"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
        </div>

        {/* Category distribution */}
        {categoryData.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-foreground mb-2.5">Medicine Categories</h3>
            <GlassCard className="p-4">
              <div className="flex items-center gap-4">
                <ResponsiveContainer width={140} height={140}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={38}
                      outerRadius={60}
                      paddingAngle={3}
                    >
                      {categoryData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-1.5">
                  {categoryData.map((cat) => {
                    const config = CATEGORY_MAP[cat.id as keyof typeof CATEGORY_MAP];
                    const Icon = getIcon(config.icon);
                    return (
                      <div key={cat.id} className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-lg" style={{ backgroundColor: `${cat.color}15` }}>
                          <Icon className="h-3.5 w-3.5" style={{ color: cat.color }} />
                        </div>
                        <span className="text-xs font-medium text-foreground flex-1">{cat.name}</span>
                        <span className="text-xs font-bold text-muted-foreground">{cat.value}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        {/* 7-day mini progress */}
        <div>
          <h3 className="text-sm font-bold text-foreground mb-2.5">7-Day Breakdown</h3>
          <GlassCard className="p-4 space-y-3">
            {weeklyData.map((day) => {
              const total = day.taken + day.missed + day.skipped;
              const pct = total > 0 ? (day.taken / total) * 100 : 0;
              return (
                <div key={day.date}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-foreground">{day.day}</span>
                    <span className="text-xs text-muted-foreground">
                      {day.taken}/{total} taken
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden flex">
                    {total > 0 && (
                      <>
                        <motion.div
                          className="h-full bg-accent"
                          initial={{ width: 0 }}
                          animate={{ width: `${(day.taken / total) * 100}%` }}
                          transition={{ duration: 0.6 }}
                        />
                        <motion.div
                          className="h-full bg-warning"
                          initial={{ width: 0 }}
                          animate={{ width: `${(day.skipped / total) * 100}%` }}
                          transition={{ duration: 0.6, delay: 0.1 }}
                        />
                        <motion.div
                          className="h-full bg-danger"
                          initial={{ width: 0 }}
                          animate={{ width: `${(day.missed / total) * 100}%` }}
                          transition={{ duration: 0.6, delay: 0.2 }}
                        />
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-[10px] font-medium text-muted-foreground">{label}</span>
    </div>
  );
}
