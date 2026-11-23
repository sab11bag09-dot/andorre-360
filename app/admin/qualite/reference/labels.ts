import { ORGANIZATION_TYPES } from "@/lib/sources/constants";

export function organizationTypeLabel(value: string): string {
  return ORGANIZATION_TYPES.find((type) => type.value === value)?.label ?? value;
}
