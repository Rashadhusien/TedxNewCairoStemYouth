import TicketTierForm from "@/components/admin/forms/ticket-tier-form";
import BackButton from "@/components/back-button";
import { getTicketTierById } from "@/lib/db/actions/ticket-tier.action";
import { notFound } from "next/navigation";

interface EditTicketTierPageProps {
  params: Promise<{
    ticketTierId: string;
  }>;
}

export default async function EditTicketTierPage({
  params,
}: EditTicketTierPageProps) {
  const { ticketTierId } = await params;
  const result = await getTicketTierById(ticketTierId);

  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <section>
      <div className="flex items-center gap-2">
        <BackButton />
        <h2 className="text-2xl font-bold">Edit Ticket Tier</h2>
      </div>
      <div className="mt-4 flex justify-center items-center">
        <TicketTierForm ticketTier={result.data} />
      </div>
    </section>
  );
}
