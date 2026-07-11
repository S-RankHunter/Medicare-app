/**
 * AppHeader — Reusable top header for app pages.
 * Variants: default (title + optional back), large (hero-style).
 */

import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: ReactNode;
  className?: string;
  large?: boolean;
}

export function AppHeader({ title, subtitle, onBack, right, className, large = false }: AppHeaderProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("sticky top-0 z-30 glass px-5 pt-safe", className)}
    >
      <div className={cn("flex items-center gap-3", large ? "py-4" : "py-3.5")}>
        {onBack && (
          <button
            onClick={onBack}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 active:scale-90 transition-transform"
          >
            <ChevronLeft className="h-5 w-5 text-foreground" />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <h1 className={cn("font-bold text-foreground truncate", large ? "text-2xl" : "text-lg")}>
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground truncate mt-0.5">{subtitle}</p>
          )}
        </div>
        {right}
      </div>
    </motion.div>
  );
}
