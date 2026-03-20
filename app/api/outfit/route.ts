import { NextRequest, NextResponse } from 'next/server'

const OPENAI_KEY = process.env.OPENAI_API_KEY!

export async function POST(req: NextRequest) {
  try {
    const { prompt, wardrobe, modelImage } = await req.json()
    if (!prompt || !wardrobe?.length) {
      return NextResponse.json({ error: 'Need a prompt and wardrobe items' }, { status: 400 })
    }

    // Step 1: Pick items from wardrobe
    const wardrobeSummary = wardrobe.map((item: { name: string; type: string; color: string; brand: string; occasions: string[]; price: string }, i: number) =>
      `${i + 1}. ${item.name} (${item.type}) — ${item.color}, ${item.brand}, ${item.price}, good for: ${item.occasions.join(', ')}`
    ).join('\n')

    const pickRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_KEY}` },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 500,
        messages: [
          { role: 'system', content: `You are a men's fashion stylist. Pick items from the user's wardrobe for an outfit. Return ONLY valid JSON.` },
          { role: 'user', content: `My wardrobe:\n${wardrobeSummary}\n\nOutfit for: ${prompt}\n\nReturn ONLY:\n{\n  "outfitName": "Catchy name",\n  "description": "2-3 sentences about the look",\n  "items": [1, 5, 11],\n  "styling_tips": "Brief tips",\n  "imagePrompt": "Detailed description of a young man wearing this exact outfit for AI image generation. Describe each clothing item specifically including brand, color, style. Full body shot, studio lighting, white background."\n}\n\nPick 3-5 items.` },
        ],
      }),
    })

    if (!pickRes.ok) return NextResponse.json({ error: 'AI styling failed' }, { status: 500 })

    const pickData = await pickRes.json()
    const pickText = pickData.choices?.[0]?.message?.content || ''
    let outfit
    try {
      outfit = JSON.parse(pickText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim())
    } catch {
      return NextResponse.json({ error: 'Could not parse outfit' }, { status: 500 })
    }

    // Step 2: Generate outfit mockup image
    let mockupImage: string | null = null
    try {
      const imagePrompt = modelImage
        ? `Fashion photo of a young man wearing this outfit: ${outfit.imagePrompt}. The person should be standing confidently, full body visible, clean studio white background, professional fashion photography lighting. High quality, photorealistic.`
        : `Professional fashion flat lay photograph on clean white background: ${outfit.imagePrompt}. Items arranged neatly as a styled outfit. Overhead shot, luxury fashion editorial style, clean and minimal.`

      const imgRes = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_KEY}` },
        body: JSON.stringify({
          model: 'gpt-image-1',
          prompt: imagePrompt,
          n: 1,
          size: '1024x1536',
          quality: 'high',
        }),
      })

      if (imgRes.ok) {
        const imgData = await imgRes.json()
        if (imgData.data?.[0]?.b64_json) {
          mockupImage = `data:image/png;base64,${imgData.data[0].b64_json}`
        } else if (imgData.data?.[0]?.url) {
          mockupImage = imgData.data[0].url
        }
      } else {
        console.error('Image gen failed:', await imgRes.text())
      }
    } catch (e) {
      console.error('Image gen error:', e)
    }

    return NextResponse.json({
      outfit: {
        ...outfit,
        mockupImage,
      },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
