import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAccessToken } from '../../utils/dropbox';

const IMPERSONATED_USER_ID = process.env.DROPBOX_IMPERSONATED_USER_ID || 'dbmid:AADzg3NNU51AvVr__L1my2NKbwuhAYH7QOc';

export async function POST(request: NextRequest) {
  try {
    const { hasNegativeRating, hasComments } = await request.json();
    const accessToken = await getAccessToken();

    if (!accessToken) {
      return NextResponse.json({ error: 'Could not obtain access token.' }, { status: 500 });
    }

    let assetIds = new Set<string>();

    if (hasNegativeRating) {
      const negativeAnnotations = await prisma.annotation.findMany({
        where: { rating: -1 },
        select: { assetId: true },
      });
      negativeAnnotations.forEach(a => assetIds.add(a.assetId));
    }

    if (hasComments) {
      const comments = await prisma.comment.findMany({
        select: { assetId: true },
      });
      comments.forEach(c => assetIds.add(c.assetId));
    }

    const uniqueAssetIds = Array.from(assetIds).filter(Boolean);

    if (uniqueAssetIds.length === 0) {
      return NextResponse.json([]);
    }
    
    const assets = [];
    
    // We have to fetch metadata one by one because the batch endpoint fails if any single asset is not found.
    // This is less efficient but more robust to stale data.
    for (const id of uniqueAssetIds) {
        const formattedPath = /^\d+$/.test(id) ? `ns:${id}` : id;
        
        try {
            const response = await fetch('https://api.dropboxapi.com/2/files/get_metadata', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Dropbox-API-Select-User': IMPERSONATED_USER_ID,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    path: formattedPath,
                    include_media_info: true,
                }),
            });
            
            if (response.ok) {
                const metadata = await response.json();
                assets.push(metadata);
            } else {
                 // Log the error for the specific asset but don't fail the whole request
                 const errorText = await response.text();
                 console.warn(`Could not fetch metadata for asset ${id}: ${errorText}`);
            }
        } catch (error) {
            console.warn(`Error fetching metadata for asset ${id}:`, error);
        }
    }
    
    return NextResponse.json(assets);

  } catch (error) {
    console.error('API Query Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 