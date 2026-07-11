/**
 * MediCare AI — Seed Data
 * Generates realistic initial data for demo/onboarding.
 */

import type { Medicine, MedicationLog, NotificationItem, Profile, EmergencyContact } from "./types";

const today = new Date();
const isoDate = (d: Date) => d.toISOString().split("T")[0];
const daysAgo = (n: number) => { const d = new Date(today); d.setDate(d.getDate() - n); return d; };
const daysAhead = (n: number) => { const d = new Date(today); d.setDate(d.getDate() + n); return d; };
const tsAt = (d: Date, time: string) => {
  const [h, m] = time.split(":").map(Number);
  const dt = new Date(d); dt.setHours(h, m, 0, 0);
  return dt.toISOString();
};

export const SEED_MEDICINES: Medicine[] = [
  {
    id: "med-1",
    name: "Vitamin D3",
    type: "capsule",
    category: "vitamin",
    dosage: "1000 IU",
    foodTiming: "after-food",
    startDate: isoDate(daysAgo(30)),
    endDate: null,
    frequency: "once-daily",
    reminderTimes: ["08:00"],
    remainingQuantity: 22,
    initialQuantity: 30,
    notes: "Take with a meal containing fats for better absorption.",
    imageUrl: null,
    createdAt: tsAt(daysAgo(30), "09:00"),
    isActive: true,
  },
  {
    id: "med-2",
    name: "Metformin",
    type: "tablet",
    category: "diabetes",
    dosage: "500 mg",
    foodTiming: "after-food",
    startDate: isoDate(daysAgo(60)),
    endDate: null,
    frequency: "twice-daily",
    reminderTimes: ["07:30", "19:30"],
    remainingQuantity: 48,
    initialQuantity: 60,
    notes: "Monitor blood sugar levels regularly.",
    imageUrl: null,
    createdAt: tsAt(daysAgo(60), "09:00"),
    isActive: true,
  },
  {
    id: "med-3",
    name: "Amlodipine",
    type: "tablet",
    category: "heart",
    dosage: "5 mg",
    foodTiming: "anytime",
    startDate: isoDate(daysAgo(45)),
    endDate: null,
    frequency: "once-daily",
    reminderTimes: ["07:00"],
    remainingQuantity: 14,
    initialQuantity: 30,
    notes: "Take at the same time each day. Avoid grapefruit juice.",
    imageUrl: null,
    createdAt: tsAt(daysAgo(45), "09:00"),
    isActive: true,
  },
  {
    id: "med-4",
    name: "Paracetamol",
    type: "tablet",
    category: "pain-relief",
    dosage: "500 mg",
    foodTiming: "after-food",
    startDate: isoDate(daysAgo(7)),
    endDate: isoDate(daysAhead(7)),
    frequency: "three-times-daily",
    reminderTimes: ["08:00", "14:00", "20:00"],
    remainingQuantity: 8,
    initialQuantity: 20,
    notes: "Do not exceed 4g in 24 hours.",
    imageUrl: null,
    createdAt: tsAt(daysAgo(7), "09:00"),
    isActive: true,
  },
  {
    id: "med-5",
    name: "Vitamin C",
    type: "tablet",
    category: "vitamin",
    dosage: "500 mg",
    foodTiming: "after-food",
    startDate: isoDate(daysAgo(20)),
    endDate: null,
    frequency: "once-daily",
    reminderTimes: ["13:00"],
    remainingQuantity: 3,
    initialQuantity: 30,
    notes: "Boosts immunity. Take after meals.",
    imageUrl: null,
    createdAt: tsAt(daysAgo(20), "09:00"),
    isActive: true,
  },
  {
    id: "med-6",
    name: "Calcium",
    type: "tablet",
    category: "vitamin",
    dosage: "600 mg",
    foodTiming: "with-food",
    startDate: isoDate(daysAgo(15)),
    endDate: null,
    frequency: "once-daily",
    reminderTimes: ["20:00"],
    remainingQuantity: 28,
    initialQuantity: 30,
    notes: "Take with Vitamin D for better absorption.",
    imageUrl: null,
    createdAt: tsAt(daysAgo(15), "09:00"),
    isActive: true,
  },
];

