import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const updated = await prisma.confession.update({
    where: { id: params.id },
    data: { reports: { increment: 1 } },
  });

  if (updated.reports >= 5) {
    await prisma.confession.update({
      where: { id: params.id },
      data: { isFlagged: true },
    });
  }

  return NextResponse.json({ message: "Reported" });
}