/**
 * SettingsScreen — App settings (dark mode, language, time format, notifications).
 */

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useStore } from "@/lib/store";
import { AppHeader } from "@/components/AppHeader";
import { GlassCard } from "@/components/GlassCard";
import {
  Moon, Sun, Globe, Clock, Bell, ChevronRight,
  LogOut, Shield, HelpCircle, FileText, Info,
} from "lucide-react";
import { toast } from "sonner";

export default function SettingsScreen() {
  const navigate = useNavigate();
  const { settings, updateSettings, toggleDarkMode, logout, profile } = useStore();

  const handleLogout = () => {
    logout();
    navigate("/login");
    toast.success("Signed out");
  };

  return (
    <div>
      <AppHeader title="Settings" subtitle="Customize your experience" onBack={() => navigate("/profile")} />

      <div className="px-5 mt-3 pb-28 space-y-5">
        {/* Appearance */}
        <SettingsSection title="Appearance">
          <SettingsRow
            icon={settings.darkMode ? Moon : Sun}
            iconBg="bg-violet-500/10"
            iconColor="text-violet-500"
            label="Dark Mode"
            sublabel="Toggle dark theme"
            action={
              <Toggle
                checked={settings.darkMode}
                onChange={toggleDarkMode}
              />
            }
          />
        </SettingsSection>

        {/* Preferences */}
        <SettingsSection title="Preferences">
          <SettingsRow
            icon={Globe}
            iconBg="bg-primary/10"
            iconColor="text-primary"
            label="Language"
            sublabel="App display language"
            action={
              <Select
                value={settings.language}
                onChange={(v) => updateSettings({ language: v })}
                options={[
                  { value: "en", label: "English" },
                  { value: "es", label: "Español" },
                  { value: "fr", label: "Français" },
                  { value: "de", label: "Deutsch" },
                  { value: "hi", label: "हिन्दी" },
                  { value: "ar", label: "العربية" },
                ]}
              />
            }
          />
          <SettingsRow
            icon={Clock}
            iconBg="bg-accent/10"
            iconColor="text-accent"
            label="Time Format"
            sublabel="12-hour or 24-hour"
            action={
              <Select
                value={settings.timeFormat}
                onChange={(v) => updateSettings({ timeFormat: v as "12h" | "24h" })}
                options={[
                  { value: "12h", label: "12:00 AM" },
                  { value: "24h", label: "24:00" },
                ]}
              />
            }
          />
          <SettingsRow
            icon={Bell}
            iconBg="bg-warning/10"
            iconColor="text-warning"
            label="Notifications"
            sublabel="Reminder alerts"
            action={
              <Toggle
                checked={settings.notificationsEnabled}
                onChange={() => {
                  updateSettings({ notificationsEnabled: !settings.notificationsEnabled });
                  toast.success(`Notifications ${!settings.notificationsEnabled ? "enabled" : "disabled"}`);
                }}
              />
            }
          />
        </SettingsSection>

        {/* Account */}
        <SettingsSection title="Account">
          <SettingsRow
            icon={Shield}
            iconBg="bg-accent/10"
            iconColor="text-accent"
            label="Privacy & Security"
            sublabel="Data and privacy"
            chevron
            onClick={() => toast.info("Privacy settings coming soon")}
          />
          <SettingsRow
            icon={FileText}
            iconBg="bg-primary/10"
            iconColor="text-primary"
            label="Terms & Conditions"
            sublabel="Legal information"
            chevron
            onClick={() => toast.info("Terms coming soon")}
          />
          <SettingsRow
            icon={HelpCircle}
            iconBg="bg-violet-500/10"
            iconColor="text-violet-500"
            label="Help & Support"
            sublabel="Get assistance"
            chevron
            onClick={() => toast.info("Support coming soon")}
          />
          <SettingsRow
            icon={Info}
            iconBg="bg-muted"
            iconColor="text-muted-foreground"
            label="About MediCare AI"
            sublabel="Version 1.0.0"
            chevron
            onClick={() => toast.info("MediCare AI v1.0.0")}
          />
        </SettingsSection>

        {/* Sign out */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-danger/10 py-3.5 text-sm font-semibold text-danger"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </motion.button>

        <p className="text-center text-[10px] text-muted-foreground">
          Signed in as {profile.email}
        </p>
      </div>
    </div>
  );
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2 px-1">{title}</h3>
      <GlassCard className="divide-y divide-border/50">{children}</GlassCard>
    </div>
  );
}

function SettingsRow({
  icon: Icon, iconBg, iconColor, label, sublabel, action, chevron, onClick,
}: {
  icon: typeof Moon; iconBg: string; iconColor: string;
  label: string; sublabel: string;
  action?: React.ReactNode; chevron?: boolean; onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick && !action}
      className="w-full flex items-center gap-3 p-3.5 active:bg-muted/30 transition-colors disabled:active:bg-transparent"
    >
      <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconBg} flex-shrink-0`}>
        <Icon className={`h-4.5 w-4.5 ${iconColor}`} />
      </div>
      <div className="flex-1 text-left min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{sublabel}</p>
      </div>
      {action ?? (chevron && <ChevronRight className="h-4 w-4 text-muted-foreground" />)}
    </button>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative h-7 w-12 rounded-full transition-colors ${checked ? "bg-primary" : "bg-muted"}`}
    >
      <motion.div
        className="absolute top-1 h-5 w-5 rounded-full bg-white shadow-md"
        animate={{ left: checked ? 24 : 4 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </button>
  );
}

function Select({
  value, onChange, options,
}: {
  value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-muted/50 dark:bg-slate-800/60 border border-border rounded-lg px-2.5 py-1.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}
