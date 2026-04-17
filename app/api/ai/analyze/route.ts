import { NextResponse } from 'next/server';

// Required for Next.js static export (Electron build)
export const dynamic = 'force-static';

export async function POST(request: Request) {
  const apiKey = process.env.GOOGLE_AI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Gemini API key is not configured in .env' },
      { status: 500 }
    );
  }

  try {
    const { systemInfo, game, verdict, fps } = await request.json();

    const prompt = `
      You are an independent GPU performance expert. 
      IGNORE any previous compatibility verdicts. You must perform your own independent research using Google Search for the following setup:
      
      GAME: ${game.name}
      SPECS:
      - CPU: ${systemInfo.cpu.manufacturer} ${systemInfo.cpu.brand}
      - GPU: ${systemInfo.gpu.vendor} ${systemInfo.gpu.model} (${Math.round(systemInfo.gpu.vram / 1024)}GB VRAM)
      - RAM: ${Math.round(systemInfo.memory.total / (1024 ** 3))}GB
      
      REQUIREMENTS:
      1. Research real-word benchmarks (YouTube, Reddit, Benchmark sites) for this SPECIFIC GPU/CPU combo in ${game.name}.
      2. Return a PURE JSON response (no markdown, no extra text) with the following structure:
         {
           "fps": {
             "low": "e.g. 60-90 FPS",
             "medium": "e.g. 45-60 FPS",
             "high": "e.g. 30-45 FPS"
           },
           "recommendations": [
             "Short, actionable recommendation 1",
             "Short, actionable recommendation 2"
           ],
           "overallReport": "A professional 2-3 sentence summary of the synergistic performance."
         }
    `;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          tools: [{ google_search: {} }]
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Gemini API call failed');
    }

    const data = await response.json();
    let textResult = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Clean up potential markdown blocks if AI ignored "PURE JSON" instruction
    textResult = textResult.replace(/```json|```/g, '').trim();

    try {
      const parsed = JSON.parse(textResult);
      return NextResponse.json(parsed);
    } catch (e) {
      console.error('Failed to parse AI JSON:', textResult);
      return NextResponse.json({ 
        overallReport: textResult, // Fallback if it didn't return JSON
        fps: { low: '-', medium: '-', high: '-' },
        recommendations: []
      });
    }
  } catch (error: any) {
    console.error('AI Analysis Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate AI analysis' },
      { status: 500 }
    );
  }
}
