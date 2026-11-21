import Image, { type ImageProps } from "next/image";

import { isSourceTestMediaPath } from "@/lib/media/sourceTestMedia";

type SafeImageProps = Omit<ImageProps, "src"> & {
  src?: ImageProps["src"] | null;
};

export default function SafeImage({
  src,
  alt,
  ...props
}: SafeImageProps) {
  const safeSrc = typeof src === "string" ? src.trim() : src;

  if (!safeSrc) {
    return null;
  }

  // Une photo de source réservée aux essais n’est servie qu’à un
  // administrateur : le navigateur la charge directement, avec sa connexion,
  // au lieu de passer par l’optimiseur d’images, qui n’en dispose pas.
  const unoptimized =
    props.unoptimized ?? (typeof safeSrc === "string" && isSourceTestMediaPath(safeSrc));

  return <Image src={safeSrc} alt={alt} {...props} unoptimized={unoptimized} />;
}