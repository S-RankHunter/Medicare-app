/**
 * HomeScreen — Main dashboard.
 * Clean minimal layout matching reference design.
 */

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useStore } from "@/lib/store";
import { getIcon } from "@/components/DynamicIcon";
import { CATEGORY_MAP } from "@/lib/constants";
import { formatTime, getInventoryPercentage, isLowStock, timeAgo } from "@/lib/helpers";
import {
  Bell, Package, TrendingUp, Plus,
  CheckCircle2, XCircle, Clock, ChevronRight,
  Calendar, History, Stethoscope, Phone, AlertTriangle
} from "lucide-react";

export default function HomeScreen() {
  const navigate = useNavigate();
  const { profile, todaySchedule, adherence, streak, medicines, lowStockMeds, notifications, settings, profile: { emergencyContacts } } = useStore();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning," : hour < 18 ? "Good Afternoon," : "Good Evening,";
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const takenToday = todaySchedule.filter((s) => s.status === "taken").length;
  const totalToday = todaySchedule.length;
  const adherencePct = totalToday > 0 ? Math.round((takenToday / totalToday) * 100) : 0;

  const nextMed = todaySchedule.find((s) => s.status === "pending" || s.status === "due");

  const quickActions = [
    { label: "Today", icon: Calendar, path: "/today", bg: "bg-primary", text: "text-white" },
    { label: "Add Med", icon: Plus, path: "/medicines/add", bg: "bg-primary", text: "text-white" },
    { label: "Insights", icon: TrendingUp, path: "/analytics", bg: "bg-primary", text: "text-white" },
    { label: "History", icon: History, path: "/history", bg: "bg-primary", text: "text-white" },
  ];

  const adherenceLabel = adherencePct >= 80 ? "Good" : adherencePct >= 50 ? "Fair" : "Low";
  const adherenceColor = adherencePct >= 80 ? "text-accent" : adherencePct >= 50 ? "text-warning" : "text-danger";

  return (
    <div className="bg-background min-h-screen">

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-6 pb-4">
        <div>
          <p className="text-sm text-muted-foreground">{greeting}</p>
          <h1 className="text-2xl font-bold text-foreground">{profile.name}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Stay on track with your medications</p>
        </div>
        <button
          onClick={() => navigate("/profile")}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 border border-primary/20"
        >
          <span className="text-base font-bold text-primary">
            {profile.name?.charAt(0)?.toUpperCase() ?? "U"}
          </span>
        </button>
      </div>

      <div className="px-5 pb-48 space-y-5">

        {/* Adherence Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-5"
        >
          <div className="flex items-center gap-5">
            {/* Circular progress */}
            <div className="relative flex-shrink-0">
              <svg width="80" height="80" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="32" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
                <circle
                  cx="40" cy="40" r="32" fill="none"
                  stroke="hsl(var(--primary))" strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 32}`}
                  strokeDashoffset={`${2 * Math.PI * 32 * (1 - adherencePct / 100)}`}
                  transform="rotate(-90 40 40)"
                  style={{ transition: "stroke-dashoffset 1s ease" }}
                />
                <text x="40" y="44" textAnchor="middle" className="fill-foreground" fontSize="14" fontWeight="700">
                  {adherencePct}%
                </text>
              </svg>
              <p className="text-[10px] text-center text-muted-foreground mt-0.5">Today</p>
            </div>

            {/* Info */}
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">Medication Adherence</p>
              <p className="text-3xl font-bold text-foreground">{adherence.percentage}%</p>
              <div className="flex items-center gap-3 mt-2">
                <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 ${adherenceColor}`}>
                  {adherenceLabel}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3" /> {streak} day streak
                </span>
              </div>
            </div>

            {/* Bell */}
            <button
              onClick={() => navigate("/notifications")}
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border self-start"
            >
              <Bell className="h-5 w-5 text-foreground" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-danger" />
              )}
            </button>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-3">
          {quickActions.map((action, i) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(action.path)}
                className="flex flex-col items-center gap-2"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <span className="text-[11px] font-medium text-foreground">{action.label}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Next Reminder Banner */}
        {nextMed && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => navigate("/today")}
            className="w-full glass-primary rounded-2xl p-4 flex items-center gap-4"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 flex-shrink-0">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-xs text-white/70 font-medium">Next Reminder</p>
              <p className="text-base font-bold text-white">{nextMed.medicine.name}</p>
              <p className="text-xs text-white/70">{formatTime(nextMed.time, settings.timeFormat)} · {nextMed.medicine.dosage}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-white/70 flex-shrink-0" />
          </motion.button>
        )}

        {/* Today's Medicines */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-foreground">Today's Medicines</h2>
            <button onClick={() => navigate("/today")} className="text-sm font-semibold text-primary">
              See all
            </button>
          </div>
          <div className="space-y-2.5">
            {todaySchedule.slice(0, 4).map((item, i) => {
              const cat = CATEGORY_MAP[item.medicine.category];
              const CatIcon = getIcon(cat.icon);
              const isTaken = item.status === "taken";
              const isDue = item.status === "due";

              return (
                <motion.div
                  key={`${item.medicine.id}-${item.time}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass rounded-2xl p-4 flex items-center gap-3"
                >
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${cat.bgClass} flex-shrink-0`}>
                    <CatIcon className={`h-5 w-5 ${cat.textClass}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{item.medicine.name}</p>
                    <p className="text-xs text-muted-foreground">{item.medicine.dosage}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {formatTime(item.time, settings.timeFormat)}
                    </span>
                    {isTaken ? (
                      <span className="flex items-center gap-1 text-xs font-semibold text-accent">
                        <CheckCircle2 className="h-3 w-3" /> Taken
                      </span>
                    ) : isDue ? (
                      <button
                        onClick={() => navigate("/today")}
                        className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-white"
                      >
                        Take Now
                      </button>
                    ) : (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Pending
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}

            {todaySchedule.length === 0 && (
              <div className="glass rounded-2xl p-8 text-center">
                <CheckCircle2 className="h-10 w-10 text-accent/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No medicines scheduled for today</p>
              </div>
            )}
          </div>
        </div>

        {/* Inventory Summary */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-foreground">Inventory Summary</h2>
            <button onClick={() => navigate("/medicines")} className="text-sm font-semibold text-primary">
              See all
            </button>
          </div>
          <div className="glass rounded-2xl p-4 space-y-4">
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
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${low ? "bg-danger" : pct > 50 ? "bg-accent" : "bg-warning"}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                </div>
              );
            })}
            {lowStockMeds.length > 0 && (
              <div className="flex items-center gap-2 rounded-xl bg-danger/5 p-3">
                <AlertTriangle className="h-4 w-4 text-danger flex-shrink-0" />
                <p className="text-xs font-medium text-danger">
                  {lowStockMeds.length} medicine{lowStockMeds.length > 1 ? "s" : ""} running low
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Taken", value: adherence.taken, sub: "total doses", icon: CheckCircle2, color: "text-accent", bg: "bg-accent/10" },
            { label: "Missed", value: adherence.missed, sub: "total doses", icon: XCircle, color: "text-danger", bg: "bg-danger/10" },
            { label: "Streak", value: streak, sub: "days", icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
            { label: "Active", value: medicines.filter(m => m.isActive).length, sub: "medicines", icon: Package, color: "text-warning", bg: "bg-warning/10" },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="glass rounded-2xl p-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.bg}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">{stat.label}</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.sub}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Contact Doctor */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-foreground">Doctor Contacts</h2>
            <button onClick={() => navigate("/profile")} className="text-sm font-semibold text-primary">
              Add Doctor
            </button>
          </div>
          {emergencyContacts.length > 0 ? (
            <div className="glass rounded-2xl divide-y divide-border">
              {emergencyContacts.map((contact) => (
                <div key={contact.id} className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 flex-shrink-0">
                    <Stethoscope className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{contact.name}</p>
                    <p className="text-xs text-muted-foreground">{contact.relationship} · {contact.phone}</p>
                  </div>
                  <a
                    href={`tel:${contact.phone}`}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10"
                  >
                    <Phone className="h-4 w-4 text-accent" />
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass rounded-2xl p-5 text-center">
              <Stethoscope className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No doctor contacts added yet</p>
              <button onClick={() => navigate("/profile")} className="mt-2 text-xs font-semibold text-primary">
                Add in Profile →
              </button>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-foreground">Recent Activity</h2>
            <button onClick={() => navigate("/notifications")} className="text-sm font-semibold text-primary">
              See all
            </button>
          </div>
          <div className="glass rounded-2xl divide-y divide-border">
            {notifications.slice(0, 3).map((notif) => (
              <div key={notif.id} className="flex items-center gap-3 p-4">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl flex-shrink-0 ${
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
          </div>
        </div>

      </div>
    </div>
  );
}