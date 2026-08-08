import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

  return (
    <Card
      className={`w-full max-w-xs mx-auto transition-all hover:scale-105 ${
        highlighted ? "border-primary shadow-lg shadow-primary/20" : ""
      }`}
    >
      <CardHeader>
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white mb-2">{pkg.name}</h3>
          {pkg.description && (
            <p className="text-sm text-gray-400">{pkg.description}</p>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="text-center">
          {hasDiscount && (
            <div className="text-sm text-gray-500 line-through mb-1">
              {totalPrice}
            </div>
          )}
          <div className="text-3xl font-bold text-white mb-1">
            {displayTotalPrice}
          </div>
          <div className="text-sm text-gray-400">
            {pkg.ticketCount} ticket{pkg.ticketCount > 1 ? "s" : ""} ×{" "}
            {displayPricePerTicket}
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-300">
            <span>Tickets included:</span>
            <span className="text-white font-medium">{pkg.ticketCount}</span>
          </div>
          {pkg.requiresAccessCode && (
            <div className="flex justify-between text-gray-300">
              <span>Access code required:</span>
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
