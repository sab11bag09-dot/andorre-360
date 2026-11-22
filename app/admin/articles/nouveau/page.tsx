import ArticleEditor from "@/components/admin/article-editor/ArticleEditor";

export default function NewArticlePage() {
  return (
    <main className="min-h-screen bg-zinc-950 p-6 md:p-10">
      <ArticleEditor mode="create" />
    </main>
  );
}