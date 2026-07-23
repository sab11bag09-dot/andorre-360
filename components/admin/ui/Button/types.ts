import type {
  MouseEventHandler,
  ReactNode,
} from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "danger";

export type ButtonProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  href?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
  target?: "_blank" | "_self";
  rel?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
};