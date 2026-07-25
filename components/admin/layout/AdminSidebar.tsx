import { AdminNavigation } from "./AdminNavigation";

export function AdminSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-zinc-800 bg-black md:block">
      <div className="p-4">
        <AdminNavigation />
      </div>
    </aside>
  );
}