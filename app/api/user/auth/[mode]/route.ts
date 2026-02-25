import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(
  req: Request,
  context: { params: Promise<{ mode: string }> }
) {
  try {
    const { username } = await req.json();
    const { mode } = await context.params;

    if (!username || username.trim().length < 3) {
      return NextResponse.json(
        { error: "Username must be at least 3 characters" },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim();

    // ---------------- LOGIN ----------------
    if (mode === "login") {
      const user = await prisma.user.findUnique({
        where: { username: cleanUsername },
      });

      if (!user) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
      }

      const cookieStore = await cookies();
      cookieStore.set("userId", user.id, {
        httpOnly: true,
        path: "/",
      });

      return NextResponse.json({ id: user.id });
    }

    // ---------------- REGISTER ----------------
    if (mode === "register") {
      const existing = await prisma.user.findUnique({
        where: { username: cleanUsername },
      });

      if (existing) {
        return NextResponse.json(
          { error: "Username already exists" },
          { status: 400 }
        );
      }

      const user = await prisma.user.create({
        data: { username: cleanUsername },
      });

      const cookieStore = await cookies();
      cookieStore.set("userId", user.id, {
        httpOnly: true,
        path: "/",
      });

      return NextResponse.json({ id: user.id });
    }

    return NextResponse.json(
      { error: "Invalid mode" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}