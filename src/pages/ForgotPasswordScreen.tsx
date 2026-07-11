/**
 * ForgotPasswordScreen — Password reset request.
 */

import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, ChevronLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordScreen() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 800);
  };

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-mesh dark:bg-mesh-dark">
      <div className="absolute top-0 left-0 right-0 h-[35%] bg-gradient-to-br from-warning via-orange-500 to-primary" />

      <div className="relative z-10 flex flex-col h-full pt-safe">
        <div className="p-5">
          <Link to="/login" className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-xl">
            <ChevronLeft className="h-5 w-5 text-white" />
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center pt-4"
        >
          <h1 className="text-2xl font-bold text-white">Reset Password</h1>
          <p className="mt-1 text-sm text-white/80 px-8 text-center">
            Enter your email and we'll send you a reset link
          </p>
        </motion.div>

        {sent ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="mt-auto mb-auto mx-5 glass-strong rounded-3xl p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.2 }}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/10"
            >
              <CheckCircle2 className="h-8 w-8 text-accent" />
            </motion.div>
            <h2 className="mt-4 text-lg font-bold text-foreground">Check Your Email</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We've sent a password reset link to <span className="font-semibold text-foreground">{email}</span>
            </p>
            <button
              onClick={() => navigate("/login")}
              className="mt-6 w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground"
            >
              Back to Login
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-auto glass-strong rounded-3xl p-6 mx-5 mb-8"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full rounded-xl bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 pl-11 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-warning/40 focus:border-warning transition-all"
                  />
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileTap={{ scale: 0.97 }}
                className="flex w-full items-center justify-center rounded-xl bg-warning py-3.5 text-base font-semibold text-white shadow-lg shadow-warning/25 disabled:opacity-60"
              >
                {loading ? (
                  <motion.div
                    className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                  />
                ) : (
                  "Send Reset Link"
                )}
              </motion.button>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}
