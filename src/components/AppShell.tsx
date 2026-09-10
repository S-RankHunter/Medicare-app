/**
 * AppShell — Wraps the app in a phone-like frame on desktop,
 * full-screen on mobile. Handles scroll container + safe areas.
 */

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: ReactNode;
  showFrame?: boolean;
}

export function AppShell({ children, showFrame = true }: AppShellProps) {
  return (
    <div className="min-h-screen w-full bg-mesh dark:bg-mesh-dark flex items-stretch justify-center sm:py-8 sm:px-4">
      <div
        className={cn(
          "relative w-full h-screen sm:h-[844px] sm:max-w-[390px] overflow-hidden bg-background flex flex-col",
          showFrame && "sm:phone-frame sm:rounded-[2.5rem]"
        )}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * ScrollArea — The main scrollable content area of the app.
 * Has padding for bottom nav and safe areas.
 */
export function ScrollArea({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("app-scroll flex-1 overflow-y-auto no-scrollbar", className)} style={{ paddingBottom: "calc(5rem + env(safe-area-inset-bottom, 20px))" }}>
      {children}
    </div>
  );
}
