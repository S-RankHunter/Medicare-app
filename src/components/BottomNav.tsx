/**
 * BottomNav — Fixed bottom navigation bar (mobile app style).
 * Glassmorphism with active indicator animation.
 */

import { motion } from "framer-motion";
import { Home, Pill, Users, FileText, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { path: "/home",          label: "Home",         icon: Home },
  { path: "/medicines",     label: "Medicines",    icon: Pill },
  { path: "/family",        label: "Family",       icon: Users },
  { path: "/prescriptions", label: "Rx",           icon: FileText },
  { path: "/profile",       label: "Profile",      icon: User },
];

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadFamilyAlerts } = useStore();

  return (
    <nav className="absolute bottom-0 left-0 right-0 z-40 pb-safe">
      <div className="glass-nav border-t border-slate-200/60 dark:border-slate-700/40">
        <div className="flex items-stretch justify-around px-2 py-2">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;
            const showBadge = item.path === "/family" && unreadFamilyAlerts > 0;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="relative flex flex-1 flex-col items-center justify-center gap-1 py-1.5 px-2 min-h-[52px] transition-colors"
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-x-2 -top-0.5 bottom-0 rounded-2xl bg-primary/10 dark:bg-primary/15"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <div className="relative">
                  <Icon
                    className={cn(
                      "relative z-10 h-5 w-5 transition-colors",
                      isActive ? "text-primary" : "text-slate-400 dark:text-slate-500"
                    )}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  {showBadge && (
                    <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-danger" />
                  )}
                </div>
                <span
                  className={cn(
                    "relative z-10 text-[10px] font-medium transition-colors",
                    isActive ? "text-primary" : "text-slate-400 dark:text-slate-500"
                  )}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}