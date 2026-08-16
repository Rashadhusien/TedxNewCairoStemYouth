import { Calendar, MapPin, Ticket } from "lucide-react";

export const VENUE_MAP_URL =
  "https://www.google.com/maps/search/?api=1&query=Galal+El+Sharkawy+Cairo+Egypt";

const FACTS = [
  {
    icon: Calendar,
    label: "Date & Time",
    value: "September 5, 2026 · 10:00 AM",
  },
  {
    icon: MapPin,
    label: "Venue",
    value: "Galal El Sharkawy - down town cairo",
  },
  {
    icon: MapPin,
    label: "Location",
    value: "Cairo, Egypt",
  },
  {
    icon: Ticket,
    label: "Tickets",
    value: "Limited Availability",
  },
];

export default function EventInfoSection() {
  return (
    <section
      id="event-info"
      aria-labelledby="event-info-heading"
      className="relative overflow-hidden border-y border-white/5 bg-black py-14 sm:py-16"
    >
      <div className="absolute inset-0 bg-linear-to-b from-[#0a0000] via-black to-[#0a0000] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-105 h-55 rounded-full bg-primary/7 blur-[80px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-10">
        <h2 id="event-info-heading" className="sr-only">
          Event information
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {FACTS.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="group relative border border-white/10 bg-white/2 p-5 transition-colors hover:border-primary/40"
            >
              <div
                className="absolute top-0 left-0 h-2 w-px bg-primary/60"
                aria-hidden
              />
              <div className="mb-3 flex size-9 items-center justify-center border border-primary/25 bg-primary/10 text-primary">
                <Icon className="size-4" aria-hidden />
              </div>
              <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/35 mb-1">
                {label}
              </p>
              <p className="text-sm font-semibold leading-snug text-white">
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button size="lg" asChild className="w-full sm:w-auto">
            <Link href={ROUTES.TICKETS}>
              <Ticket className="size-4" aria-hidden />
              Get Your Ticket
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            asChild
            className="w-full sm:w-auto"
          >
            <Link
              href={VENUE_MAP_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Ticket className="size-4" aria-hidden />
              Get Directions
            </Link>
          </Button>
        </div> */}
      </div>
    </section>
  );
}
