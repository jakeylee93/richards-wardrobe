import { NextRequest, NextResponse } from 'next/server'

const OPENAI_KEY = process.env.OPENAI_API_KEY!

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json() // base64 data URL

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

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
            role: 'user',
            content: [
              {
                type: 'text',
                text: `You are a fashion AI. Analyze this clothing item photo and return ONLY valid JSON with these fields:
{
  "name": "Short descriptive name (e.g. 'Black Ribbed Crop Top')",
  "type": "Category (top/bottom/dress/outerwear/shoes/accessory)",
  "color": "Primary color",
  "material": "Best guess at fabric (cotton, polyester, denim, leather, etc.)",
  "season": "Best seasons to wear (spring/summer/autumn/winter or all)",
  "occasions": ["casual", "smart", "formal", "sport", "night out"],
  "brand": "Brand if visible, otherwise 'Unknown'",
  "searchQuery": "A search query to find this exact item or similar online"
}
Return ONLY the JSON, no markdown, no explanation.`,
              },
              {
                type: 'image_url',
                image_url: { url: image },
              },
            ],
          },
        ],
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('OpenAI error:', err)
      return NextResponse.json({ error: 'AI identification failed' }, { status: 500 })
    }

    const data = await res.json()
    const text = data.choices?.[0]?.message?.content || ''

    // Parse JSON from response
    try {
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const item = JSON.parse(cleaned)
      return NextResponse.json({ item })
    } catch {
      return NextResponse.json({ error: 'Could not parse AI response', raw: text }, { status: 500 })
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
