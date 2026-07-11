/**
 * Dynamic Lucide icon resolver — maps string names to components.
 */

import {
  HeartPulse, Activity, Pill, Bandage, Thermometer, Shield, Stethoscope,
  Tablets, Droplets, Droplet, Syringe, UtensilsCrossed, Utensils, Sandwich, Clock,
  Home, Calendar, BarChart3, User, Plus, Bell, Check, X, SkipForward,
  TrendingUp, TrendingDown, ThumbsUp, AlertTriangle, Sun, Citrus,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  HeartPulse, Activity, Pill, Bandage, Thermometer, Shield, Stethoscope,
  Capsule: Tablets, Droplets, Droplet, Syringe, UtensilsCrossed, Utensils, Sandwich, Clock,
  Home, Calendar, BarChart3, User, Plus, Bell, Check, X, SkipForward,
  TrendingUp, TrendingDown, ThumbsUp, AlertTriangle, Sun, Citrus,
};

export function getIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? Pill;
}
