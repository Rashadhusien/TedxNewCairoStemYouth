"use client";
import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const BackButton = () => {
  const router = useRouter();
  return (
    <Button
      className="cursor-pointer"
      variant="ghost"
      size={"icon"}
      onClick={() => router.back()}
    >
      <ArrowLeft />
    </Button>
  );
};

export default BackButton;
