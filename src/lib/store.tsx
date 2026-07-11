/**
 * MediCare AI — Central Application Store
 * Context provider with localStorage persistence.
 * Manages auth, medicines, logs, notifications, profile, and settings.
 */

import { createContext, useContext, useEffect, useState, useCallback, useMemo, type ReactNode } from "react";
import type { Medicine, MedicationLog, NotificationItem, Profile, AppSettings, AuthUser, LogStatus } from "./types";
import { SEED_MEDICINES, generateSeedLogs, SEED_NOTIFICATIONS, SEED_PROFILE } from "./seed-data";
import { uid, todayISO, calculateAdherence, calculateStreak, getInventoryPercentage, isLowStock } from "./helpers";

const STORAGE_KEY = "medicare-ai-state-v1";

interface PersistedState {
  auth: AuthUser | null;
  hasOnboarded: boolean;
  medicines: Medicine[];
  logs: MedicationLog[];
  notifications: NotificationItem[];
  profile: Profile;
  settings: AppSettings;
}

const DEFAULT_STATE: PersistedState = {
  auth: null,
  hasOnboarded: false,
  medicines: SEED_MEDICINES,
  logs: generateSeedLogs(),
  notifications: SEED_NOTIFICATIONS,
  profile: SEED_PROFILE,
  settings: {
    darkMode: false,
    language: "en",
    timeFormat: "12h",
    notificationsEnabled: true,
  },
};

function loadState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as PersistedState;
    // Merge with defaults to ensure new fields exist
    return {
      ...DEFAULT_STATE,
      ...parsed,
      settings: { ...DEFAULT_STATE.settings, ...parsed.settings },
      profile: { ...DEFAULT_STATE.profile, ...parsed.profile },
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function saveState(state: PersistedState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage may be full or unavailable — silently ignore
  }
}

interface StoreValue extends PersistedState {
  /* Auth */
  login: (email: string, name?: string) => void;
  register: (name: string, email: string) => void;
  logout: () => void;
  completeOnboarding: () => void;

  /* Medicines CRUD */
  addMedicine: (med: Omit<Medicine, "id" | "createdAt">) => void;
  updateMedicine: (id: string, updates: Partial<Medicine>) => void;
  deleteMedicine: (id: string) => void;

  /* Medication logs */
  markLogStatus: (medicineId: string, time: string, status: LogStatus) => void;
  snoozeLog: (medicineId: string, time: string) => void;
  getLog: (medicineId: string, time: string, date?: string) => MedicationLog | undefined;

  /* Notifications */
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (notif: Omit<NotificationItem, "id" | "isRead">) => void;

  /* Profile */
  updateProfile: (updates: Partial<Profile>) => void;

  /* Settings */
  updateSettings: (updates: Partial<AppSettings>) => void;
  toggleDarkMode: () => void;

  /* Derived data */
  todaySchedule: ReturnType<typeof getTodayScheduleProxy>;
  adherence: ReturnType<typeof calculateAdherence>;
  streak: number;
  lowStockMeds: Medicine[];
}

