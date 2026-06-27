import SpeakerForm from "@/components/admin/forms/speaker-form";
import BackButton from "@/components/back-button";

const CreateSpeaker = () => {
  return (
    <section>
      <div className="flex items-center gap-2">
        <BackButton />
        <h2 className="text-2xl font-bold">Create Speaker</h2>
      </div>
      <div className="mt-4 flex justify-center items-center">
        <SpeakerForm />
      </div>
    </section>
  );
};

export default CreateSpeaker;
