import { NextResponse } from 'next/server';
import { parseSteamRequirements } from '@/lib/steam-utils';
import type { Game } from '@/lib/types';

// Required for Next.js static export (Electron build)
export const dynamic = 'force-static';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const appId = searchParams.get('appId');

  if (!appId) {
    return NextResponse.json({ error: 'appId parameter required' }, { status: 400 });
  }

  try {
    const response = await fetch(`https://store.steampowered.com/api/appdetails?appids=${appId}&l=english`);
    
    if (!response.ok) {
      throw new Error(`Steam Details API failed for ${appId}`);
    }

    const data = await response.json();
    const appData = data[appId];

    if (!appData || !appData.success || !appData.data) {
      return NextResponse.json({ error: 'Game data not found or invalid' }, { status: 404 });
    }

    const gameData = appData.data;

    // Parse Requirements
    const reqs = parseSteamRequirements(gameData.pc_requirements);

    // Manual Overrides for Realism (e.g., CS2 reporting 1GB for everything)
    if (appId === '730' && reqs) {
      reqs.recRam = 8;
      reqs.recGpu = 'NVIDIA GeForce GTX 1060';
    }

    const game: Omit<Game, 'isCustom'> = {
      id: parseInt(appId),
      name: gameData.name,
      steamAppId: parseInt(appId),
      coverImage: gameData.header_image,
      releaseDate: gameData.release_date?.date,
      requirements: reqs || {
        minCpu: 'Unknown',
        minGpu: 'Unknown',
        minRam: 4,
        minStorage: 10,
      },
    };

    return NextResponse.json({ game });
  } catch (error) {
    console.error(`Steam details error for ${appId}:`, error);
    return NextResponse.json({ error: 'Failed to fetch game details' }, { status: 500 });
  }
}
