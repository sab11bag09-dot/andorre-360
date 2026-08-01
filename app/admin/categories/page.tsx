import CategoryActions from "@/components/admin/categories/CategoryActions";
import NewCategoryButton from "@/components/admin/categories/NewCategoryButton";
import { prisma } from "@/lib/prisma";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
            Organisation
          </p>

          <h1 className="mt-2 font-serif text-3xl text-white">
            Catégories
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            Organisez les articles du média par grandes thématiques
            éditoriales.
          </p>
        </div>

        <NewCategoryButton />
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px]">
            <thead className="border-b border-zinc-800">
              <tr className="text-left text-sm text-zinc-400">
                <th className="px-6 py-4">Nom</th>
                <th className="px-6 py-4">Slug</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-zinc-500"
                  >
                    Aucune catégorie.
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr
                    key={category.id}
                    className="border-t border-zinc-800"
                  >
                    <td className="px-6 py-4 font-medium text-white">
                      {category.name}
                    </td>

                    <td className="px-6 py-4 text-zinc-400">
                      {category.slug}
                    </td>

                    <td className="px-6 py-4 text-zinc-400">
                      {category.description ?? "—"}
                    </td>

                    <td className="px-6 py-4">
                      <CategoryActions
  id={category.id}
  name={category.name}
  description={category.description}
/>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}