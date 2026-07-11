/**
 * ProfileScreen — User profile with health info and navigation to sub-pages.
 */

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useStore } from "@/lib/store";
import { AppHeader } from "@/components/AppHeader";
import { GlassCard } from "@/components/GlassCard";
import { ProgressRing } from "@/components/ProgressRing";
import {
  User, Settings, Bell, Activity, LogOut, ChevronRight,
  Phone, Hospital, Stethoscope, Droplet, Weight, Calendar,
  Moon, Sparkles, Shield,
} from "lucide-react";

export default function ProfileScreen() {
  const navigate = useNavigate();
  const { profile, adherence, logout, settings } = useStore();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const healthInfo = [
    { icon: Calendar, label: "Age",          value: `${profile.age} years` },
    { icon: Weight,  label: "Weight",       value: `${profile.weight} kg` },
    { icon: Droplet, label: "Blood Group",  value: profile.bloodGroup },
    { icon: Stethoscope, label: "Doctor",   value: profile.doctor },
    { icon: Hospital,    label: "Hospital", value: profile.hospital },
  ];

  const menuItems = [
    { icon: Activity,  label: "AI Health Insights",    path: "/insights",     color: "text-violet-500", bg: "bg-violet-500/10" },
    { icon: Bell,      label: "Notifications",         path: "/notifications", color: "text-primary",    bg: "bg-primary/10" },
    { icon: Settings,  label: "Settings",              path: "/settings",     color: "text-slate-600",  bg: "bg-slate-500/10" },
  ];

  return (
    <div>
      <AppHeader
        title="Profile"
        right={
          <button onClick={() => navigate("/settings")} className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted active:scale-90 transition-transform">
            <Settings className="h-4.5 w-4.5 text-foreground" />
          </button>
        }
      />

      <div className="px-5 mt-3 pb-28">
        {/* Profile header card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard variant="glass-strong" className="p-5 relative overflow-hidden">
            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/5 blur-2xl" />
            <div className="relative flex items-center gap-4">
              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-accent text-white text-2xl font-bold shadow-lg shadow-primary/25">
                  {profile.avatarUrl ? (
                    <img src={profile.avatarUrl} alt={profile.name} className="h-full w-full rounded-3xl object-cover" />
                  ) : (
                    profile.name.charAt(0).toUpperCase()
                  )}
                </div>
                <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-accent ring-2 ring-white dark:ring-slate-800">
                  <Shield className="h-3 w-3 text-white" />
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-foreground truncate">{profile.name}</h2>
                <p className="text-sm text-muted-foreground truncate">{profile.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-[10px] font-semibold text-accent">
                    Verified
                  </span>
                  <span className="text-xs text-muted-foreground">{profile.bloodGroup}</span>
                </div>
              </div>
            </div>

            {/* Adherence mini */}
            <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-around">
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">{adherence.percentage}%</p>
                <p className="text-[10px] text-muted-foreground">Adherence</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">{adherence.taken}</p>
                <p className="text-[10px] text-muted-foreground">Taken</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">{profile.emergencyContacts.length}</p>
                <p className="text-[10px] text-muted-foreground">Contacts</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Health Info */}
        <div className="mt-4">
          <h3 className="text-sm font-bold text-foreground mb-2.5">Health Information</h3>
          <GlassCard className="divide-y divide-border/50">
            {healthInfo.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center gap-3 p-3.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span className="text-sm text-muted-foreground flex-1">{item.label}</span>
                  <span className="text-sm font-semibold text-foreground">{item.value}</span>
                </div>
              );
            })}
          </GlassCard>
        </div>

        {/* Emergency contacts */}
        <div className="mt-4">
          <h3 className="text-sm font-bold text-foreground mb-2.5">Emergency Contacts</h3>
          <GlassCard className="divide-y divide-border/50">
            {profile.emergencyContacts.map((contact) => (
              <div key={contact.id} className="flex items-center gap-3 p-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-danger/10">
                  <Phone className="h-4.5 w-4.5 text-danger" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{contact.name}</p>
                  <p className="text-xs text-muted-foreground">{contact.relationship} · {contact.phone}</p>
                </div>
              </div>
            ))}
          </GlassCard>
        </div>

        {/* Emergency Notes */}
        {profile.emergencyNotes && (
          <div className="mt-4">
            <GlassCard className="p-4 bg-warning/5 dark:bg-warning/10 border-warning/20">
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-foreground mb-1">Emergency Notes</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{profile.emergencyNotes}</p>
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        {/* Menu */}
        <div className="mt-4">
          <h3 className="text-sm font-bold text-foreground mb-2.5">More</h3>
          <GlassCard className="divide-y divide-border/50">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  className="w-full flex items-center gap-3 p-3.5 active:bg-muted/50 transition-colors"
                >
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${item.bg}`}>
                    <Icon className={`h-4.5 w-4.5 ${item.color}`} />
                  </div>
                  <span className="text-sm font-medium text-foreground flex-1 text-left">{item.label}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              );
            })}
          </GlassCard>
        </div>

        {/* Logout */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleLogout}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-danger/10 py-3.5 text-sm font-semibold text-danger active:scale-[0.98] transition-transform"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </motion.button>

        <p className="text-center text-[10px] text-muted-foreground mt-4">
          MediCare AI v1.0.0 · Made with care
        </p>
      </div>
    </div>
  );
}
