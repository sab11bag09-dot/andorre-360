import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function ImmobilierPage() {
  redirect("/ils-en-parlent");
}
