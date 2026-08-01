import Image, { type ImageProps } from "next/image";

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

  return <Image src={safeSrc} alt={alt} {...props} />;
}