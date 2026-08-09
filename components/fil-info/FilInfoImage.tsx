import SafeImage from "@/components/SafeImage";

export default function FilInfoImage({
  src,
  alt,
  priority = false,
  sizes,
  className = "",
}: {
  src: string | null;
  alt: string;
  priority?: boolean;
  sizes: string;
  className?: string;
}) {
  const hasImage = Boolean(src?.trim());

  return (
    <>
      <div
        aria-hidden="true"
        className="absolute inset-0 grid place-items-center bg-gradient-to-br from-neutral-800 via-neutral-950 to-black"
      >
        <span className="border border-yellow-500/40 px-3 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-yellow-500/70">
          Andorra 360
        </span>
      </div>
      {hasImage && (
        <SafeImage
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          className={className}
        />
      )}
    </>
  );
}
