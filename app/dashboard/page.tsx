import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import DashboardLayout from "../(dashboard)/layout";

const prisma = new PrismaClient();

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;

  if (!sessionToken) redirect("/");

  const session = await prisma.session.findUnique({
    where: { token: sessionToken },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) redirect("/");

  return (
    <DashboardLayout>
      {/* Replace with actual content blocks */}
      <div className="bg-white rounded-lg shadow p-6 h-[400px]">Panel A</div>
      <div className="bg-white rounded-lg shadow p-6 h-[400px]">Panel B</div>
    </DashboardLayout>
  );
}