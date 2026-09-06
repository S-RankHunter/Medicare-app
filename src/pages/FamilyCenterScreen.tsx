/**
 * FamilyCenterScreen — Add and manage family members.
 * Simulates sending notifications when medicine is missed.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";
import { AppHeader } from "@/components/AppHeader";
import {
  Users, Plus, Trash2, X, Phone,
  Bell, BellOff, Clock, Pill, CheckCircle2, AlertCircle
} from "lucide-react";

export default function FamilyCenterScreen() {
  const navigate = useNavigate();
  const {
    familyMembers, familyAlerts, profile,
    addFamilyMember, deleteFamilyMember, updateFamilyMember,
    markFamilyAlertRead, markAllFamilyAlertsRead,
  } = useStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"members" | "alerts">("members");
  const [form, setForm] = useState({
    name: "",
    relationship: "",
    phone: "",
    email: "",
    notificationsEnabled: true,
  });

  const unreadAlerts = familyAlerts.filter((a) => !a.isRead).length;

  const handleSubmit = () => {
    if (!form.name || !form.relationship) return;
    addFamilyMember({
      name: form.name,
      relationship: form.relationship,
      phone: form.phone,
      email: form.email,
      notificationsEnabled: form.notificationsEnabled,
    });
    setShowAddModal(false);
    setForm({ name: "", relationship: "", phone: "", email: "", notificationsEnabled: true });
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString("en-US", {
      month: "short", day: "numeric",
      hour: "numeric", minute: "2-digit", hour12: true,
    });
  };

  const RELATIONSHIPS = ["Spouse", "Parent", "Child", "Sibling", "Friend", "Caregiver", "Other"];

  return (
    <div>
      <AppHeader
        title="Family Center"
        onBack={() => navigate(-1)}
        right={
          <button
            onClick={() => setShowAddModal(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary active:scale-90 transition-transform"
          >
            <Plus className="h-5 w-5 text-white" />
          </button>
        }
      />

      <div className="px-4 mt-3 pb-28">

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-4 mb-4 border border-primary/20"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 flex-shrink-0">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">How Family Center Works</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                If <span className="font-semibold text-primary">{profile.name}</span> doesn't confirm taking a medicine within 30 minutes, added family members will receive an alert notification inside the app.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab("members")}
            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all ${
              activeTab === "members"
                ? "bg-primary text-white shadow-sm"
                : "glass text-muted-foreground"
            }`}
          >
            Members ({familyMembers.length})
          </button>
          <button
            onClick={() => { setActiveTab("alerts"); markAllFamilyAlertsRead(); }}
            className={`flex-1 relative rounded-xl py-2.5 text-sm font-semibold transition-all ${
              activeTab === "alerts"
                ? "bg-primary text-white shadow-sm"
                : "glass text-muted-foreground"
            }`}
          >
            Alerts
            {unreadAlerts > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">
                {unreadAlerts}
              </span>
            )}
          </button>
        </div>

        {/* Members Tab */}
        {activeTab === "members" && (
          <div className="space-y-3">
            {familyMembers.length === 0 && (
              <div className="flex flex-col items-center justify-center glass rounded-2xl p-10 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-base font-bold text-foreground mb-1">No Family Members Yet</h3>
                <p className="text-sm text-muted-foreground mb-4">Add family members to keep them informed about your medication schedule</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white"
                >
                  Add Family Member
                </button>
              </div>
            )}

            {familyMembers.map((member, i) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-2xl p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-primary text-white text-lg font-bold">
                    {member.avatarInitial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.relationship}</p>
                    {member.phone && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Phone className="h-3 w-3" /> {member.phone}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateFamilyMember(member.id, { notificationsEnabled: !member.notificationsEnabled })}
                      className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
                        member.notificationsEnabled ? "bg-primary/10" : "bg-muted"
                      }`}
                    >
                      {member.notificationsEnabled
                        ? <Bell className="h-4 w-4 text-primary" />
                        : <BellOff className="h-4 w-4 text-muted-foreground" />
                      }
                    </button>
                    <button
                      onClick={() => deleteFamilyMember(member.id)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-danger/10"
                    >
                      <Trash2 className="h-4 w-4 text-danger" />
                    </button>
                  </div>
                </div>
                <div className={`mt-3 flex items-center gap-2 rounded-xl px-3 py-2 ${
                  member.notificationsEnabled ? "bg-primary/5" : "bg-muted/50"
                }`}>
                  {member.notificationsEnabled ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                      <p className="text-xs text-primary font-medium">
                        Will be notified if {profile.name} misses a dose
                      </p>
                    </>
                  ) : (
                    <>
                      <BellOff className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                      <p className="text-xs text-muted-foreground">Notifications paused for this member</p>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === "alerts" && (
          <div className="space-y-3">
            {familyAlerts.length === 0 && (
              <div className="flex flex-col items-center justify-center glass rounded-2xl p-10 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 mb-4">
                  <CheckCircle2 className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-base font-bold text-foreground mb-1">No Alerts Yet</h3>
                <p className="text-sm text-muted-foreground">All medicines have been taken on time. Keep it up!</p>
              </div>
            )}

            {familyAlerts.map((alert, i) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`glass rounded-2xl p-4 ${!alert.isRead ? "border border-danger/20" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-danger/10 flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-danger" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-bold text-foreground">Missed Dose Alert</p>
                      {!alert.isRead && (
                        <span className="h-2 w-2 rounded-full bg-danger animate-pulse" />
                      )}
                    </div>
                    <p className="text-xs text-foreground font-medium">
                      {alert.patientName} hasn't taken{" "}
                      <span className="text-primary">{alert.medicineName}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Scheduled at {alert.scheduledTime} · {alert.familyMemberName} was notified
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Clock className="h-3 w-3" /> {formatTime(alert.alertTime)}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Pill className="h-3 w-3" /> {alert.medicineName}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowAddModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl p-5 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-foreground">Add Family Member</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted"
                >
                  <X className="h-4 w-4 text-foreground" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">Full Name *</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. John Smith"
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">Relationship *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {RELATIONSHIPS.map((rel) => (
                      <button
                        key={rel}
                        onClick={() => setForm((f) => ({ ...f, relationship: rel }))}
                        className={`rounded-xl py-2 text-xs font-semibold transition-all ${
                          form.relationship === rel
                            ? "bg-primary text-white"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {rel}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">Phone Number</label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="e.g. +1 555 0100"
                    type="tel"
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">Email</label>
                  <input
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="e.g. john@email.com"
                    type="email"
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                <div className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Enable Notifications</p>
                    <p className="text-xs text-muted-foreground">Alert when medicine is missed</p>
                  </div>
                  <button
                    onClick={() => setForm((f) => ({ ...f, notificationsEnabled: !f.notificationsEnabled }))}
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      form.notificationsEnabled ? "bg-primary" : "bg-muted-foreground/30"
                    }`}
                  >
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                      form.notificationsEnabled ? "translate-x-5" : "translate-x-0.5"
                    }`} />
                  </button>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!form.name || !form.relationship}
                className="mt-5 w-full rounded-2xl bg-primary py-4 text-sm font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Family Member
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}