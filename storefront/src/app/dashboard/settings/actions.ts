"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export interface SettingsState {
  ok?: boolean;
  error?: string;
}

export async function updateProfile(
  _prev: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "You're not signed in." };

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Name can't be empty." };
  if (name.length > 60) return { error: "Name is too long." };

  await prisma.user.update({ where: { id: session.user.id }, data: { name } });
  revalidatePath("/dashboard");
  return { ok: true };
}
