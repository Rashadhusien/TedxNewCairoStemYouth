import { Button } from "@/components/ui/button";
import { Ticket, ArrowRight } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";

export default function FinalCTASection() {
  return (
    <section className="relative py-20 px-6 lg:px-10 bg-black overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-b from-black via-[#0a0000] to-black pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] rounded-full bg-primary/[0.08] blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
     

        <p className="text-white/60 text-sm sm:text-base max-w-2xl mx-auto mb-8 leading-relaxed">
          Join us on September 5, 2026 at Galal El Sharkawy - down town cairo.
          Limited tickets available — secure your spot today and be part of an
          unforgettable experience.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" className="w-full sm:w-auto text-base" asChild>
            <Link href={ROUTES.TICKETS}>
              <Ticket className="size-5 mr-2" />
              Get Your Ticket
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full sm:w-auto text-base"
            asChild
          >
            <Link href={ROUTES.EVENT}>
              Explore The Event
              <ArrowRight className="size-4 ml-2" />
            </Link>
          </Button>
        </div>

        <p className="text-white/30 text-xs mt-6 font-medium">
          Regular, 3 Friends, and 5 Friends packages available
        </p>
      </div>
    </section>
  );
}
