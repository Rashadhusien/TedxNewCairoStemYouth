import OfferForm from "@/components/admin/forms/offer-form";
import BackButton from "@/components/back-button";

const CreateOffer = () => {
  return (
    <section>
      <div className="flex items-center gap-2">
        <BackButton />
        <h2 className="text-2xl font-bold">Create Offer</h2>
      </div>
      <div className="mt-4 flex justify-center items-center">
        <OfferForm />
      </div>
    </section>
  );
};

export default CreateOffer;
