import SpeakerForm from "@/components/admin/forms/speaker-form";
import BackButton from "@/components/back-button";
import { getSpeakerById } from "@/lib/db/actions/speaker.action";

const EditSpeaker = async ({
  params,
}: {
  params: Promise<{ speakerId: string }>;
}) => {
  const { speakerId } = await params;

  const speaker = await getSpeakerById(speakerId);

  return (
    <section>
      <div className="flex items-center gap-2">
        <BackButton />
        <h2 className="text-2xl font-bold">Edit Speaker</h2>
      </div>
      <div className="mt-4 flex justify-center items-center">
        <SpeakerForm speaker={speaker.data || null} />
      </div>
    </section>
  );
};

export default EditSpeaker;
