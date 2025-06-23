import fetch from 'node-fetch';

const { DROPBOX_APP_KEY, DROPBOX_APP_SECRET, DROPBOX_REFRESH_TOKEN } = process.env;

// A simple in-memory cache for the access token to avoid refreshing it on every single call
let cachedToken = {
  token: null as string | null,
  expiresAt: 0 as number,
};

export async function getAccessToken() {
  const now = Date.now();
  // If we have a token and it's not expiring in the next minute, reuse it
  if (cachedToken.token && cachedToken.expiresAt > now + 60 * 1000) {
    return cachedToken.token;
  }

  console.log('Refreshing Dropbox access token...');
  try {
    const response = await fetch('https://api.dropbox.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(`${DROPBOX_APP_KEY}:${DROPBOX_APP_SECRET}`).toString('base64'),
      },
      body: `grant_type=refresh_token&refresh_token=${DROPBOX_REFRESH_TOKEN}`,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Failed to refresh token: ${response.status} ${errorBody}`);
    }

    const data: any = await response.json();
    const expiresIn = data.expires_in || 28800; 
    cachedToken = {
      token: data.access_token,
      expiresAt: now + (expiresIn * 1000),
    };
    return cachedToken.token;
  } catch (error) {
    console.error('Error refreshing Dropbox token:', error);
    cachedToken = { token: null, expiresAt: 0 }; // Reset cache on error
    throw error;
  }
} 