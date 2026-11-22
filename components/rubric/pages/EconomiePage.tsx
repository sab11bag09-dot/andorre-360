import NewsRubricPage from "@/components/rubric/NewsRubricPage";

export const dynamic = "force-dynamic";

export default function EconomiePage() {
  return (
    <NewsRubricPage
      category="ÉCONOMIE"
      compactBottom
      partner={{
        href: "https://www.andorracorporate.com",
        label: "Visiter Andorra Corporate",
      }}
    />
  );
}
