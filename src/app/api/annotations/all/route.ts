import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../generated/prisma';

const prisma = new PrismaClient();

// GET /api/annotations/all?userId=...
// Returns all annotations for a given user
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    try {
        const annotations = await prisma.annotation.findMany({
            where: {
                userId: parseInt(userId, 10),
            },
            select: {
                assetId: true,
                rating: true,
            }
        });
        return NextResponse.json(annotations);
    } catch (e) {
        console.error("Failed to fetch all annotations:", e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
} 