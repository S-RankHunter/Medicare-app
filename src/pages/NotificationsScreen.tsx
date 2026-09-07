/**
 * NotificationsScreen — Notification activity log.
 */

import { motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { AppHeader } from "@/components/AppHeader";
import { GlassCard } from "@/components/GlassCard";
import { getIcon } from "@/components/DynamicIcon";
import { timeAgo } from "@/lib/helpers";
import { Bell, BellOff, Check, CheckCheck, Pill, AlertTriangle, XCircle, Info } from "lucide-react";
import type { NotificationType } from "@/lib/types";

const TYPE_CONFIG: Record<NotificationType, { icon: typeof Bell; bg: string; text: string }> = {
  reminder:  { icon: Bell,          bg: "bg-primary/10",  text: "text-primary" },
  "low-stock": { icon: AlertTriangle, bg: "bg-warning/10",  text: "text-warning" },
  missed:    { icon: XCircle,       bg: "bg-danger/10",   text: "text-danger" },
  info:      { icon: Info,          bg: "bg-muted",        text: "text-muted-foreground" },
};

export default function NotificationsScreen() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useStore();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div>
      <AppHeader
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
        onBack={() => window.history.back()}
        right={
          unreadCount > 0 ? (
            <button
              onClick={markAllNotificationsRead}
              className="flex items-center gap-1 text-xs font-semibold text-primary px-2 py-1"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all
            </button>
          ) : undefined
        }
      />

      <div className="px-5 mt-3 pb-36">
        {notifications.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <BellOff className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">No notifications</p>
            <p className="text-xs text-muted-foreground mt-1">You're all caught up!</p>
          </GlassCard>
        ) : (
          <div className="space-y-2.5">
            {notifications.map((notif, i) => {
              const cfg = TYPE_CONFIG[notif.type];
              const Icon = cfg.icon;
              return (
                <motion.button
                  key={notif.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => markNotificationRead(notif.id)}
                  className="w-full text-left"
                >
                  <GlassCard
                    className={`p-3.5 flex items-start gap-3 transition-all ${
                      !notif.isRead ? "ring-1 ring-primary/20" : ""
                    }`}
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${cfg.bg} flex-shrink-0`}>
                      <Icon className={`h-5 w-5 ${cfg.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm ${notif.isRead ? "font-medium" : "font-bold"} text-foreground truncate`}>
                          {notif.title}
                        </p>
                        {!notif.isRead && (
                          <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{notif.body}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Pill className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">{notif.medicineName}</span>
                        <span className="text-[10px] text-muted-foreground">·</span>
                        <span className="text-[10px] text-muted-foreground">{timeAgo(notif.time)}</span>
                      </div>
                    </div>
                  </GlassCard>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
