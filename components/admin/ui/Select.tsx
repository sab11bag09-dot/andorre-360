import type { SelectHTMLAttributes } from "react";

export type SelectProps =
  SelectHTMLAttributes<HTMLSelectElement>;

export default function Select({
  className = "",
  ...props
}: SelectProps) {
  return (
    <select
      className={`mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition focus:border-yellow-500 ${className}`}
      {...props}
    />
  );
}