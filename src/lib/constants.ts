/**
 * MediCare AI — Static Constants & Metadata
 * Category configs, medicine type configs, AI health insights, and helper maps.
 */

import type { MedicineCategory, MedicineType, FoodTiming, Frequency } from "./types";

/* ── Medicine Categories ── */
export interface CategoryConfig {
  id: MedicineCategory;
  label: string;
  color: string;       // hex
  bgClass: string;     // tailwind bg class
  textClass: string;   // tailwind text class
  icon: string;        // lucide icon name
}

export const CATEGORIES: CategoryConfig[] = [
  { id: "heart",        label: "Heart",        color: "#EF4444", bgClass: "bg-red-50 dark:bg-red-500/10",     textClass: "text-red-600 dark:text-red-400",       icon: "HeartPulse" },
  { id: "diabetes",     label: "Diabetes",     color: "#8B5CF6", bgClass: "bg-violet-50 dark:bg-violet-500/10", textClass: "text-violet-600 dark:text-violet-400", icon: "Activity" },
  { id: "vitamin",      label: "Vitamin",      color: "#22C55E", bgClass: "bg-green-50 dark:bg-green-500/10",   textClass: "text-green-600 dark:text-green-400",   icon: "Pill" },
  { id: "pain-relief",  label: "Pain Relief",  color: "#F59E0B", bgClass: "bg-amber-50 dark:bg-amber-500/10",   textClass: "text-amber-600 dark:text-amber-400",   icon: "Bandage" },
  { id: "cold-fever",   label: "Cold & Fever", color: "#06B6D4", bgClass: "bg-cyan-50 dark:bg-cyan-500/10",     textClass: "text-cyan-600 dark:text-cyan-400",     icon: "Thermometer" },
  { id: "antibiotic",   label: "Antibiotic",   color: "#3B82F6", bgClass: "bg-blue-50 dark:bg-blue-500/10",     textClass: "text-blue-600 dark:text-blue-400",     icon: "Shield" },
  { id: "general",      label: "General",      color: "#64748B", bgClass: "bg-slate-50 dark:bg-slate-500/10",   textClass: "text-slate-600 dark:text-slate-400",   icon: "Stethoscope" },
];

export const CATEGORY_MAP: Record<MedicineCategory, CategoryConfig> =
  CATEGORIES.reduce((acc, c) => { acc[c.id] = c; return acc; }, {} as Record<MedicineCategory, CategoryConfig>);

/* ── Medicine Types ── */
export interface MedicineTypeConfig {
  id: MedicineType;
  label: string;
  icon: string;
}

export const MEDICINE_TYPES: MedicineTypeConfig[] = [
  { id: "tablet",    label: "Tablet",    icon: "Pill" },
  { id: "capsule",   label: "Capsule",   icon: "Tablets" },
  { id: "syrup",     label: "Syrup",     icon: "Droplets" },
  { id: "injection", label: "Injection", icon: "Syringe" },
  { id: "drops",     label: "Drops",     icon: "Droplet" },
];

export const MEDICINE_TYPE_MAP: Record<MedicineType, MedicineTypeConfig> =
  MEDICINE_TYPES.reduce((acc, t) => { acc[t.id] = t; return acc; }, {} as Record<MedicineType, MedicineTypeConfig>);

/* ── Food Timing ── */
export const FOOD_TIMINGS: { id: FoodTiming; label: string; icon: string }[] = [
  { id: "before-food", label: "Before Food", icon: "UtensilsCrossed" },
  { id: "after-food",  label: "After Food",  icon: "Utensils" },
  { id: "with-food",   label: "With Food",   icon: "Sandwich" },
  { id: "anytime",     label: "Anytime",     icon: "Clock" },
];

/* ── Frequency ── */
export const FREQUENCIES: { id: Frequency; label: string }[] = [
  { id: "once-daily",         label: "Once Daily" },
  { id: "twice-daily",        label: "Twice Daily" },
  { id: "three-times-daily",  label: "3 Times Daily" },
  { id: "four-times-daily",   label: "4 Times Daily" },
  { id: "every-other-day",    label: "Every Other Day" },
  { id: "weekly",             label: "Weekly" },
  { id: "as-needed",          label: "As Needed" },
];

/* ── AI Health Insights (predefined educational content) ── */
export interface HealthInsight {
  id: string;
  category: MedicineCategory;
  title: string;
  subtitle: string;
  description: string;
  tips: string[];
  icon: string;
}

