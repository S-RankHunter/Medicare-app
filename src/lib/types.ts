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

export type PrescriptionType = "image" | "pdf";

export interface Prescription {
  id: string;
  title: string;
  doctorName: string;
  hospitalName: string;
  date: string;           // ISO date
  expiryDate: string | null;
  fileUrl: string;        // base64 data URL
  fileType: PrescriptionType;
  fileName: string;
  notes: string;
  medicineName: string;
  createdAt: string;
}

export interface Medicine {
  id: string;
  name: string;
  type: MedicineType;
  category: MedicineCategory;
  dosage: string;
  foodTiming: FoodTiming;
  startDate: string;
  endDate: string | null;
  frequency: Frequency;
  reminderTimes: string[];
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
  date: string;
  time: string;
  status: LogStatus;
  takenAt: string | null;
  snoozedCount: number;
}

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  medicineName: string;
  time: string;
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
  weight: number;
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