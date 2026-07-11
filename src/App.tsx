/**
 * MediCare AI — App Root
 * Sets up providers, routing, and the phone-frame shell.
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { StoreProvider, useStore } from "@/lib/store";
import { AppShell, ScrollArea } from "@/components/AppShell";
import { BottomNav } from "@/components/BottomNav";
import { FAB } from "@/components/FAB";
import { PageTransition } from "@/components/PageTransition";
import { AnimatePresence } from "framer-motion";
import { type ReactNode } from "react";

import SplashScreen from "@/pages/SplashScreen";
import OnboardingScreen from "@/pages/OnboardingScreen";
import LoginScreen from "@/pages/LoginScreen";
import RegisterScreen from "@/pages/RegisterScreen";
import ForgotPasswordScreen from "@/pages/ForgotPasswordScreen";
import HomeScreen from "@/pages/HomeScreen";
import MedicinesScreen from "@/pages/MedicinesScreen";
import AddMedicineScreen from "@/pages/AddMedicineScreen";
import MedicineDetailScreen from "@/pages/MedicineDetailScreen";
import TodayScreen from "@/pages/TodayScreen";
import CalendarScreen from "@/pages/CalendarScreen";
import HistoryScreen from "@/pages/HistoryScreen";
import AnalyticsScreen from "@/pages/AnalyticsScreen";
import ProfileScreen from "@/pages/ProfileScreen";
import InsightsScreen from "@/pages/InsightsScreen";
import NotificationsScreen from "@/pages/NotificationsScreen";
import SettingsScreen from "@/pages/SettingsScreen";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

/** Routes that show the bottom navigation + FAB */
const APP_ROUTES = ["/home", "/medicines", "/calendar", "/analytics", "/profile", "/today"];
/** Routes that show the FAB */
const FAB_ROUTES = ["/home", "/medicines", "/today"];

function AppRoutes() {
  const location = useLocation();
  const { auth, hasOnboarded } = useStore();

  const showNav = APP_ROUTES.some((r) => location.pathname.startsWith(r));
  const showFAB = FAB_ROUTES.some((r) => location.pathname.startsWith(r)) && !location.pathname.includes("add") && !location.pathname.includes("detail");

  // Auth gate — if not logged in, only allow auth/onboarding routes
  const isAuthRoute = ["/", "/onboarding", "/login", "/register", "/forgot"].some((r) => location.pathname === r);

  if (!hasOnboarded && location.pathname === "/") {
    return <Navigate to="/splash" replace />;
  }

  if (!auth && !isAuthRoute && location.pathname !== "/splash") {
    return <Navigate to="/login" replace />;
  }

  return (
    <AppShell showFrame={!location.pathname.startsWith("/splash") && !isAuthRoute}>
      <AnimatePresence mode="wait">
        <Routes location={location}>
          {/* Auth & Onboarding */}
          <Route path="/splash" element={<SplashScreen />} />
          <Route path="/onboarding" element={<OnboardingScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/register" element={<RegisterScreen />} />
          <Route path="/forgot" element={<ForgotPasswordScreen />} />

          {/* App routes — with nav + optional FAB */}
          <Route path="/home" element={<AppPage pageKey="home"><HomeScreen /></AppPage>} />
          <Route path="/medicines" element={<AppPage pageKey="medicines" showFAB={showFAB}><MedicinesScreen /></AppPage>} />
          <Route path="/medicines/add" element={<AppPage pageKey="add-medicine"><AddMedicineScreen /></AppPage>} />
          <Route path="/medicines/edit/:id" element={<AppPage pageKey="edit-medicine"><AddMedicineScreen /></AppPage>} />
          <Route path="/medicines/detail/:id" element={<AppPage pageKey="medicine-detail"><MedicineDetailScreen /></AppPage>} />
          <Route path="/today" element={<AppPage pageKey="today" showFAB={showFAB}><TodayScreen /></AppPage>} />
          <Route path="/calendar" element={<AppPage pageKey="calendar"><CalendarScreen /></AppPage>} />
          <Route path="/history" element={<AppPage pageKey="history"><HistoryScreen /></AppPage>} />
          <Route path="/analytics" element={<AppPage pageKey="analytics"><AnalyticsScreen /></AppPage>} />
          <Route path="/profile" element={<AppPage pageKey="profile"><ProfileScreen /></AppPage>} />
          <Route path="/insights" element={<AppPage pageKey="insights"><InsightsScreen /></AppPage>} />
          <Route path="/notifications" element={<AppPage pageKey="notifications"><NotificationsScreen /></AppPage>} />
          <Route path="/settings" element={<AppPage pageKey="settings"><SettingsScreen /></AppPage>} />

          {/* Default redirects */}
          <Route path="/" element={<Navigate to={auth ? "/home" : "/login"} replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>

      {showNav && <BottomNav />}
      {showNav && showFAB && <FAB />}
    </AppShell>
  );
}

/** Wrapper for app pages — adds scroll area + page transition */
function AppPage({ children, pageKey, showFAB = false }: { children: ReactNode; pageKey: string; showFAB?: boolean }) {
  return (
    <ScrollArea>
      <PageTransition pageKey={pageKey}>{children}</PageTransition>
    </ScrollArea>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <StoreProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AppRoutes />
        </BrowserRouter>
      </StoreProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
