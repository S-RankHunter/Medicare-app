/**
 * InsightsScreen — AI Health Insights with predefined educational cards.
 * No AI API integration — displays curated health information per category.
 */

import { motion } from "framer-motion";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { AppHeader } from "@/components/AppHeader";
import { GlassCard } from "@/components/GlassCard";
import { getIcon } from "@/components/DynamicIcon";
import { HEALTH_INSIGHTS, CATEGORIES } from "@/lib/constants";
import { Sparkles, Lightbulb, Check, X } from "lucide-react";
import type { MedicineCategory } from "@/lib/types";

export default function InsightsScreen() {
  const { medicines } = useStore();
  const [activeCategory, setActiveCategory] = useState<MedicineCategory | "all">("all");

  // Show categories that the user has medicines for, plus all
  const userCategories = new Set(medicines.map((m) => m.category));
  const availableCategories = CATEGORIES.filter((c) => userCategories.has(c.id));

  const filtered = activeCategory === "all"
    ? HEALTH_INSIGHTS
    : HEALTH_INSIGHTS.filter((i) => i.category === activeCategory);

  return (
    <div>
      <AppHeader title="AI Health Insights" subtitle="Educational medication guidance" onBack={() => window.history.back()} />

      <div className="px-5 mt-3 pb-36">
        {/* Hero banner */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard variant="glass-strong" className="p-5 relative overflow-hidden bg-gradient-to-br from-violet-500/10 to-purple-500/5">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-violet-500/10 blur-2xl" />
            <div className="relative flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 shadow-lg shadow-violet-500/25">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Smart Health Guidance</p>
                <p className="text-xs text-muted-foreground">Curated insights based on your medicines</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Category filters */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar mt-4 mb-4 -mx-5 px-5">
          <button
            onClick={() => setActiveCategory("all")}
            className={`rounded-full px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-all active:scale-95 ${
              activeCategory === "all"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "bg-white/60 dark:bg-slate-800/60 text-muted-foreground border border-slate-200 dark:border-slate-700"
            }`}
          >
            All Insights
          </button>
          {availableCategories.map((cat) => {
            const Icon = getIcon(cat.icon);
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-all active:scale-95 ${
                  activeCategory === cat.id
                    ? `${cat.bgClass} ${cat.textClass}`
                    : "bg-white/60 dark:bg-slate-800/60 text-muted-foreground border border-slate-200 dark:border-slate-700"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Insight cards */}
        <div className="space-y-4">
          {filtered.map((insight, i) => {
            const cat = CATEGORIES.find((c) => c.id === insight.category)!;
            const Icon = getIcon(insight.icon);
            const [expanded, setExpanded] = useState(false);

            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <GlassCard className="p-5" hover>
                  {/* Header */}
                  <div className="flex items-start gap-3">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-2xl flex-shrink-0"
                      style={{ backgroundColor: `${cat.color}15` }}
                    >
                      <Icon className="h-6 w-6" style={{ color: cat.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-foreground">{insight.title}</h3>
                        <span
                          className="text-[10px] font-semibold rounded-full px-2 py-0.5"
                          style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                        >
                          {cat.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{insight.subtitle}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed mt-3">
                    {insight.description}
                  </p>

                  {/* Tips */}
                  <div className="mt-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Lightbulb className="h-3.5 w-3.5 text-warning" />
                      <span className="text-xs font-bold text-foreground">Usage Tips</span>
                    </div>
                    <div className="space-y-1.5">
                      {insight.tips.slice(0, expanded ? undefined : 2).map((tip, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 + idx * 0.05 }}
                          className="flex items-start gap-2"
                        >
                          <span
                            className="flex h-4 w-4 items-center justify-center rounded-full mt-0.5 flex-shrink-0"
                            style={{ backgroundColor: `${cat.color}15` }}
                          >
                            <Check className="h-2.5 w-2.5" style={{ color: cat.color }} />
                          </span>
                          <span className="text-xs text-muted-foreground leading-relaxed">{tip}</span>
                        </motion.div>
                      ))}
                    </div>
                    {insight.tips.length > 2 && (
                      <button
                        onClick={() => setExpanded(!expanded)}
                        className="text-xs font-semibold text-primary mt-2"
                      >
                        {expanded ? "Show less" : `Show ${insight.tips.length - 2} more tips`}
                      </button>
                    )}
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>

        {/* Disclaimer */}
        <GlassCard className="p-4 mt-4 bg-muted/30">
          <p className="text-[10px] text-muted-foreground leading-relaxed text-center">
            These insights are for educational purposes only and are not a substitute for professional medical advice.
            Always consult your healthcare provider before making changes to your medication regimen.
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
