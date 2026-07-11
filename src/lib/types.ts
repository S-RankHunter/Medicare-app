/**
 * MediCare AI — Domain Types
 * Central type definitions for the entire application.
 */

export type MedicineType = "tablet" | "capsule" | "syrup" | "injection" | "drops";

export type MedicineCategory =
  | "heart"
  | "diabetes"
  | "vitamin"
  | "pain-relief"
  | "cold-fever"
  | "antibiotic"
  | "general";

export type FoodTiming = "before-food" | "after-food" | "with-food" | "anytime";

export type Frequency = "once-daily" | "twice-daily" | "three-times-daily" | "four-times-daily" | "every-other-day" | "weekly" | "as-needed";

export type LogStatus = "taken" | "missed" | "skipped" | "pending" | "snoozed";

export type NotificationType = "reminder" | "low-stock" | "missed" | "info";

export interface Medicine {
  id: string;
  name: string;
  type: MedicineType;
  category: MedicineCategory;
  dosage: string;
  foodTiming: FoodTiming;
  startDate: string;       // ISO date
  endDate: string | null;  // ISO date or null for ongoing
  frequency: Frequency;
  reminderTimes: string[]; // ["07:00", "13:00", "20:00"]
  remainingQuantity: number;
  initialQuantity: number;
  notes: string;
  imageUrl: string | null;
  createdAt: string;
  isActive: boolean;
}

export interface MedicationLog {
  id: string;
  medicineId: string;
  medicineName: string;
  date: string;    // ISO date YYYY-MM-DD
  time: string;    // "07:00"
  status: LogStatus;
  takenAt: string | null; // ISO timestamp when action performed
  snoozedCount: number;
}

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  medicineName: string;
  time: string;       // ISO timestamp
  isRead: boolean;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
}

export interface Profile {
  name: string;
  email: string;
  avatarUrl: string | null;
  age: number;
  weight: number;       // kg
  bloodGroup: string;
  doctor: string;
  hospital: string;
  emergencyNotes: string;
  emergencyContacts: EmergencyContact[];
}

export interface AppSettings {
  darkMode: boolean;
  language: string;
  timeFormat: "12h" | "24h";
  notificationsEnabled: boolean;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}
