import type { TeamMemberSocial } from "@/constants/team";

function isPlaceholder(url: string) {
  return !url || url === "#";
}

export function resolveSocialUrl(
  value: string,
  kind: "linkedin" | "instagram" | "facebook" | "tiktok" | "behance" | "portfolio",
): string | null {
  if (isPlaceholder(value)) return null;
  if (value.startsWith("http")) return value;

  const handle = value.replace(/^@/, "").replace(/\s/g, "");

  switch (kind) {
    case "instagram":
      return `https://www.instagram.com/${handle}`;
    case "linkedin":
      return `https://www.linkedin.com/in/${handle}`;
    case "facebook":
      return `https://www.facebook.com/${handle}`;
    case "tiktok":
      return `https://www.tiktok.com/@${handle}`;
    case "behance":
      return `https://www.behance.net/${handle}`;
    case "portfolio":
      return value.includes(".") ? `https://${value}` : null;
    default:
      return null;
  }
}

export function resolvePhoneHref(phone: string): string | null {
  if (!phone || phone.includes("×")) return null;
  const digits = phone.replace(/[^\d+]/g, "");
  return digits.length >= 8 ? `tel:${digits}` : null;
}

export type SocialLinkItem = {
  key: string;
  label: string;
  href: string;
};

export function getMemberSocialLinks(
  social: TeamMemberSocial,
): SocialLinkItem[] {
  const links: SocialLinkItem[] = [];

  const linkedin = resolveSocialUrl(social.linkedin, "linkedin");
  if (linkedin) links.push({ key: "linkedin", label: "LinkedIn", href: linkedin });

  const instagram = resolveSocialUrl(social.instagram, "instagram");
  if (instagram)
    links.push({ key: "instagram", label: "Instagram", href: instagram });

  const facebook = social.facebook
    ? resolveSocialUrl(social.facebook, "facebook")
    : null;
  if (facebook) links.push({ key: "facebook", label: "Facebook", href: facebook });

  const tiktok = social.tiktok
    ? resolveSocialUrl(social.tiktok, "tiktok")
    : null;
  if (tiktok) links.push({ key: "tiktok", label: "TikTok", href: tiktok });

  const behance = social.behance
    ? resolveSocialUrl(social.behance, "behance")
    : null;
  if (behance) links.push({ key: "behance", label: "Behance", href: behance });

  const portfolio = social.portfolio
    ? resolveSocialUrl(social.portfolio, "portfolio")
    : null;
  if (portfolio)
    links.push({ key: "portfolio", label: "Portfolio", href: portfolio });

  const phone = resolvePhoneHref(social.phone);
  if (phone) links.push({ key: "phone", label: "Phone", href: phone });

  return links;
}

export function getMemberInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
