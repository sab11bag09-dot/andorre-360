"use client";

import type { MouseEvent } from "react";

import Button, {
  type ButtonVariant,
} from "@/components/admin/ui/Button";

type ConfirmTranslationActionButtonProps = {
  label: string;
  message: string;
  variant?: ButtonVariant;
};

export default function ConfirmTranslationActionButton({
  label,
  message,
  variant = "primary",
}: ConfirmTranslationActionButtonProps) {
  function handleClick(
    event: MouseEvent<HTMLButtonElement>,
  ): void {
    if (!window.confirm(message)) {
      event.preventDefault();
    }
  }

  return (
    <Button
      type="submit"
      variant={variant}
      onClick={handleClick}
    >
      {label}
    </Button>
  );
}
