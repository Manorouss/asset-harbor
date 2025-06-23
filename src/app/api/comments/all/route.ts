import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function GET() {
    try {
        const comments = await prisma.comment.findMany({
            select: {
                assetId: true,
            },
            distinct: ['assetId']
        });
        // We only need the assetId to know which files are commented
        const assetIds = comments.map(c => ({ assetId: c.assetId }));
        return NextResponse.json(assetIds);
    } catch (error) {
        console.error('Failed to fetch all commented asset IDs:', error);
        return NextResponse.json({ message: 'Failed to fetch commented asset IDs' }, { status: 500 });
    }
} 