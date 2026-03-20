import { NextRequest, NextResponse } from 'next/server'

const OPENAI_KEY = process.env.OPENAI_API_KEY!

export async function POST(req: NextRequest) {
  try {
    const { prompt, wardrobe } = await req.json()
    if (!prompt || !wardrobe?.length) {
      return NextResponse.json({ error: 'Need a prompt and wardrobe items' }, { status: 400 })
    }

    // Build wardrobe summary for AI
    const wardrobeSummary = wardrobe.map((item: { name: string; type: string; color: string; brand: string; occasions: string[] }, i: number) =>
      `${i + 1}. ${item.name} (${item.type}) — ${item.color}, ${item.brand}, good for: ${item.occasions.join(', ')}`
    ).join('\n')

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 500,
        messages: [
          {
            role: 'system',
            content: `You are a men's fashion stylist. The user has a wardrobe of items and wants an outfit suggestion. Pick items from THEIR wardrobe that work together. Return ONLY valid JSON.`,
          },
          {
            role: 'user',
            content: `My wardrobe:\n${wardrobeSummary}\n\nI need an outfit for: ${prompt}\n\nPick items from my wardrobe that create a cohesive outfit. Return ONLY this JSON:\n{\n  "outfitName": "A catchy name for this outfit",\n  "description": "2-3 sentences about the look and why it works",\n  "items": [1, 5, 11, 16],\n  "styling_tips": "Brief styling advice"\n}\n\nThe "items" array should contain the numbers (1-indexed) of the wardrobe items to include. Pick 3-5 items that work together.`,
          },
        ],
      }),
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'AI styling failed' }, { status: 500 })
    }

    const data = await res.json()
    const text = data.choices?.[0]?.message?.content || ''

    try {
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const outfit = JSON.parse(cleaned)
      return NextResponse.json({ outfit })
    } catch {
      return NextResponse.json({ error: 'Could not parse response' }, { status: 500 })
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
