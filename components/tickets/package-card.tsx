import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import type { Package } from "@/lib/db/schema";
import { formatPiastres } from "@/lib/pricing";

interface PackageCardProps {
  package: Package;
  onSelect: (pkg: Package) => void;
  highlighted?: boolean;
}

export default function PackageCard({
  package: pkg,
  onSelect,
  highlighted = false,
}: PackageCardProps) {
  const pricePerTicket = formatPiastres(pkg.pricePerTicketPiastres);
  const totalPrice = formatPiastres(pkg.totalPricePiastres);

  const hasDiscount =
    pkg.discountedPricePerTicketPiastres != null &&
    pkg.discountedPricePerTicketPiastres > 0;
  const displayTotalPrice = hasDiscount
    ? formatPiastres(pkg.discountedPricePerTicketPiastres! * pkg.ticketCount)
    : totalPrice;
  const displayPricePerTicket = hasDiscount
    ? formatPiastres(pkg.discountedPricePerTicketPiastres!)
    : pricePerTicket;
  const savings = hasDiscount
    ? pkg.totalPricePiastres -
      pkg.discountedPricePerTicketPiastres! * pkg.ticketCount
    : 0;
  const isGroup = pkg.ticketCount > 1;

  return (
    <Card
      className={`w-full max-w-xs mx-auto transition-all hover:scale-105 ${
        highlighted ? "border-primary shadow-lg shadow-primary/20" : ""
      }`}
    >
      <CardHeader>
        <div className="text-center">
          {isGroup && (
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-medium text-primary">
              <Users className="h-3.5 w-3.5" />
              Group package
            </div>
          )}
          <h3 className="text-2xl font-bold text-white mb-2">{pkg.name}</h3>
          {pkg.description && (
            <p className="text-sm text-gray-400">{pkg.description}</p>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="text-center">
          <div className="mb-2">
            <span className="text-3xl font-bold text-white ">
              {displayPricePerTicket}
            </span>{" "}
            <span className="text-sm text-gray-500">
              per ticket × {pkg.ticketCount} ticket
              {pkg.ticketCount > 1 ? "s" : ""}
            </span>
          </div>

          {hasDiscount && (
            <div className="text-sm text-gray-500 line-through mb-1">
              {totalPrice}
            </div>
          )}

          <div className="text-md font-bold text-gray-400">
            {displayTotalPrice}
          </div>

          {hasDiscount && savings > 0 && (
            <div className="text-xs text-green-500 mt-1">
              You save {formatPiastres(savings)}
            </div>
          )}
        </div>

        <div className="space-y-2 text-sm">
          <div className="rounded-lg bg-primary/10 border border-primary/20 px-3 py-2 text-xs text-primary">
            One payment covers all {pkg.ticketCount} tickets.
          </div>

          {/* {isGroup && (
            <div className="rounded-lg bg-primary/10 border border-primary/20 px-3 py-2 text-xs text-primary">
              One payment covers all {pkg.ticketCount} tickets.
            </div>
          )} */}

          <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 px-3 py-2 text-xs text-blue-400">
            Account required to purchase tickets
          </div>

          <div className="flex justify-between text-gray-300">
            <span>Tickets included:</span>
            <span className="text-white font-medium">{pkg.ticketCount}</span>
          </div>

          {pkg.requiresAccessCode && (
            <div className="flex justify-between text-gray-300">
              <span>Access code required</span>
              <span className="text-white font-medium">Yes</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={() => onSelect(pkg)}
          className="w-full"
          variant={highlighted ? "default" : "outline"}
        >
          Select {pkg.name}
        </Button>
      </CardFooter>
    </Card>
  );
}
