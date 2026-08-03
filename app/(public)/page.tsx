import HomePageDB from "@/components/HomePageDB";
import HomePageEditorial from "@/components/HomePageEditorial";
import { buildEditorialLayout } from "@/lib/editorial/engine";

export const dynamic = "force-dynamic";

export default async function Home() {
  const layout = await buildEditorialLayout("home");

  if (!layout.hero) {
    return <HomePageDB />;
  }

  return <HomePageEditorial />;
}
