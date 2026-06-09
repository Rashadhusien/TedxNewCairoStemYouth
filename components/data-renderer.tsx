import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

import { DEFAULT_EMPTY, DEFAULT_ERROR } from "@/constants/states";

import { Button } from "./ui/button";

interface Props<T> {
  success: boolean;
  error?: {
    message: string;
    details?: Record<string, string[]>;
  };
  data: T[] | null | undefined;
  empty: {
    title: string;
    message: string;
    button?: {
      text: string;
      href: string;
    };
  };

  render: (data: T[]) => ReactNode;
}

interface StateSkeletonProps {
  image: {
    src: string;
    alt: string;
  };
  title: string;
  message: string;
  button?: {
    text: string;
    href: string;
  };
}

const StateSkeleton = ({
  image,
  title,
  message,
  button,
}: StateSkeletonProps) => (
  <div className=" flex w-full flex-col items-center justify-center  col-span-3">
    <>
      <Image
        src={image.src}
        alt={image.alt}
        width={370}
        height={300}
        className="object-contain"
      />

      <h2 className="h2-bold ">{title}</h2>
      <p className="body-regular  my-3.5 max-w-md text-center">{message}</p>
    </>
  </div>
);

const DataRenderer = <T,>({
  success,
  error,
  data,
  empty = DEFAULT_EMPTY,
  render,
}: Props<T>) => {
  if (!success)
    return (
      <StateSkeleton
        image={{
          src: "/images/no-data.png",
          alt: "Error state Illustration",
        }}
        title={error?.message || DEFAULT_ERROR.title}
        message={
          error?.details
            ? JSON.stringify(error.details, null, 2)
            : DEFAULT_ERROR.message
        }
      />
    );
  if (!data || data.length === 0)
    return (
      <StateSkeleton
        image={{
          src: "/images/no-data.png",
          alt: "Empty state Illustration",
        }}
        title={empty.title}
        message={empty.message}
      />
    );
  return <>{render(data)}</>;
};

export default DataRenderer;
