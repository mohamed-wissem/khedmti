import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashNav } from "@/components/dashboard/dash-nav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="lg:w-56 lg:shrink-0">
          <p className="mb-3 hidden font-display text-xs font-semibold uppercase tracking-wider text-bronze lg:block">
            Your account
          </p>
          <DashNav />
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
