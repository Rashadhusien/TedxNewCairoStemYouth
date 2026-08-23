"use client";

import { useState } from "react";

import PackageCard from "@/components/tickets/package-card";
import PackageCheckoutDialog from "@/components/tickets/package-checkout-dialog";
import type { Package } from "@/lib/db/schema";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { useSession } from "next-auth/react";
import { WHATSAPP_GROUP_LINK } from "@/constants";
import { IconBrandWhatsappFilled } from "@tabler/icons-react";

interface TicketsPageClientProps {
  packages: Package[];
  hasTicket?: boolean;
}

export default function TicketsPageClient({
  packages,
  hasTicket = false,
}: TicketsPageClientProps) {
  const { status: authStatus } = useSession();
  const router = useRouter();
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const handleSelect = (pkg: Package) => {
    if (authStatus === "unauthenticated") {
      router.push(ROUTES.LOGIN);
      return;
    }
    setSelectedPackage(pkg);
    setCheckoutOpen(true);
  };

  if (!packages || packages.length === 0) {
    return (
      <section className="relative py-12 px-6 lg:px-10 max-w-6xl mx-auto space-y-12">
        <div className="text-center text-gray-400">
          No packages available at this time.
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-12 px-6 lg:px-10 max-w-6xl mx-auto space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <PackageCard
            key={pkg.id}
            package={pkg}
            onSelect={handleSelect}
            highlighted={pkg.name === "Regular"}
          />
        ))}
      </div>

      {/* WhatsApp Group Link - only show if user has a confirmed ticket */}
      {hasTicket && (
        <a
          href={WHATSAPP_GROUP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm font-medium text-green-400 transition hover:bg-green-500/20 hover:border-green-500/50"
        >
          <IconBrandWhatsappFilled className="h-5 w-5" />
          Join WhatsApp Group
        </a>
      )}

      {selectedPackage && (
        <PackageCheckoutDialog
          pkg={selectedPackage}
          open={checkoutOpen}
          onOpenChange={(open) => {
            setCheckoutOpen(open);
            if (!open) setSelectedPackage(null);
          }}
        />
      )}
    </section>
  );
}
