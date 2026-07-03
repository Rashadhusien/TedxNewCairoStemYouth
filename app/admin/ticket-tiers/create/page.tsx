import TicketTierForm from "@/components/admin/forms/ticket-tier-form";
import BackButton from "@/components/back-button";

const CreateTicketTier = () => {
  return (
    <section>
      <div className="flex items-center gap-2">
        <BackButton />
        <h2 className="text-2xl font-bold">Create Ticket Tier</h2>
      </div>
      <div className="mt-4 flex justify-center items-center">
        <TicketTierForm />
      </div>
    </section>
  );
};

export default CreateTicketTier;
