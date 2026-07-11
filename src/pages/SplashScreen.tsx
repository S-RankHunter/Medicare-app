/**
 * SplashScreen — Animated splash with logo reveal.
 */

import { motion } from "framer-motion";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "@/lib/store";
import { Pill } from "lucide-react";

export default function SplashScreen() {
  const navigate = useNavigate();
  const { hasOnboarded, auth } = useStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasOnboarded) navigate("/onboarding");
      else if (auth) navigate("/home");
      else navigate("/login");
    }, 2200);
    return () => clearTimeout(timer);
  }, [hasOnboarded, auth, navigate]);

  return (
    <div className="relative flex h-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-primary via-blue-600 to-accent">
      {/* Decorative floating orbs */}
      <motion.div
        className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"
        animate={{ y: [0, 20, 0], x: [0, 10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-white/10 blur-3xl"
        animate={{ y: [0, -20, 0], x: [0, -10, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.2 }}
        className="relative z-10 flex h-24 w-24 items-center justify-center rounded-3xl bg-white/20 backdrop-blur-2xl border border-white/30"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <Pill className="h-12 w-12 text-white" strokeWidth={2.5} />
        </motion.div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="relative z-10 mt-6 text-3xl font-bold text-white"
      >
        MediCare AI
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        className="relative z-10 mt-2 text-sm text-white/80 font-medium"
      >
        Your Smart Health Companion
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-16 flex gap-1.5"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-2 w-2 rounded-full bg-white/60"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </motion.div>
    </div>
  );
}
