"use client";

import { useFormStatus } from "react-dom";

import Button, {
  type ButtonVariant,
} from "@/components/admin/ui/Button";

type TranslationSubmitButtonProps = {
  label: string;
  variant?: ButtonVariant;
};

export default function TranslationSubmitButton({
  label,
  variant = "primary",
}: TranslationSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant={variant}
      disabled={pending}
    >
      {pending ? "Traitement…" : label}
    </Button>
  );
}
