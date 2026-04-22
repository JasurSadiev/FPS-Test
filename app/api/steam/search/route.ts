import { NextResponse } from 'next/server';

// Required for dynamic searching in Next.js
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q) {
    return NextResponse.json({ error: 'Search query required' }, { status: 400 });
  }

  try {
    const response = await fetch(`https://steamcommunity.com/actions/SearchApps/${encodeURIComponent(q)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Steam API failed');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Steam search error:', error);
    return NextResponse.json({ error: 'Failed to search games' }, { status: 500 });
  }
}
