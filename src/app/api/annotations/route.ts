import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

// --- Collaborative Annotation API ---
// Each annotation is linked to a user (userId), so multiple users can comment/rate the same asset.
// All endpoints require userId (for now, passed explicitly; in the future, use session/auth).

// GET /api/annotations?assetId=...
// Optionally, filter by &userId=...
// Returns a single annotation or a list of annotations for an asset.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const assetId = searchParams.get('assetId');

  if (!assetId) {
    return NextResponse.json({ message: 'assetId is required' }, { status: 400 });
  }

  try {
    const annotations = await prisma.annotation.findMany({
      where: { assetId },
      include: {
        user: {
          select: { id: true, username: true }
        }
      }
    });
    return NextResponse.json(annotations);
  } catch (error) {
    console.error(`Failed to fetch annotations for asset ${assetId}:`, error);
    return NextResponse.json({ message: 'Failed to fetch annotations' }, { status: 500 });
  }
}

// POST /api/annotations
// Body: { assetId: string, userId: number, rating?: number, hidden?: boolean }
// Upserts annotation for (assetId, userId)
export async function POST(request: NextRequest) {
  try {
    const { rating, assetId, userId } = await request.json();

    if (rating === null || rating === undefined || !assetId || !userId) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }
    
    const newAnnotation = await prisma.annotation.upsert({
      where: {
        userId_assetId: {
          userId,
          assetId,
        }
      },
      update: { rating },
      create: {
        rating,
        assetId,
        userId,
      },
    });

    return NextResponse.json(newAnnotation);

  } catch (error) {
    console.error('Failed to create/update annotation:', error);
    return NextResponse.json({ message: 'Failed to create/update annotation' }, { status: 500 });
  }
}

// PATCH /api/annotations
// Body: { userId: number, unhideAll: boolean }
// Unhides all annotations for a user
export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { userId, unhideAll } = body;
  if (!userId || !unhideAll) {
    return NextResponse.json({ error: 'Missing userId or unhideAll flag' }, { status: 400 });
  }
  
  const result = await prisma.annotation.updateMany({
    where: {
      userId: userId,
      hidden: true
    },
    data: {
      hidden: false
    }
  });

  return NextResponse.json({ success: true, count: result.count });
}

// DELETE /api/annotations?assetId=123&userId=1
// Removes the annotation for this user/asset
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const assetId = searchParams.get('assetId');
  const userId = searchParams.get('userId');

  if (!assetId || !userId) {
    return NextResponse.json({ error: 'Missing assetId or userId' }, { status: 400 });
  }

  await prisma.annotation.delete({
    where: {
      userId_assetId: {
          assetId,
          userId: parseInt(userId, 10),
      }
    },
  });

  return NextResponse.json({ success: true });
} 