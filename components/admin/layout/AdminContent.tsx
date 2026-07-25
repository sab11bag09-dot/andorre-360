import type { ReactNode } from "react";

type AdminContentProps = {
  children: ReactNode;
};

export function AdminContent({
  children,
}: AdminContentProps) {
  return (
    <main className="min-w-0 flex-1 px-5 py-8 sm:px-6 md:px-10 md:py-10">
      <div className="mx-auto w-full max-w-7xl">
        {children}
      </div>
    </main>
  );
}