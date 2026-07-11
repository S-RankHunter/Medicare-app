/**
 * MediCare AI — Utility Helpers
 * Date formatting, adherence calc, inventory helpers, ID generation.
 */

import type { MedicationLog, Medicine, LogStatus } from "./types";
import { getAdherenceStatus } from "./constants";

/** Generate a short unique ID. */
export function uid(prefix = "id"): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Format time string "07:00" → "7:00 AM" / "07:00" based on 12h/24h. */
export function formatTime(time: string, format: "12h" | "24h" = "12h"): string {
  const [h, m] = time.split(":").map(Number);
  if (format === "24h") return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

/** ISO date → readable "Mon, Jul 11" */
export function formatDate(iso: string, opts?: Intl.DateTimeFormatOptions): string {
  const d = new Date(iso + (iso.length === 10 ? "T00:00:00" : ""));
  return d.toLocaleDateString("en-US", opts ?? { weekday: "short", month: "short", day: "numeric" });
}

/** Full date "Monday, July 11, 2026" */
export function formatDateFull(iso: string): string {
  const d = new Date(iso + (iso.length === 10 ? "T00:00:00" : ""));
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

/** Get today's ISO date. */
export function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

/** Get ISO date for a Date object. */
export function toISODate(d: Date): string {
  return d.toISOString().split("T")[0];
}

/** Check if a date is today. */
export function isToday(iso: string): boolean {
  return iso === todayISO();
}

/** Check if a date is in the future. */
export function isFuture(iso: string): boolean {
  return iso > todayISO();
}

/** Relative time "2h ago", "just now" */
export function timeAgo(isoTimestamp: string): string {
  const diff = Date.now() - new Date(isoTimestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(isoTimestamp);
}

/* ── Adherence calculations ── */

export interface AdherenceResult {
  percentage: number;
  taken: number;
  total: number;
  missed: number;
  skipped: number;
  status: { label: string; color: string; icon: string };
}

/** Calculate adherence from logs (optionally filtered by date range). */
export function calculateAdherence(logs: MedicationLog[], fromISO?: string, toISO?: string): AdherenceResult {
  const filtered = logs.filter((l) => {
    if (l.status === "pending" || l.status === "snoozed") return false;
    if (fromISO && l.date < fromISO) return false;
    if (toISO && l.date > toISO) return false;
    return true;
  });

  const total = filtered.length;
  const taken = filtered.filter((l) => l.status === "taken").length;
  const missed = filtered.filter((l) => l.status === "missed").length;
  const skipped = filtered.filter((l) => l.status === "skipped").length;
  const percentage = total === 0 ? 0 : Math.round((taken / total) * 100);

  return { percentage, taken, total, missed, skipped, status: getAdherenceStatus(percentage) };
}

/** Calculate current streak of consecutive days with 100% adherence (all taken, no missed). */
export function calculateStreak(logs: MedicationLog[]): number {
  if (logs.length === 0) return 0;

  // Group by date
  const byDate = new Map<string, MedicationLog[]>();
  for (const log of logs) {
    if (log.status === "pending" || log.status === "snoozed") continue;
    const arr = byDate.get(log.date) ?? [];
    arr.push(log);
    byDate.set(log.date, arr);
  }

  const dates = Array.from(byDate.keys()).sort().reverse();
  let streak = 0;

  for (const date of dates) {
    const dayLogs = byDate.get(date)!;
    const allTaken = dayLogs.length > 0 && dayLogs.every((l) => l.status === "taken" || l.status === "skipped");
    if (allTaken) streak++;
    else break;
  }

  return streak;
}

/* ── Inventory helpers ── */

export function getInventoryPercentage(med: Medicine): number {
  if (med.initialQuantity === 0) return 0;
  return Math.round((med.remainingQuantity / med.initialQuantity) * 100);
}

export function isLowStock(med: Medicine): boolean {
  return med.remainingQuantity <= Math.ceil(med.initialQuantity * 0.2);
}

export function isCriticalStock(med: Medicine): boolean {
  return med.remainingQuantity <= Math.ceil(med.initialQuantity * 0.1);
}

/* ── Today's scheduled items ── */

export interface ScheduledItem {
  medicine: Medicine;
  time: string;
  log?: MedicationLog;
  status: LogStatus;
}

/** Get today's scheduled medication items sorted by time. */
export function getTodaySchedule(medicines: Medicine[], logs: MedicationLog[]): ScheduledItem[] {
  const today = todayISO();
  const activeMeds = medicines.filter((m) => m.isActive);
  const todayLogs = logs.filter((l) => l.date === today);
  const logMap = new Map<string, MedicationLog>(todayLogs.map((l) => [`${l.medicineId}-${l.time}`, l] as const));

  const items: ScheduledItem[] = [];
  for (const med of activeMeds) {
    for (const time of med.reminderTimes) {
      const log = logMap.get(`${med.id}-${time}`);
      items.push({
        medicine: med,
        time,
        log,
        status: log?.status ?? "pending",
      });
    }
  }

  return items.sort((a, b) => a.time.localeCompare(b.time));
}

/** Get the next upcoming scheduled item for today. */
export function getNextReminder(items: ScheduledItem[]): ScheduledItem | null {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  return items.find((item) => {
    if (item.status === "taken" || item.status === "skipped") return false;
    const [h, m] = item.time.split(":").map(Number);
    return h * 60 + m >= currentMinutes;
  }) ?? null;
}
