"use client";

import { useEffect, useState, useTransition, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import confetti from "canvas-confetti";
import {
  getWelcomeStatus,
  markWelcomeSeen,
} from "@/lib/db/actions/welcome.action";
import { Button } from "@/components/ui/button";

type WelcomeStatus = {
  shouldShow: boolean;
  fullName: string | null;
};

// ── Design tokens ────────────────────────────────────────────────
const GOLD = "#C9A84C";
const TED_RED = "#e62b1e";
const CONFETTI_COLORS = [GOLD, TED_RED, "#ffffff"] as const;
const MAX_DISPLAY_NAME_LENGTH = 14;

// Motion timeline (seconds), matches the spec exactly.
const TIMELINE = {
  piece: 0.15,
  confettiStart: 0.45,
  title: 0.65,
  subtitle: 0.85,
  button: 1.1,
} as const;

// Gentle falling confetti — small, staggered bursts instead of one explosion.
const CONFETTI_FALL_DURATION_MS = 2000;
const CONFETTI_TICK_MS = 220;
const CONFETTI_PARTICLES_PER_TICK = 5;

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
  const [isPending, startTransition] = useTransition();
  const [isDismissing, setIsDismissing] = useState(false);
  const [pieceSettled, setPieceSettled] = useState(false);

  const hasCheckedRef = useRef(false);
  const hasFiredConfettiRef = useRef(false);
  const confettiIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
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
      setPieceSettled(false);
      hasFiredConfettiRef.current = false;
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

  // Gentle falling confetti: several small bursts from random top positions,
  // low velocity/gravity, no single explosive call. Stops after ~2s.
  useEffect(() => {
    if (!isOpen || prefersReducedMotion || hasFiredConfettiRef.current) {
      return;
    }
    hasFiredConfettiRef.current = true;

    const startTimer = setTimeout(() => {
      const stopAt = Date.now() + CONFETTI_FALL_DURATION_MS;

      confettiIntervalRef.current = setInterval(() => {
        if (Date.now() > stopAt) {
          if (confettiIntervalRef.current) {
            clearInterval(confettiIntervalRef.current);
            confettiIntervalRef.current = null;
          }
          return;
        }

        confetti({
          particleCount: CONFETTI_PARTICLES_PER_TICK,
          startVelocity: 6,
          gravity: 0.5,
          spread: 100,
          ticks: 220,
          scalar: 0.7,
          origin: { x: Math.random(), y: -0.05 },
          colors: [...CONFETTI_COLORS],
        });
      }, CONFETTI_TICK_MS);
    }, TIMELINE.confettiStart * 1000);

    return () => {
      clearTimeout(startTimer);
      if (confettiIntervalRef.current) {
        clearInterval(confettiIntervalRef.current);
        confettiIntervalRef.current = null;
      }
    };
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
  const displayName =
    firstName.length > MAX_DISPLAY_NAME_LENGTH
      ? `${firstName.slice(0, MAX_DISPLAY_NAME_LENGTH)}…`
      : firstName;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto px-4 py-8 backdrop-blur-sm sm:px-6"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(201,168,76,0.10), transparent 60%)," +
            "radial-gradient(ellipse 90% 70% at 50% 100%, rgba(230,43,30,0.05), transparent 65%)," +
            "#0a0a0a",
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-heading"
      >
        {/* Vignette for depth */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 45%, transparent 35%, rgba(0,0,0,0.55) 100%)",
          }}
        />

        <div className="relative flex w-full max-w-sm flex-col items-center sm:max-w-md">
          {/* Ambient gold glow behind the piece */}
          <motion.div
            className="absolute h-72 w-72 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(201,168,76,0.18), transparent 70%)",
              filter: "blur(10px)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />

          {/* Puzzle piece */}
          <motion.div
            className="relative w-36 h-36 sm:w-40 sm:h-40"
            initial={
              prefersReducedMotion
                ? undefined
                : { opacity: 0, scale: 0.85, y: 24, rotate: -6 }
            }
            animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 170,
              damping: 17,
              delay: TIMELINE.piece,
            }}
            onAnimationComplete={() => setPieceSettled(true)}
          >
            {/* Subtle idle float, only once the entrance has settled */}
            <motion.div
              animate={
                pieceSettled && !prefersReducedMotion
                  ? { y: [0, -6, 0] }
                  : { y: 0 }
              }
              transition={
                pieceSettled && !prefersReducedMotion
                  ? { duration: 3.4, repeat: Infinity, ease: "easeInOut" }
                  : { duration: 0 }
              }
            >
              <svg
                viewBox="0 0 200 200"
                className="h-auto w-full"
                aria-hidden="true"
              >
                <defs>
                  <filter
                    id="pieceGlow"
                    x="-50%"
                    y="-50%"
                    width="200%"
                    height="200%"
                  >
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                {/* Modern jigsaw piece: rounded corners, tab top+right, blank bottom+left */}
                <path
                  d="M 40 50
                     L 65 50
                     C 65 30 115 30 115 50
                     L 140 50
                     Q 150 50 150 60
                     L 150 85
                     C 170 85 170 135 150 135
                     L 150 160
                     Q 150 170 140 170
                     L 115 170
                     C 115 150 65 150 65 170
                     L 40 170
                     Q 30 170 30 160
                     L 30 135
                     C 50 135 50 85 30 85
                     L 30 60
                     Q 30 50 40 50
                     Z"
                  fill="#111111"
                  stroke={GOLD}
                  strokeWidth="3.5"
                  strokeLinejoin="round"
                  filter="url(#pieceGlow)"
                />
                <text
                  x="100"
                  y="100"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-white text-2xl font-bold"
                >
                  {displayName}
                </text>
              </svg>
            </motion.div>
          </motion.div>

          {/* Typography */}
          <div className="mt-10 w-full text-center sm:mt-12">
            <motion.div
              initial={prefersReducedMotion ? undefined : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                ease: "easeOut",
                delay: TIMELINE.title,
              }}
            >
              <h1
                id="welcome-heading"
                className="mt-2 font-serif text-4xl font-semibold leading-tight text-white sm:text-5xl"
              >
                Welcome {displayName}
              </h1>
            </motion.div>

            <motion.div
              className="mt-5 space-y-0.5"
              initial={prefersReducedMotion ? undefined : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                ease: "easeOut",
                delay: TIMELINE.subtitle,
              }}
            >
              <p className="text-sm text-gray-400 sm:text-base">
                You&apos;re officially part of
              </p>
              <p className="text-sm font-medium text-gray-300 sm:text-base">
                TEDx New Cairo STEM Youth.
              </p>
            </motion.div>

            <motion.div
              className="mt-9 flex justify-center"
              initial={prefersReducedMotion ? undefined : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                ease: "easeOut",
                delay: TIMELINE.button,
              }}
              onAnimationComplete={() => ctaRef.current?.focus()}
            >
              <Button
                ref={ctaRef}
                onClick={handleDismiss}
                disabled={isPending}
                className="h-11 rounded-full px-9 text-sm font-medium shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 sm:h-12 sm:text-base"
                style={{
                  backgroundColor: TED_RED,
                  color: "white",
                  boxShadow: "0 8px 24px -8px rgba(230,43,30,0.5)",
                }}
              >
                {isPending ? "…" : "Let's Go"}
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
