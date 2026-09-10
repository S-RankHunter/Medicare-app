/**
 * HomeScreen — Main dashboard.
 * Greeting, adherence progress ring, today's medicines, quick actions,
 * inventory summary, upcoming reminder, recent activity.
 */

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useStore } from "@/lib/store";
import { GlassCard } from "@/components/GlassCard";
import { ProgressRing } from "@/components/ProgressRing";
import { getIcon } from "@/components/DynamicIcon";
import { CATEGORY_MAP, STATUS_CONFIG } from "@/lib/constants";
import { formatTime, getNextReminder, getInventoryPercentage, isLowStock, timeAgo, todayISO } from "@/lib/helpers";
import { Bell, Pill, Package, Calendar, TrendingUp, Activity, ChevronRight, Plus, Clock, CheckCircle2, XCircle } from "lucide-react";

export default function HomeScreen() {
  const navigate = useNavigate();
  const { profile, todaySchedule, adherence, streak, medicines, lowStockMeds, notifications, settings } = useStore();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";
  const nextReminder = getNextReminder(todaySchedule);
  const takenToday = todaySchedule.filter((s) => s.status === "taken").length;
  const totalToday = todaySchedule.length;
  const todayPct = totalToday > 0 ? Math.round((takenToday / totalToday) * 100) : 0;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const quickActions = [
    { label: "Today",    icon: Calendar,    color: "bg-blue-500",   path: "/today" },
    { label: "Add Med",  icon: Plus,        color: "bg-accent",     path: "/medicines/add" },
    { label: "Insights", icon: Activity,    color: "bg-violet-500", path: "/insights" },
    { label: "History",  icon: TrendingUp,  color: "bg-amber-500",  path: "/history" },
  ];

  const recentNotifs = notifications.slice(0, 3);

  return (
    <div className="px-5 pt-safe">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between pt-4 pb-2"
      >
        <div>
          <p className="text-sm text-muted-foreground">{greeting},</p>
          <h1 className="text-2xl font-bold text-foreground">{profile.name} 👋</h1>
        </div>
        <button
          onClick={() => navigate("/notifications")}
          className="relative flex h-11 w-11 items-center justify-center rounded-2xl glass active:scale-90 transition-transform"
        >
          <Bell className="h-5 w-5 text-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </button>
      </motion.div>

      {/* Hero: Adherence + Progress Ring */}
      <GlassCard variant="glass-strong" className="mt-3 p-5 overflow-hidden relative">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/5 blur-2xl" />
        <div className="relative flex items-center gap-5">
          <ProgressRing
            percentage={todayPct}
            size={110}
            strokeWidth={11}
            color={adherence.status.color}
            sublabel="Today"
          />
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">Medication Adherence</p>
            <p className="text-3xl font-bold text-foreground mt-0.5">
              {adherence.percentage}%
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span
                className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
                style={{ backgroundColor: `${adherence.status.color}15`, color: adherence.status.color }}
              >
                {(() => { const Icon = getIcon(adherence.status.icon); return <Icon className="h-3 w-3" />; })()}
                {adherence.status.label}
              </span>
              <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <TrendingUp className="h-3 w-3 text-accent" />
                {streak} day streak
              </span>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Quick Actions */}
      <div className="mt-4 grid grid-cols-4 gap-2.5">
        {quickActions.map((action, i) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.05, type: "spring", stiffness: 300, damping: 20 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => navigate(action.path)}
              className="flex flex-col items-center gap-2"
            >
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${action.color} shadow-lg shadow-slate-200/50 dark:shadow-none`}>
                <Icon className="h-6 w-6 text-white" strokeWidth={2.2} />
              </div>
              <span className="text-[11px] font-medium text-muted-foreground">{action.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Upcoming Reminder */}
      {nextReminder && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-4"
        >
          <GlassCard className="p-4 bg-gradient-to-br from-primary to-blue-600 border-0 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xl">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-xs text-white/70 font-medium">Next Reminder</p>
                  <p className="text-lg font-bold">{nextReminder.medicine.name}</p>
                  <p className="text-xs text-white/80">
                    {formatTime(nextReminder.time, settings.timeFormat)} · {nextReminder.medicine.dosage}
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate("/today")}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 active:scale-90 transition-transform"
              >
                <ChevronRight className="h-5 w-5 text-white" />
              </button>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Today's Medicines */}
      <div className="mt-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-foreground">Today's Medicines</h2>
          <button onClick={() => navigate("/today")} className="text-xs font-semibold text-primary">
            See all
          </button>
        </div>
        <div className="space-y-2.5">
          {todaySchedule.slice(0, 4).map((item, i) => {
            const cat = CATEGORY_MAP[item.medicine.category];
            const CatIcon = getIcon(cat.icon);
            const statusCfg = STATUS_CONFIG[item.status];
            const StatusIcon = getIcon(statusCfg.icon);
            return (
              <motion.div
                key={`${item.medicine.id}-${item.time}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.06 }}
              >
                <GlassCard hover className="p-3.5 flex items-center gap-3">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${cat.bgClass}`}>
                    <CatIcon className={`h-5.5 w-5.5 ${cat.textClass}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{item.medicine.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatTime(item.time, settings.timeFormat)} · {item.medicine.dosage}
                    </p>
                  </div>
                  <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusCfg.bgClass} ${statusCfg.textClass}`}>
                    <StatusIcon className="h-3 w-3" />
                    {statusCfg.label}
                  </span>
                </GlassCard>
              </motion.div>
            );
          })}
          {todaySchedule.length === 0 && (
            <GlassCard className="p-8 text-center">
              <Pill className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No medicines scheduled for today</p>
            </GlassCard>
          )}
        </div>
      </div>

      {/* Inventory Summary */}
      <div className="mt-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-foreground">Inventory Summary</h2>
          <button onClick={() => navigate("/medicines")} className="text-xs font-semibold text-primary">
            See all
          </button>
        </div>
        <GlassCard className="p-4 space-y-3">
          {medicines.slice(0, 3).map((med) => {
            const pct = getInventoryPercentage(med);
            const low = isLowStock(med);
            return (
              <div key={med.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Package className={`h-4 w-4 ${low ? "text-danger" : "text-muted-foreground"}`} />
                    <span className="text-sm font-medium text-foreground">{med.name}</span>
                  </div>
                  <span className={`text-xs font-semibold ${low ? "text-danger" : "text-muted-foreground"}`}>
                    {med.remainingQuantity}/{med.initialQuantity}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${low ? "bg-danger" : pct > 50 ? "bg-accent" : "bg-warning"}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                  />
                </div>
              </div>
            );
          })}
          {lowStockMeds.length > 0 && (
            <div className="flex items-center gap-2 rounded-xl bg-danger/5 dark:bg-danger/10 p-2.5 mt-1">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-danger/10">
                <span className="h-2 w-2 rounded-full bg-danger animate-pulse" />
              </span>
              <p className="text-xs font-medium text-danger">
                {lowStockMeds.length} medicine{lowStockMeds.length > 1 ? "s" : ""} running low
              </p>
            </div>
          )}
        </GlassCard>
      </div>

      {/* Statistics Cards (Bento grid) */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <GlassCard delay={0.4} className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
              <CheckCircle2 className="h-4 w-4 text-accent" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">Taken</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{adherence.taken}</p>
          <p className="text-xs text-muted-foreground mt-0.5">total doses</p>
        </GlassCard>

        <GlassCard delay={0.45} className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-danger/10">
              <XCircle className="h-4 w-4 text-danger" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">Missed</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{adherence.missed}</p>
          <p className="text-xs text-muted-foreground mt-0.5">total doses</p>
        </GlassCard>

        <GlassCard delay={0.5} className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">Streak</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{streak}</p>
          <p className="text-xs text-muted-foreground mt-0.5">days</p>
        </GlassCard>

        <GlassCard delay={0.55} className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
              <Activity className="h-4 w-4 text-violet-500" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">Active</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{medicines.filter(m => m.isActive).length}</p>
          <p className="text-xs text-muted-foreground mt-0.5">medicines</p>
        </GlassCard>
      </div>

      {/* Recent Activity */}
      <div className="mt-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-foreground">Recent Activity</h2>
          <button onClick={() => navigate("/notifications")} className="text-xs font-semibold text-primary">
            See all
          </button>
        </div>
        <GlassCard className="p-2 divide-y divide-border/50">
          {recentNotifs.map((notif) => (
            <div key={notif.id} className="flex items-center gap-3 p-2.5">
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                notif.type === "reminder" ? "bg-primary/10" :
                notif.type === "low-stock" ? "bg-warning/10" :
                notif.type === "missed" ? "bg-danger/10" : "bg-muted"
              }`}>
                <Bell className={`h-4 w-4 ${
                  notif.type === "reminder" ? "text-primary" :
                  notif.type === "low-stock" ? "text-warning" :
                  notif.type === "missed" ? "text-danger" : "text-muted-foreground"
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{notif.title}</p>
                <p className="text-xs text-muted-foreground truncate">{notif.body}</p>
              </div>
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                {timeAgo(notif.time)}
              </span>
            </div>
          ))}
        </GlassCard>
      </div>

      {/* Bottom spacing for FAB + Nav */}
      <div className="h-48" />
    </div>
  );
}