// Helper type proxy to avoid circular import
function getTodayScheduleProxy() { return []; }

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(() => {
    // Avoid SSR issues — check window
    if (typeof window === "undefined") return DEFAULT_STATE;
    return loadState();
  });

  // Persist on change
  useEffect(() => { saveState(state); }, [state]);

  // Apply dark mode class
  useEffect(() => {
    const root = document.documentElement;
    if (state.settings.darkMode) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [state.settings.darkMode]);

  /* ── Auth actions ── */
  const login = useCallback((email: string, name?: string) => {
    setState((s) => ({
      ...s,
      auth: { id: uid("user"), email, name: name ?? s.profile.name },
    }));
  }, []);

  const register = useCallback((name: string, email: string) => {
    setState((s) => ({
      ...s,
      auth: { id: uid("user"), name, email },
      profile: { ...s.profile, name, email },
    }));
  }, []);

  const logout = useCallback(() => {
    setState((s) => ({ ...s, auth: null }));
  }, []);

  const completeOnboarding = useCallback(() => {
    setState((s) => ({ ...s, hasOnboarded: true }));
  }, []);

  /* ── Medicine CRUD ── */
  const addMedicine = useCallback((med: Omit<Medicine, "id" | "createdAt">) => {
    const newMed: Medicine = {
      ...med,
      id: uid("med"),
      createdAt: new Date().toISOString(),
    };
    setState((s) => ({ ...s, medicines: [...s.medicines, newMed] }));

    // Add notification
    setState((s) => ({
      ...s,
      notifications: [
        {
          id: uid("notif"),
          type: "info",
          title: "Medicine Added",
          body: `${newMed.name} (${newMed.dosage}) has been added to your list.`,
          medicineName: newMed.name,
          time: new Date().toISOString(),
          isRead: false,
        },
        ...s.notifications,
      ],
    }));
  }, []);

  const updateMedicine = useCallback((id: string, updates: Partial<Medicine>) => {
    setState((s) => ({
      ...s,
      medicines: s.medicines.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    }));
  }, []);

  const deleteMedicine = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      medicines: s.medicines.filter((m) => m.id !== id),
    }));
  }, []);

  /* ── Medication logs ── */
  const markLogStatus = useCallback((medicineId: string, time: string, status: LogStatus) => {
    const today = todayISO();
    setState((s) => {
      const existingIdx = s.logs.findIndex(
        (l) => l.medicineId === medicineId && l.time === time && l.date === today
      );
      const med = s.medicines.find((m) => m.id === medicineId);
      if (!med) return s;

      let newLogs: MedicationLog[];
      if (existingIdx >= 0) {
        newLogs = [...s.logs];
        newLogs[existingIdx] = {
          ...newLogs[existingIdx],
          status,
          takenAt: status === "taken" ? new Date().toISOString() : null,
        };
      } else {
        newLogs = [
          ...s.logs,
          {
            id: uid("log"),
            medicineId,
            medicineName: med.name,
            date: today,
            time,
            status,
            takenAt: status === "taken" ? new Date().toISOString() : null,
            snoozedCount: 0,
          },
        ];
      }

      // Reduce inventory when taken
      let medicines = s.medicines;
      if (status === "taken") {
        medicines = s.medicines.map((m) =>
          m.id === medicineId
            ? { ...m, remainingQuantity: Math.max(0, m.remainingQuantity - 1) }
            : m
        );

        // Check for low stock notification
        const updatedMed = medicines.find((m) => m.id === medicineId);
        const wasLow = isLowStock(med);
        const isLowNow = updatedMed ? isLowStock(updatedMed) : false;
        if (!wasLow && isLowNow && updatedMed) {
          newLogs = newLogs; // no-op to keep TS happy
          const lowNotif: NotificationItem = {
            id: uid("notif"),
            type: "low-stock",
            title: "Low Stock Alert",
            body: `${updatedMed.name} is running low — only ${updatedMed.remainingQuantity} ${updatedMed.type === "syrup" ? "doses" : "tablets"} left!`,
            medicineName: updatedMed.name,
            time: new Date().toISOString(),
            isRead: false,
          };
          return { ...s, logs: newLogs, medicines, notifications: [lowNotif, ...s.notifications] };
        }
      }

      // Add notification for the action
      const actionNotif: NotificationItem = {
        id: uid("notif"),
        type: status === "taken" ? "reminder" : status === "missed" ? "missed" : "info",
        title: status === "taken" ? "Medication Taken" : status === "missed" ? "Medication Missed" : "Medication Skipped",
        body: `${med.name} (${med.dosage}) marked as ${status} at ${time}`,
        medicineName: med.name,
        time: new Date().toISOString(),
        isRead: false,
      };

      return { ...s, logs: newLogs, medicines, notifications: [actionNotif, ...s.notifications] };
    });
  }, []);

  const snoozeLog = useCallback((medicineId: string, time: string) => {
    const today = todayISO();
    setState((s) => {
      const existingIdx = s.logs.findIndex(
        (l) => l.medicineId === medicineId && l.time === time && l.date === today
      );
      const med = s.medicines.find((m) => m.id === medicineId);
      if (!med) return s;

      let newLogs: MedicationLog[];
      if (existingIdx >= 0) {
        newLogs = [...s.logs];
        newLogs[existingIdx] = {
          ...newLogs[existingIdx],
          status: "snoozed",
          snoozedCount: newLogs[existingIdx].snoozedCount + 1,
        };
      } else {
        newLogs = [
          ...s.logs,
          {
            id: uid("log"),
            medicineId,
            medicineName: med.name,
            date: today,
            time,
            status: "snoozed",
            takenAt: null,
            snoozedCount: 1,
          },
        ];
      }
      return { ...s, logs: newLogs };
    });
  }, []);

  const getLog = useCallback((medicineId: string, time: string, date?: string) => {
    const d = date ?? todayISO();
    return state.logs.find((l) => l.medicineId === medicineId && l.time === time && l.date === d);
  }, [state.logs]);

  /* ── Notifications ── */
  const markNotificationRead = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    }));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setState((s) => ({
      ...s,
      notifications: s.notifications.map((n) => ({ ...n, isRead: true })),
    }));
  }, []);

  const addNotification = useCallback((notif: Omit<NotificationItem, "id" | "isRead">) => {
    setState((s) => ({
      ...s,
      notifications: [{ ...notif, id: uid("notif"), isRead: false }, ...s.notifications],
    }));
  }, []);

  /* ── Profile ── */
  const updateProfile = useCallback((updates: Partial<Profile>) => {
    setState((s) => ({ ...s, profile: { ...s.profile, ...updates } }));
  }, []);

  /* ── Settings ── */
  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setState((s) => ({ ...s, settings: { ...s.settings, ...updates } }));
  }, []);

  const toggleDarkMode = useCallback(() => {
    setState((s) => ({ ...s, settings: { ...s.settings, darkMode: !s.settings.darkMode } }));
  }, []);

  /* ── Derived data ── */
  const todaySchedule = useMemo(() => {
    const activeMeds = state.medicines.filter((m) => m.isActive);
    const today = todayISO();
    const todayLogs = state.logs.filter((l) => l.date === today);
    const logMap = new Map<string, typeof todayLogs[number]>(todayLogs.map((l) => [`${l.medicineId}-${l.time}`, l] as const));

    const items = activeMeds.flatMap((med) =>
      med.reminderTimes.map((time) => ({
        medicine: med,
        time,
        log: logMap.get(`${med.id}-${time}`),
        status: (logMap.get(`${med.id}-${time}`)?.status ?? "pending") as LogStatus,
      }))
    );
    return items.sort((a, b) => a.time.localeCompare(b.time));
  }, [state.medicines, state.logs]);

  const adherence = useMemo(() => calculateAdherence(state.logs), [state.logs]);
  const streak = useMemo(() => calculateStreak(state.logs), [state.logs]);
  const lowStockMeds = useMemo(() => state.medicines.filter((m) => isLowStock(m)), [state.medicines]);

  const value: StoreValue = {
    ...state,
    login, register, logout, completeOnboarding,
    addMedicine, updateMedicine, deleteMedicine,
    markLogStatus, snoozeLog, getLog,
    markNotificationRead, markAllNotificationsRead, addNotification,
    updateProfile, updateSettings, toggleDarkMode,
    todaySchedule, adherence, streak, lowStockMeds,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
