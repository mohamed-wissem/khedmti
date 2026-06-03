import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "@/components/dashboard/settings-form";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/login");

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold tracking-wide text-moon">Settings</h1>
      <SettingsForm name={user.name ?? ""} email={user.email ?? ""} />
    </div>
  );
}
