import { NextRequest, NextResponse } from 'next/server';
import fetch, { AbortError } from 'node-fetch';
import { getAccessToken } from '../utils/dropbox';

const IMPERSONATED_USER_ID = process.env.DROPBOX_IMPERSONATED_USER_ID || 'dbmid:AADzg3NNU51AvVr__L1my2NKbwuhAYH7QOc';

async function fetchWithTimeout(url: string, options: any, timeout = 30000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(id);
        return response;
    } catch (error) {
        if (error instanceof AbortError) {
            throw new Error(`Request timed out after ${timeout / 1000} seconds`);
        }
    throw error;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const namespaceId = searchParams.get('namespace_id');
  const path = searchParams.get('path') || '';

  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
        return NextResponse.json({ error: 'Could not obtain access token.' }, { status: 500 });
    }

    // Case 1: No namespace provided. List the main team folders.
    if (!namespaceId) {
      const teamFoldersResponse = await fetchWithTimeout('https://api.dropboxapi.com/2/team/team_folder/list', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: 100 }),
      });

      if (!teamFoldersResponse.ok) {
        const errorText = await teamFoldersResponse.text();
        return NextResponse.json({ error: `Failed to list team folders: ${errorText}` }, { status: teamFoldersResponse.status });
      }
      const teamFoldersData: any = await teamFoldersResponse.json();
      
      const allowedFolders = ['1 - Customers', '2 - Sales', '3 - Marketing', '4 - Product Assets'];
      const filteredFolders = teamFoldersData.team_folders.filter((folder: any) =>
        allowedFolders.includes(folder.name) && folder.status['.tag'] === 'active'
      );
      
      const entries = filteredFolders.map((folder: any) => ({
        '.tag': 'folder',
        id: folder.team_folder_id,
        name: folder.name,
        path_lower: `ns:${folder.team_folder_id}`,
        path_display: folder.name,
        namespaceId: folder.team_folder_id,
      }));
      return NextResponse.json(entries);
    }

    // Case 2: Namespace ID provided. List contents of that specific team folder.
    const pathRootHeader = JSON.stringify({ '.tag': 'namespace_id', namespace_id: namespaceId });
    
    const listFolderResponse = await fetchWithTimeout('https://api.dropboxapi.com/2/files/list_folder', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Dropbox-API-Select-User': IMPERSONATED_USER_ID,
        'Dropbox-API-Path-Root': pathRootHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ path: path, include_mounted_folders: true }),
    });

    if (!listFolderResponse.ok) {
        const errorBody = await listFolderResponse.json();
        const errorMessage = errorBody?.error_summary || 'Failed to list folder contents';
        return NextResponse.json({ error: errorMessage }, { status: listFolderResponse.status });
    }
    const listFolderData: any = await listFolderResponse.json();

    const entriesWithNamespace = listFolderData.entries.map((entry: any) => ({
      ...entry,
      namespaceId: namespaceId
    }));

    return NextResponse.json(entriesWithNamespace);

  } catch (error: any) {
    console.error('Handler Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 
