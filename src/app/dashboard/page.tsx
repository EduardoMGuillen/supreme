import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/DashboardClient";
import { getSessionUser } from "@/lib/auth";
import { readStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const store = await readStore();
  return <DashboardClient initial={store} user={user} />;
}
