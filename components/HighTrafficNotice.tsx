"use client";

import { motion } from "framer-motion";
import { AlertCircle, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import Link from "next/link";
export function HighTrafficNotice() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="mb-6 rounded-xl border border-amber-200/50 bg-linear-to-br from-amber-50 to-orange-50 p-4 shadow-sm dark:border-amber-900/30 dark:from-amber-950/20 dark:to-orange-950/20"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
        <Badge
          variant="outline"
          className="border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
        >
          <AlertCircle className="mr-1.5 h-3.5 w-3.5" />
          <span className="font-semibold">Notice</span>
        </Badge>

        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-amber-900 dark:text-amber-100 sm:text-lg">
              🚀 High Traffic Notice
            </h3>
            <motion.span
              className="relative flex h-2.5 w-2.5"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500"></span>
            </motion.span>
          </div>

          <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-200 sm:text-sm">
            We&apos;re currently experiencing high traffic. Please try
            registering again tomorrow. Thank you for your patience!
          </p>

          <div className="flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-300">
            <Calendar className="h-3.5 w-3.5 text-amber-500 dark:text-amber-600" />
            <span>See you tomorrow! 🎉</span>
          </div>
        </div>
      </div>

      <Button asChild className={"mt-5 w-full"} size={"lg"} variant="outline">
        <Link href={ROUTES.HOME}> Explore the Website </Link>
      </Button>
    </motion.div>
  );
}
