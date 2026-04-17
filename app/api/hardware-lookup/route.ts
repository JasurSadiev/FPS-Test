import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key is not configured' }, { status: 500 });
    }

    const { cpuQuery, gpuQuery } = await req.json();

    if (!cpuQuery && !gpuQuery) {
      return NextResponse.json({ error: 'No hardware queries provided' }, { status: 400 });
    }

    const prompt = `
You are an expert PC hardware database. The user has provided custom string descriptions for a CPU and/or GPU.
CPU Query: ${cpuQuery || 'none'}
GPU Query: ${gpuQuery || 'none'}

Your task is to identify the accurate technical specifications for these exact components using your deep knowledge or by utilizing google_search.
Return a STRICTLY FORMATTED JSON payload. 
If a query is 'none', return null for that field.

CRITICAL: "vram" MUST be calculated in Megabytes (MB). For example, 4GB = 4096.
CRITICAL: "speed" MUST be in GHz.

JSON Schema:
{
  "cpu": {
    "manufacturer": "e.g. Intel, AMD, Apple, Unknown",
    "brand": "e.g. Xeon E3-1230 V2",
    "speed": <base clock speed in GHz as a number, e.g. 3.3>,
    "cores": <integer total threads/cores>,
    "physicalCores": <integer physical cores>
  } | null,
  "gpu": {
    "vendor": "e.g. NVIDIA, AMD, Intel, Unknown",
    "model": "e.g. Radeon HD 7850",
    "vram": <integer VRAM in MB>
  } | null
}

RETURN ONLY PURE JSON WITHOUT MARKDOWN BACKTICKS OR EXTRA TEXT.
    `;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          tools: [{ google_search: {} }],
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error?.message || 'Gemini API call failed' },
        { status: 500 }
      );
    }

    const payload = await response.json();
    let textResult = payload.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Clean markdown if the AI accidentally wraps it
    textResult = textResult.replace(/\`\`\`(json)?/gi, '').trim();

    try {
      const parsed = JSON.parse(textResult);
      return NextResponse.json(parsed);
    } catch (parseError) {
      console.error('Failed to parse AI hardware response:', textResult);
      return NextResponse.json({ error: 'AI returned invalid JSON format' }, { status: 502 });
    }
  } catch (error) {
    console.error('Hardware lookup error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
