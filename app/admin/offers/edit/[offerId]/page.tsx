import OfferForm from "@/components/admin/forms/offer-form";
import BackButton from "@/components/back-button";
import { getOfferById } from "@/lib/db/actions/offer.action";

const EditOffer = async ({
  params,
}: {
  params: Promise<{ offerId: string }>;
}) => {
  const { offerId } = await params;

  const offer = await getOfferById(offerId);

  return (
    <section>
      <div className="flex items-center gap-2">
        <BackButton />
        <h2 className="text-2xl font-bold">Edit Offer</h2>
      </div>
      <div className="mt-4 flex justify-center items-center">
        <OfferForm offer={offer.data || null} />
      </div>
    </section>
  );
};

export default EditOffer;
