import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface AssetMetadata {
  commentCount?: number;
  ratings: {
    positive?: number;
    neutral?: number;
    negative?: number;
  };
  // Add other properties as needed
}

export async function POST(request: NextRequest) {
  try {
    const { assetIds } = await request.json();

    if (!assetIds || !Array.isArray(assetIds) || assetIds.length === 0) {
      return NextResponse.json({ error: 'assetIds are required and must be a non-empty array' }, { status: 400 });
    }

    const [comments, ratings] = await Promise.all([
      prisma.comment.groupBy({
        by: ['assetId'],
        _count: {
          assetId: true,
        },
        where: {
          assetId: {
            in: assetIds,
          },
        },
      }),
      prisma.annotation.groupBy({
        by: ['assetId', 'rating'],
         _count: {
          rating: true,
        },
        where: {
          assetId: {
            in: assetIds,
          },
        },
      }),
    ]);
    
    const metadata: Record<string, AssetMetadata> = {};

    assetIds.forEach(id => {
        metadata[id] = {
            commentCount: 0,
            ratings: { positive: 0, neutral: 0, negative: 0 }
        };
    });

    comments.forEach(comment => {
        if (metadata[comment.assetId]) {
            metadata[comment.assetId].commentCount = comment._count.assetId;
        }
    });

    ratings.forEach(ratingGroup => {
      if (metadata[ratingGroup.assetId]) {
        if (ratingGroup.rating === 1) metadata[ratingGroup.assetId].ratings.positive = ratingGroup._count.rating;
        if (ratingGroup.rating === 0) metadata[ratingGroup.assetId].ratings.neutral = ratingGroup._count.rating;
        if (ratingGroup.rating === -1) metadata[ratingGroup.assetId].ratings.negative = ratingGroup._count.rating;
      }
    });

    return NextResponse.json(metadata);

  } catch (error) {
    console.error('Failed to fetch asset metadata:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 