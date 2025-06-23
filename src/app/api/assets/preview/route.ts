import { NextRequest, NextResponse } from 'next/server';
import fetch from 'node-fetch';
import { getAccessToken } from '../../utils/dropbox';

const IMPERSONATED_USER_ID = process.env.DROPBOX_IMPERSONATED_USER_ID || 'dbmid:AADzg3NNU51AvVr__L1my2NKbwuhAYH7QOc';

// POST /api/assets/preview
// Body: { path: string, namespaceId: string }
// Returns: { link: string }
export async function POST(request: NextRequest) {
    try {
        const { path, namespaceId } = await request.json();
        if (!path || !namespaceId) {
            return NextResponse.json({ error: 'Missing path or namespaceId' }, { status: 400 });
        }

        const accessToken = await getAccessToken();
        if (!accessToken) {
            return NextResponse.json({ error: 'Could not obtain access token' }, { status: 500 });
        }
        
        const pathRootHeader = JSON.stringify({ '.tag': 'namespace_id', namespace_id: namespaceId });

        const response = await fetch('https://api.dropboxapi.com/2/files/get_temporary_link', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'Dropbox-API-Select-User': IMPERSONATED_USER_ID,
                'Dropbox-API-Path-Root': pathRootHeader,
            },
            body: JSON.stringify({ path }),
        });

        if (!response.ok) {
            const errorBody = await response.json();
            console.error('Dropbox API Error:', errorBody);
            const errorMessage = errorBody?.error_summary || 'Failed to get temporary link from Dropbox';
            return NextResponse.json({ error: errorMessage }, { status: response.status });
        }

        const data: any = await response.json();
        return NextResponse.json({ link: data.link });

    } catch (error: any) {
        console.error('API Error in /api/assets/preview:', error);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
} 