"use client";

import { useEffect, useState, useTransition, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import {
  getWelcomeStatus,
  markWelcomeSeen,
} from "@/lib/db/actions/welcome.action";
import { Button } from "@/components/ui/button";

type WelcomeStatus = {
  shouldShow: boolean;
  fullName: string | null;
};

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

export default function WelcomeAboardModal() {
  const { data: session, status: sessionStatus } = useSession();
  const [welcomeStatus, setWelcomeStatus] = useState<WelcomeStatus | null>(
    null,
  );
  const [showText, setShowText] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isDismissing, setIsDismissing] = useState(false);
  const hasCheckedRef = useRef(false);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  const checkWelcomeStatus = useCallback(async () => {
    try {
      const result = await getWelcomeStatus();
      if (result.success && result.data) {
        setWelcomeStatus(result.data);
      }
    } catch (error) {
      console.error("Failed to check welcome status:", error);
    }
  }, []);

  useEffect(() => {
    if (
      sessionStatus === "authenticated" &&
      session?.user &&
      !hasCheckedRef.current
    ) {
      hasCheckedRef.current = true;
      void checkWelcomeStatus();
    }
  }, [sessionStatus, session, checkWelcomeStatus]);

  const isOpen = !!welcomeStatus?.shouldShow && !isDismissing;

  const handleDismiss = useCallback(() => {
    if (isDismissing) return;
    setIsDismissing(true);
    startTransition(async () => {
      await markWelcomeSeen();
      setWelcomeStatus(null);
      setShowText(false);
      setIsDismissing(false);
    });
  }, [isDismissing]);

  // Lock body scroll while open
  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  // Move focus to the CTA once it appears
  useEffect(() => {
    if (showText) {
      ctaRef.current?.focus();
    }
  }, [showText]);

  // If reduced motion, skip straight to the revealed state
  useEffect(() => {
    if (isOpen && prefersReducedMotion) {
      const t = setTimeout(() => setShowText(true), 150);
      return () => clearTimeout(t);
    }
  }, [isOpen, prefersReducedMotion]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleDismiss();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, handleDismiss]);

  if (!isOpen) {
    return null;
  }

  const firstName = welcomeStatus?.fullName?.split(" ")[0]?.trim() || "there";
  const pieceLabel = (welcomeStatus?.fullName ?? "YOU").slice(0, 14);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#0a0a0a]/97 px-4 py-8 backdrop-blur-sm sm:px-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-heading"
      >
        <div className="relative flex w-full max-w-md flex-col items-center sm:max-w-xl md:max-w-2xl">
          {/* Puzzle visual — scales fluidly via viewBox, no fixed px sizing */}
          <div className="w-full max-w-70 xs:max-w-xs sm:max-w-sm md:max-w-md">
            <svg
              viewBox="0 0 600 400"
              className="h-auto w-full"
              aria-hidden="true"
            >
              {/* Background puzzle pieces (team/community) */}
              <g>
                <motion.path
                  d="M 50 50 L 150 50 L 150 100 L 180 100 L 180 130 L 150 130 L 150 180 L 50 180 Z"
                  fill="none"
                  stroke="#C9A84C"
                  strokeWidth="2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                />
                <motion.path
                  d="M 170 50 L 350 50 L 350 100 L 320 100 L 320 130 L 350 130 L 350 180 L 170 180 L 170 130 L 200 130 L 200 100 L 170 100 Z"
                  fill="none"
                  stroke="#C9A84C"
                  strokeWidth="2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                />
                <motion.path
                  d="M 370 50 L 550 50 L 550 180 L 520 180 L 520 150 L 490 150 L 490 180 L 370 180 L 370 130 L 400 130 L 400 100 L 370 100 Z"
                  fill="none"
                  stroke="#C9A84C"
                  strokeWidth="2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                />
                <motion.path
                  d="M 50 200 L 150 200 L 150 250 L 180 250 L 180 280 L 150 280 L 150 350 L 50 350 Z"
                  fill="none"
                  stroke="#C9A84C"
                  strokeWidth="2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                />
                <motion.path
                  d="M 170 200 L 350 200 L 350 250 L 320 250 L 320 280 L 350 280 L 350 350 L 170 350 L 170 280 L 200 280 L 200 250 L 170 250 Z"
                  fill="none"
                  stroke="#C9A84C"
                  strokeWidth="2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                />
                <motion.path
                  d="M 370 200 L 550 200 L 550 350 L 370 350 L 370 280 L 400 280 L 400 250 L 370 250 Z"
                  fill="none"
                  stroke="#C9A84C"
                  strokeWidth="2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                />
              </g>

              {/* Empty slot — pulsing red dashed outline, visible until the piece lands */}
              {!showText && (
                <motion.path
                  d="M 370 50 L 550 50 L 550 180 L 520 180 L 520 150 L 490 150 L 490 180 L 370 180 L 370 130 L 400 130 L 400 100 L 370 100 Z"
                  fill="none"
                  stroke="#e62b1e"
                  strokeWidth="3"
                  strokeDasharray="8 4"
                  animate={
                    prefersReducedMotion
                      ? { opacity: 0 }
                      : { opacity: [0.4, 1, 0.4], strokeDashoffset: [0, 24] }
                  }
                  transition={
                    prefersReducedMotion
                      ? { duration: 0 }
                      : { duration: 2, repeat: Infinity, ease: "easeInOut" }
                  }
                />
              )}

              {/* User's piece — flies in and locks into place */}
              <motion.path
                d="M 370 50 L 550 50 L 550 180 L 520 180 L 520 150 L 490 150 L 490 180 L 370 180 L 370 130 L 400 130 L 400 100 L 370 100 Z"
                fill="#111111"
                stroke="#C9A84C"
                strokeWidth="2"
                initial={
                  prefersReducedMotion
                    ? { opacity: 1, scale: 1, rotate: 0, x: 0, y: 0 }
                    : { opacity: 0, scale: 0.8, rotate: -15, x: 200, y: -100 }
                }
                animate={{ opacity: 1, scale: 1, rotate: 0, x: 0, y: 0 }}
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : {
                        type: "spring",
                        stiffness: 200,
                        damping: 20,
                        delay: 0.8,
                      }
                }
                onAnimationComplete={() => {
                  if (!prefersReducedMotion) {
                    setTimeout(() => setShowText(true), 200);
                  }
                }}
              />

              {/* User's name on the piece */}
              <motion.text
                x="460"
                y="120"
                textAnchor="middle"
                dominantBaseline="middle"
                className="font-mono uppercase"
                fill="#C9A84C"
                fontSize="11"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  delay: prefersReducedMotion ? 0.1 : 1.2,
                  duration: 0.3,
                }}
              >
                {pieceLabel}
              </motion.text>
            </svg>
          </div>

          {/* Welcome text */}
          <AnimatePresence>
            {showText && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="mt-6 w-full text-center sm:mt-8"
              >
                <motion.h1
                  id="welcome-heading"
                  className="font-serif text-2xl leading-tight text-white xs:text-3xl sm:text-4xl md:text-5xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  Welcome Aboard, {firstName}.
                </motion.h1>
                <motion.p
                  className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-gray-400 sm:mt-4 sm:max-w-md sm:text-base"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  You&apos;re officially part of TEDxNewCairoSTEMYouth —
                  Luminous Darkness 2026.
                </motion.p>
                <motion.div
                  className="mt-6 flex justify-center sm:mt-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  <Button
                    ref={ctaRef}
                    onClick={handleDismiss}
                    disabled={isPending}
                    className="h-11 w-full rounded-md px-8 text-sm font-semibold sm:h-12 sm:w-auto"
                    style={{
                      backgroundColor: "#e62b1e",
                      color: "white",
                    }}
                  >
                    {isPending ? "…" : "Let's Go"}
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
