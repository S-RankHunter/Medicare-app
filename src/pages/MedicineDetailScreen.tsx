/**
 * MedicineDetailScreen — Detailed view of a single medicine.
 */

import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { useStore } from "@/lib/store";
import { AppHeader } from "@/components/AppHeader";
import { GlassCard } from "@/components/GlassCard";
import { getIcon } from "@/components/DynamicIcon";
import { CATEGORY_MAP, MEDICINE_TYPE_MAP, FOOD_TIMINGS, FREQUENCIES } from "@/lib/constants";
import { getInventoryPercentage, isLowStock, formatTime, formatDate } from "@/lib/helpers";
import { Pencil, Package, Clock, Calendar, Pill, Bell, FileText, AlertTriangle } from "lucide-react";

export default function MedicineDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { medicines, settings } = useStore();
  const med = medicines.find((m) => m.id === id);

  if (!med) {
    return (
      <div>
        <AppHeader title="Medicine" onBack={() => navigate("/medicines")} />
        <div className="p-8 text-center text-muted-foreground">Medicine not found</div>
      </div>
    );
  }

  const cat = CATEGORY_MAP[med.category];
  const CatIcon = getIcon(cat.icon);
  const typeCfg = MEDICINE_TYPE_MAP[med.type];
  const foodTiming = FOOD_TIMINGS.find((f) => f.id === med.foodTiming);
  const freq = FREQUENCIES.find((f) => f.id === med.frequency);
  const pct = getInventoryPercentage(med);
  const low = isLowStock(med);

  const infoItems = [
    { icon: Pill,       label: "Type",        value: typeCfg.label },
    { icon: CatIcon,    label: "Category",    value: cat.label },
    { icon: Pencil,     label: "Dosage",      value: med.dosage },
    { icon: Clock,      label: "Food Timing", value: foodTiming?.label ?? "—" },
    { icon: Bell,       label: "Frequency",   value: freq?.label ?? "—" },
    { icon: Calendar,   label: "Start Date",  value: formatDate(med.startDate) },
    { icon: Calendar,   label: "End Date",    value: med.endDate ? formatDate(med.endDate) : "Ongoing" },
  ];

  return (
    <div>
      <AppHeader title="Medicine Details" onBack={() => navigate("/medicines")} />

      <div className="px-5 mt-3 pb-28">
        {/* Hero card */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard variant="glass-strong" className="p-5 relative overflow-hidden">
            <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full blur-2xl opacity-20`} style={{ backgroundColor: cat.color }} />
            <div className="relative flex items-center gap-4">
              <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${cat.bgClass}`}>
                <CatIcon className={`h-8 w-8 ${cat.textClass}`} />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-foreground">{med.name}</h2>
                <p className="text-sm text-muted-foreground">{med.dosage} · {typeCfg.label}</p>
                <span className={`inline-flex items-center gap-1 mt-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${cat.bgClass} ${cat.textClass}`}>
                  {cat.label}
                </span>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Inventory */}
        <div className="mt-4">
          <h3 className="text-sm font-bold text-foreground mb-2.5 flex items-center gap-2">
            <Package className="h-4 w-4" />
            Inventory
          </h3>
          <GlassCard className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Remaining Stock</span>
              <span className={`text-sm font-bold ${low ? "text-danger" : "text-foreground"}`}>
                {med.remainingQuantity} / {med.initialQuantity}
              </span>
            </div>
            <div className="h-3 rounded-full bg-muted overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${low ? "bg-danger" : pct > 50 ? "bg-accent" : "bg-warning"}`}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            {low && (
              <div className="flex items-center gap-2 mt-3 rounded-xl bg-danger/5 dark:bg-danger/10 p-2.5">
                <AlertTriangle className="h-4 w-4 text-danger" />
                <p className="text-xs font-medium text-danger">
                  Low stock — only {med.remainingQuantity} {med.type === "syrup" ? "doses" : "tablets"} remaining
                </p>
              </div>
            )}
          </GlassCard>
        </div>

        {/* Reminder Times */}
        <div className="mt-4">
          <h3 className="text-sm font-bold text-foreground mb-2.5 flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Reminder Times
          </h3>
          <GlassCard className="p-4">
            <div className="flex flex-wrap gap-2">
              {med.reminderTimes.map((time) => (
                <span key={time} className="flex items-center gap-1.5 rounded-xl bg-primary/10 px-3 py-2 text-sm font-semibold text-primary">
                  <Clock className="h-3.5 w-3.5" />
                  {formatTime(time, settings.timeFormat)}
                </span>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Info Grid */}
        <div className="mt-4">
          <h3 className="text-sm font-bold text-foreground mb-2.5">Details</h3>
          <GlassCard className="divide-y divide-border/50">
            {infoItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center gap-3 p-3.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span className="text-sm text-muted-foreground flex-1">{item.label}</span>
                  <span className="text-sm font-semibold text-foreground">{item.value}</span>
                </div>
              );
            })}
          </GlassCard>
        </div>

        {/* Notes */}
        {med.notes && (
          <div className="mt-4">
            <h3 className="text-sm font-bold text-foreground mb-2.5 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Notes
            </h3>
            <GlassCard className="p-4">
              <p className="text-sm text-muted-foreground leading-relaxed">{med.notes}</p>
            </GlassCard>
          </div>
        )}

        {/* Edit button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate(`/medicines/edit/${med.id}`)}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25"
        >
          <Pencil className="h-4 w-4" />
          Edit Medicine
        </motion.button>
      </div>
    </div>
  );
}