export const HEALTH_INSIGHTS: HealthInsight[] = [
  {
    id: "insight-vitamin-d",
    category: "vitamin",
    title: "Vitamin D",
    subtitle: "Supports bone health & immunity",
    description: "Vitamin D helps your body absorb calcium, keeping bones and teeth strong. It also plays a vital role in immune system regulation.",
    tips: ["Take after meals for better absorption", "Best taken with fat-containing foods", "Morning doses may improve sleep quality", "Avoid taking with calcium-fortified juices"],
    icon: "Sun",
  },
  {
    id: "insight-paracetamol",
    category: "pain-relief",
    title: "Paracetamol",
    subtitle: "Pain & fever relief",
    description: "Paracetamol is widely used for mild to moderate pain and fever. It works by blocking chemical messengers in the brain that signal pain.",
    tips: ["Do not exceed 4g per day for adults", "Avoid alcohol while taking it", "Can be taken with or without food", "Watch for hidden acetaminophen in cold medicines"],
    icon: "Bandage",
  },
  {
    id: "insight-metformin",
    category: "diabetes",
    title: "Metformin",
    subtitle: "Blood sugar management",
    description: "Metformin is the first-line medication for Type 2 diabetes. It improves insulin sensitivity and reduces glucose production in the liver.",
    tips: ["Take with meals to reduce stomach upset", "Stay hydrated throughout the day", "Monitor blood sugar regularly", "Report unusual muscle pain to your doctor"],
    icon: "Activity",
  },
  {
    id: "insight-amlodipine",
    category: "heart",
    title: "Amlodipine",
    subtitle: "Blood pressure control",
    description: "Amlodipine is a calcium channel blocker that relaxes blood vessels, improving blood flow and lowering blood pressure.",
    tips: ["Take at the same time each day", "Avoid grapefruit juice", "Rise slowly from sitting to prevent dizziness", "Do not stop abruptly without consulting your doctor"],
    icon: "HeartPulse",
  },
  {
    id: "insight-amoxicillin",
    category: "antibiotic",
    title: "Amoxicillin",
    subtitle: "Bacterial infection treatment",
    description: "Amoxicillin is a penicillin-type antibiotic used to treat a wide range of bacterial infections. It works by stopping bacterial cell wall synthesis.",
    tips: ["Complete the full prescribed course", "Take at evenly spaced intervals", "Can be taken with or without food", "Inform your doctor of any penicillin allergy"],
    icon: "Shield",
  },
  {
    id: "insight-cetirizine",
    category: "cold-fever",
    title: "Cetirizine",
    subtitle: "Allergy & cold relief",
    description: "Cetirizine is an antihistamine that relieves allergy symptoms such as sneezing, runny nose, and itchy eyes. It's effective for seasonal allergies.",
    tips: ["May cause drowsiness — take at bedtime if affected", "Avoid alcohol while taking", "Can be taken with or without food", "Do not exceed the recommended daily dose"],
    icon: "Thermometer",
  },
  {
    id: "insight-vitamin-c",
    category: "vitamin",
    title: "Vitamin C",
    subtitle: "Immune system support",
    description: "Vitamin C is a powerful antioxidant that supports immune function, wound healing, and collagen production for healthy skin.",
    tips: ["Take after meals to avoid stomach irritation", "Spread doses throughout the day for better absorption", "Store in a cool, dry place", "Increase intake during illness recovery"],
    icon: "Citrus",
  },
  {
    id: "insight-omeprazole",
    category: "general",
    title: "Omeprazole",
    subtitle: "Acid reflux & stomach protection",
    description: "Omeprazole reduces stomach acid production, providing relief from acid reflux and helping heal the esophagus. It's a proton pump inhibitor.",
    tips: ["Take 30 minutes before breakfast", "Avoid long-term use without supervision", "Limit caffeine and spicy foods", "Report severe diarrhea to your doctor"],
    icon: "Stethoscope",
  },
];

/* ── Status colors ── */
export const STATUS_CONFIG = {
  taken:   { label: "Taken",   color: "#22C55E", bgClass: "bg-green-50 dark:bg-green-500/10",   textClass: "text-green-600 dark:text-green-400",   icon: "Check" },
  missed:  { label: "Missed",  color: "#EF4444", bgClass: "bg-red-50 dark:bg-red-500/10",       textClass: "text-red-600 dark:text-red-400",       icon: "X" },
  skipped: { label: "Skipped", color: "#F59E0B", bgClass: "bg-amber-50 dark:bg-amber-500/10",   textClass: "text-amber-600 dark:text-amber-400",   icon: "SkipForward" },
  pending: { label: "Pending", color: "#2563EB", bgClass: "bg-blue-50 dark:bg-blue-500/10",     textClass: "text-blue-600 dark:text-blue-400",     icon: "Clock" },
  snoozed: { label: "Snoozed", color: "#8B5CF6", bgClass: "bg-violet-50 dark:bg-violet-500/10", textClass: "text-violet-600 dark:text-violet-400", icon: "Bell" },
} as const;

/* ── Adherence status tiers ── */
export function getAdherenceStatus(pct: number): { label: string; color: string; icon: string } {
  if (pct >= 85) return { label: "Excellent",          color: "#22C55E", icon: "TrendingUp" };
  if (pct >= 65) return { label: "Good",               color: "#2563EB", icon: "ThumbsUp" };
  if (pct >= 40) return { label: "Needs Improvement",  color: "#F59E0B", icon: "AlertTriangle" };
  return                { label: "Poor",                color: "#EF4444", icon: "TrendingDown" };
}
