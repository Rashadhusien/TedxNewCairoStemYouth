"use client";
import Link from "next/link";
import { X } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

const OfferBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 min-w-[90%] z-50 border-t border-red-700 bg-black/95 backdrop-blur-md">
      <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-3">
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-red-500">
            TEDx New Cairo STEM Youth 2026
          </span>

          <p className="text-sm text-white md:text-base">
            ⏳ Early Bird Ends In: 03 Days 14 Hours
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            className="rounded-lg  px-5 py-4 text-sm font-semibold  transition "
            asChild
          >
            <Link href="/tickets">Book Now</Link>
          </Button>

          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 transition hover:text-white"
            aria-label="Close banner"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OfferBanner;
