import { NextRequest, NextResponse } from 'next/server'

const OPENAI_KEY = process.env.OPENAI_API_KEY!

export async function POST(req: NextRequest) {
  try {
    const { barcode } = await req.json()
    if (!barcode) return NextResponse.json({ error: 'No barcode' }, { status: 400 })

    // Use GPT-4o to look up the barcode and find the product
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 600,
        messages: [
          {
            role: 'system',
            content: `You are a product lookup AI for clothing items. Given a barcode/EAN number, identify the clothing product. If you recognize it, return details. If not, make your best guess based on common clothing barcodes. Return ONLY valid JSON.`,
          },
          {
            role: 'user',
            content: `Look up this barcode for a clothing item: ${barcode}

Return ONLY this JSON format:
{
  "name": "Product name (e.g. 'Nike Dri-FIT Running Tee')",
  "type": "Category (top/bottom/dress/outerwear/shoes/accessory)",
  "color": "Primary color",
  "material": "Fabric composition",
  "season": "Best season (spring/summer/autumn/winter/all)",
  "occasions": ["casual", "sport"],
  "brand": "Brand name",
  "price": "UK retail price as string e.g. '£29.99'",
  "priceValue": 29.99,
  "imageUrl": "URL to a high-res product image if you can find one, otherwise empty string",
  "productUrl": "URL to buy the product online, otherwise empty string",
  "searchQuery": "Google Shopping search query to find this product"
}`,
          },
        ],
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('OpenAI error:', err)
      return NextResponse.json({ error: 'Barcode lookup failed' }, { status: 500 })
    }

    const data = await res.json()
    const text = data.choices?.[0]?.message?.content || ''

    try {
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const item = JSON.parse(cleaned)
      return NextResponse.json({ item })
    } catch {
      return NextResponse.json({ error: 'Could not parse response', raw: text }, { status: 500 })
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
