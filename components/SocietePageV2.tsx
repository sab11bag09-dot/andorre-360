import NewsRubricPage from "@/components/rubric/NewsRubricPage";

export const dynamic = "force-dynamic";

export default function SocietePageV2() {
  return (
    <NewsRubricPage
      category="SOCIÉTÉ"
      compactBottom
      partner={{
        href: "https://www.andorrasignature.com",
        label: "Visiter Andorra Signature",
      }}
    />
  );
}
