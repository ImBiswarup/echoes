import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // const cookieStore = cookies();
        // const userId = (await cookieStore).get("userId")?.value;

        // if (!userId) {
        //     return NextResponse.json(
        //         { error: "Unauthorized" },
        //         { status: 401 }
        //     );
        // }

        const { id } = await params;

        const confession = await prisma.confession.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        username: true
                    }
                },
                reactions: true,
                comments: {
                    include: {
                        user: {
                            select: {
                                username: true,
                            }
                        }
                    }
                },
            },
        });

        if (!confession) {
            return NextResponse.json(
                { error: "Confession not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(confession);

    } catch (error) {
        console.error("GET /confessions/[id] error:", error);
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        );
    }
}