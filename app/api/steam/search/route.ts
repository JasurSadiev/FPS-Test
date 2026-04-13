import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q) {
    return NextResponse.json({ error: 'Search query required' }, { status: 400 });
  }

  try {
    const response = await fetch(`https://steamcommunity.com/actions/SearchApps/${encodeURIComponent(q)}`);
    
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
