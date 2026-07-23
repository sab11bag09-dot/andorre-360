import type { TextareaHTMLAttributes } from "react";

export type TextareaProps =
  TextareaHTMLAttributes<HTMLTextAreaElement>;

export default function Textarea({
  className = "",
  ...props
}: TextareaProps) {
  return (
    <textarea
      className={`mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-yellow-500 ${className}`}
      {...props}
    />
  );
}