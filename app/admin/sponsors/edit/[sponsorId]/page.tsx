import SponsorForm from "@/components/admin/forms/sponsor-form";
import BackButton from "@/components/back-button";
import { getSponsorById } from "@/lib/db/actions/sponsor.action";

const EditSponsor = async ({
  params,
}: {
  params: Promise<{ sponsorId: string }>;
}) => {
  const { sponsorId } = await params;

  const sponsor = await getSponsorById(sponsorId);

  return (
    <section>
      <div className="flex items-center gap-2">
        <BackButton />
        <h2 className="text-2xl font-bold">Edit Sponsor</h2>
      </div>
      <div className="mt-4 flex justify-center items-center">
        <SponsorForm sponsor={sponsor.data || null} />
      </div>
    </section>
  );
};

export default EditSponsor;