/**
 * Generate 14 days of medication logs for all medicines.
 */
export function generateSeedLogs(): MedicationLog[] {
  const logs: MedicationLog[] = [];
  let id = 1;

  for (let dayOffset = 13; dayOffset >= 0; dayOffset--) {
    const d = daysAgo(dayOffset);
    const dateStr = isoDate(d);

    for (const med of SEED_MEDICINES) {
      for (const time of med.reminderTimes) {
        // Today: only past times are completed
        if (dayOffset === 0) {
          const [h, m] = time.split(":").map(Number);
          const logTime = new Date(d); logTime.setHours(h, m, 0, 0);
          const now = new Date();
          if (logTime > now) continue; // future - not logged yet

          const minutesAgo = (now.getTime() - logTime.getTime()) / 60000;
          let status: MedicationLog["status"] = "pending";
          if (minutesAgo > 60 && Math.random() > 0.2) status = "taken";
          else if (minutesAgo > 120 && Math.random() > 0.6) status = "missed";

          logs.push({
            id: `log-${id++}`,
            medicineId: med.id,
            medicineName: med.name,
            date: dateStr,
            time,
            status,
            takenAt: status === "taken" ? tsAt(d, time) : null,
            snoozedCount: 0,
          });
        } else {
          // Past days: mostly taken with some missed/skipped
          const rand = Math.random();
          let status: MedicationLog["status"];
          if (rand > 0.85) status = "missed";
          else if (rand > 0.75) status = "skipped";
          else status = "taken";

          logs.push({
            id: `log-${id++}`,
            medicineId: med.id,
            medicineName: med.name,
            date: dateStr,
            time,
            status,
            takenAt: status === "taken" ? tsAt(d, time) : null,
            snoozedCount: 0,
          });
        }
      }
    }
  }

  return logs;
}

export const SEED_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    type: "reminder",
    title: "Medication Reminder",
    body: "Time to take Amlodipine (5 mg)",
    medicineName: "Amlodipine",
    time: tsAt(new Date(), "07:00"),
    isRead: false,
  },
  {
    id: "notif-2",
    type: "reminder",
    title: "Medication Reminder",
    body: "Time to take Metformin (500 mg)",
    medicineName: "Metformin",
    time: tsAt(new Date(), "07:30"),
    isRead: false,
  },
  {
    id: "notif-3",
    type: "low-stock",
    title: "Low Stock Alert",
    body: "Vitamin C is running low — only 3 tablets left!",
    medicineName: "Vitamin C",
    time: tsAt(daysAgo(1), "10:00"),
    isRead: true,
  },
  {
    id: "notif-4",
    type: "reminder",
    title: "Medication Reminder",
    body: "Time to take Vitamin D3 (1000 IU)",
    medicineName: "Vitamin D3",
    time: tsAt(daysAgo(1), "08:00"),
    isRead: true,
  },
  {
    id: "notif-5",
    type: "missed",
    title: "Missed Medication",
    body: "You missed Calcium at 20:00 yesterday",
    medicineName: "Calcium",
    time: tsAt(daysAgo(1), "20:30"),
    isRead: false,
  },
  {
    id: "notif-6",
    type: "reminder",
    title: "Medication Reminder",
    body: "Time to take Paracetamol (500 mg)",
    medicineName: "Paracetamol",
    time: tsAt(daysAgo(2), "14:00"),
    isRead: true,
  },
];

const SEED_CONTACTS: EmergencyContact[] = [
  { id: "ec-1", name: "Sarah Augustine", relationship: "Spouse",  phone: "+1 555 0100" },
  { id: "ec-2", name: "Dr. James Wilson", relationship: "Doctor",  phone: "+1 555 0142" },
];

export const SEED_PROFILE: Profile = {
  name: "Augustine",
  email: "augustine@medicare.ai",
  avatarUrl: null,
  age: 34,
  weight: 72,
  bloodGroup: "O+",
  doctor: "Dr. James Wilson",
  hospital: "St. Mary's Medical Center",
  emergencyNotes: "No known drug allergies. On blood pressure medication.",
  emergencyContacts: SEED_CONTACTS,
};
