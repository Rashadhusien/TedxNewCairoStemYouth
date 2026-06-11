import SponsorForm from "@/components/admin/forms/sponsor-form";
import BackButton from "@/components/back-button";

const CreateSponsor = () => {
  return (
    <section>
      <div className="flex items-center gap-2">
        <BackButton />
        <h2 className="text-2xl font-bold">Create Sponsor</h2>
      </div>
      <div className="mt-4 flex justify-center items-center">
        <SponsorForm />
      </div>
    </section>
  );
};

export default CreateSponsor;
