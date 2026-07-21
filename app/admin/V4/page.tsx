import ArticleEditor from "@/components/admin/article-v4/ArticleEditor";

export default function ArticleV4Page() {
  return (
    <main className="min-h-screen bg-zinc-950 p-6 md:p-10">
      <ArticleEditor mode="create" />
    </main>
  );
}