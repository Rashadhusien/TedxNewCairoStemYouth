import { Sponsor } from "@/lib/db/schema";

export type SponsorsWithRelations = Sponsor;

export type SponsorLeadQuestion = {
  id: string;
  question: string;
  type: string;
  options?: string[];
  required: boolean;
};

export type ActiveSponsorLeadQuestions = {
  id: string;
  name: string;
  leadGenQuestions: SponsorLeadQuestion[];
};
