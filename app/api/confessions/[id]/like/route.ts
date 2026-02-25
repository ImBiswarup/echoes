import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { type } = await req.json(); // e.g. SUPPORT, HUG, RELATE

  if (!type) {
    return NextResponse.json(
      { error: "Reaction type required" },
      { status: 400 }
    );
  }

  const userId = "demo-user"; // replace with real auth later

  const existing = await prisma.reaction.findUnique({
    where: {
      confessionId_userId: {
        confessionId: id,
        userId,
      },
    },
  });

  if (!existing) {
    // ➕ Create new reaction
    await prisma.reaction.create({
      data: {
        confessionId: id,
        userId,
        type,
      },
    });
  } else if (existing.type === type) {
    // ❌ Clicking same reaction removes it
    await prisma.reaction.delete({
      where: { id: existing.id },
    });
  } else {
    // 🔄 Change reaction type
    await prisma.reaction.update({
      where: { id: existing.id },
      data: { type },
    });
  }

  // 🔢 Aggregate updated counts
  const grouped = await prisma.reaction.groupBy({
    by: ["type"],
    where: { confessionId: id },
    _count: {
      type: true,
    },
  });

  // Convert to { SUPPORT: 3, HUG: 2 }
  const reactionCounts = grouped.reduce((acc, item) => {
    acc[item.type] = item._count.type;
    return acc;
  }, {} as Record<string, number>);

  const userReaction =
    !existing
      ? type
      : existing.type === type
      ? null
      : type;

  return NextResponse.json({
    reactions: reactionCounts,
    userReaction,
  });
}