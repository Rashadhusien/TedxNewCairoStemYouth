"use client";
import Link from "next/link";

import { cn } from "@/lib/utils";

import { Avatar, AvatarFallback } from "./ui/avatar";
import { ROUTES } from "@/constants/routes";
import Image from "next/image";
// import { CldImage } from "next-cloudinary";

interface Props {
  id?: string;
  name: string;
  imageUrl?: string | null;
  className?: string;
  fallbackClassName?: string;
  /** When false, renders avatar only (e.g. inside a dropdown trigger). */
  linkToProfile?: boolean;
}

const UserAvatar = ({
  name,
  imageUrl,
  className = "h-9 w-9",
  fallbackClassName,
  linkToProfile = true,
}: Props) => {
  const initials = name
    .split(" ")
    .map((word: string) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const avatar = (
    <Avatar className={cn("relative", className)}>
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={name}
          className="object-cover"
          fill
          sizes="80px"
        />
      ) : (
        <AvatarFallback
          className={cn(
            "bg-primary font-sans! font-extrabold tracking-wider text-white",
            fallbackClassName,
          )}
        >
          {initials}
        </AvatarFallback>
      )}
    </Avatar>
  );

  if (!linkToProfile) {
    return <span className="w-fit overflow-hidden rounded-full">{avatar}</span>;
  }

  return (
    <Link href={ROUTES.HOME} className="w-fit overflow-hidden rounded-full">
      {avatar}
    </Link>
  );
};

export default UserAvatar;
