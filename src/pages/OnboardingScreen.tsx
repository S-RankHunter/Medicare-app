/**
 * OnboardingScreen — 3-screen swipable onboarding carousel.
 */

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "@/lib/store";
import { Pill, Bell, BarChart3, ChevronRight } from "lucide-react";

const SLIDES = [
  {
    icon: Pill,
    title: "Smart Medication Management",
    description: "Organize your medicines, set reminders, and never miss a dose again. Your complete medication companion.",
    gradient: "from-blue-500 to-cyan-400",
    bgGradient: "from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30",
  },
  {
    icon: Bell,
    title: "Never Forget Your Meds",
    description: "Get timely reminders for each medication. Track your adherence and build healthy habits effortlessly.",
    gradient: "from-green-500 to-emerald-400",
    bgGradient: "from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30",
  },
  {
    icon: BarChart3,
    title: "Insightful Health Analytics",
    description: "Visualize your medication adherence, streaks, and health insights with beautiful charts and progress tracking.",
    gradient: "from-violet-500 to-purple-400",
    bgGradient: "from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30",
  },
];

export default function OnboardingScreen() {
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();
  const { completeOnboarding } = useStore();

  const handleNext = () => {
    if (index < SLIDES.length - 1) {
      setIndex(index + 1);
    } else {
      completeOnboarding();
      navigate("/login");
    }
  };

  const handleSkip = () => {
    completeOnboarding();
    navigate("/login");
  };

  const slide = SLIDES[index];
  const Icon = slide.icon;

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-background">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className={`absolute inset-0 bg-gradient-to-br ${slide.bgGradient}`}
        />
      </AnimatePresence>

      {/* Skip */}
      <div className="relative z-10 flex justify-end p-5 pt-safe">
        {index < SLIDES.length - 1 && (
          <button onClick={handleSkip} className="text-sm font-medium text-muted-foreground px-3 py-1.5">
            Skip
          </button>
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center text-center"
          >
            <div className={`flex h-32 w-32 items-center justify-center rounded-[2rem] bg-gradient-to-br ${slide.gradient} shadow-2xl mb-8`}>
              <Icon className="h-16 w-16 text-white" strokeWidth={1.8} />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3 max-w-[280px]">
              {slide.title}
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed max-w-[300px]">
              {slide.description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots + Button */}
      <div className="relative z-10 px-8 pb-10 pb-safe space-y-6">
        <div className="flex items-center justify-center gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className="transition-all"
            >
              <motion.div
                className="rounded-full"
                animate={{
                  width: i === index ? 28 : 8,
                  height: 8,
                  backgroundColor: i === index ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.3)",
                }}
                transition={{ duration: 0.3 }}
              />
            </button>
          ))}
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleNext}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25"
        >
          {index < SLIDES.length - 1 ? "Continue" : "Get Started"}
          <ChevronRight className="h-5 w-5" />
        </motion.button>
      </div>
    </div>
  );
}
