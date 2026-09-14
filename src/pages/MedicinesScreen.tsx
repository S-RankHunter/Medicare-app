/**
 * MedicinesScreen — List of all medicines with search & filter.
 */

import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "@/lib/store";
import { GlassCard } from "@/components/GlassCard";
import { AppHeader } from "@/components/AppHeader";
import { getIcon } from "@/components/DynamicIcon";
import { CATEGORIES, CATEGORY_MAP, MEDICINE_TYPE_MAP } from "@/lib/constants";
import { getInventoryPercentage, isLowStock, isCriticalStock } from "@/lib/helpers";
import { Search, Package, AlertTriangle, ChevronRight } from "lucide-react";

export default function MedicinesScreen() {
  const navigate = useNavigate();
  const { medicines, settings } = useStore();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filtered = useMemo(() => {
    return medicines.filter((med) => {
      if (activeCategory !== "all" && med.category !== activeCategory) return false;
      if (query && !med.name.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [medicines, query, activeCategory]);

  return (
    <div>
      <AppHeader title="Medicines" subtitle={`${medicines.length} total medicines`} />

      <div className="px-5 mt-24">
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search medicines..."
            className="w-full rounded-xl bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 pl-11 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
          />
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mb-4 -mx-5 px-5">
          <FilterChip label="All" active={activeCategory === "all"} onClick={() => setActiveCategory("all")} />
          {CATEGORIES.map((cat) => {
            const Icon = getIcon(cat.icon);
            return (
              <FilterChip
                key={cat.id}
                label={cat.label}
                icon={<Icon className="h-3.5 w-3.5" />}
                active={activeCategory === cat.id}
                onClick={() => setActiveCategory(cat.id)}
              />
            );
          })}
        </div>

        {/* Medicine List */}
        <div className="space-y-2.5 pb-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((med, i) => {
              const cat = CATEGORY_MAP[med.category];
              const CatIcon = getIcon(cat.icon);
              const typeCfg = MEDICINE_TYPE_MAP[med.type];
              const pct = getInventoryPercentage(med);
              const low = isLowStock(med);
              const critical = isCriticalStock(med);

              return (
                <motion.div
                  key={med.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <GlassCard hover className="p-4 active:scale-[0.98] transition-transform" onClick={() => navigate(`/medicines/detail/${med.id}`)}>
                    <div className="flex items-start gap-3">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${cat.bgClass} flex-shrink-0`}>
                        <CatIcon className={`h-6 w-6 ${cat.textClass}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-bold text-foreground truncate">{med.name}</p>
                          {low && (
                            <span className={`flex items-center gap-1 text-[10px] font-semibold ${critical ? "text-danger" : "text-warning"} flex-shrink-0`}>
                              <AlertTriangle className="h-3 w-3" />
                              {critical ? "Critical" : "Low"}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {med.dosage} · {typeCfg.label}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-[10px] font-medium rounded-full px-2 py-0.5 ${cat.bgClass} ${cat.textClass}`}>
                            {cat.label}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {med.reminderTimes.length}x {med.frequency.replace("-", " ")}
                          </span>
                        </div>
                        {/* Inventory bar */}
                        <div className="mt-2.5 flex items-center gap-2">
                          <Package className={`h-3.5 w-3.5 ${low ? "text-danger" : "text-muted-foreground"}`} />
                          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                            <motion.div
                              className={`h-full rounded-full ${critical ? "bg-danger" : low ? "bg-warning" : "bg-accent"}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.6, delay: 0.1 + i * 0.04 }}
                            />
                          </div>
                          <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap">
                            {med.remainingQuantity} left
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filtered.length === 0 && (
            <GlassCard className="p-12 text-center">
              <Search className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground">No medicines found</p>
              <p className="text-xs text-muted-foreground mt-1">Try a different search or category</p>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterChip({ label, icon, active, onClick }: { label: string; icon?: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-all active:scale-95 ${
        active
          ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
          : "bg-white/60 dark:bg-slate-800/60 text-muted-foreground border border-slate-200 dark:border-slate-700"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
