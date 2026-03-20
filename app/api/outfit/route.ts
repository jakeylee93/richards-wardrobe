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
        max_tokens: 600,
        messages: [
          { role: 'system', content: `You are a men's fashion stylist. You MUST ONLY pick items from the user's wardrobe list below. Do NOT suggest any items not in the list. Return ONLY valid JSON.` },
          { role: 'user', content: `My wardrobe (ONLY pick from these):\n${wardrobeSummary}\n\nI need an outfit for: ${prompt}\n\nRules:\n- ONLY use items from the numbered list above\n- Pick 3-5 items that create a complete outfit\n- Include at least: 1 top, 1 bottom, 1 pair of shoes\n- Add accessories if appropriate\n\nReturn ONLY this JSON:\n{\n  "outfitName": "Catchy name for this look",\n  "description": "2-3 sentences about why these items work together",\n  "items": [2, 11, 16],\n  "styling_tips": "How to wear it — tuck/untuck, lacing, accessories placement",\n  "clothingDescription": "Detailed description of the EXACT items: e.g. White Stone Island compass patch t-shirt, indigo Levi's 501 jeans, white Nike Air Force 1 07 shoes, gold/green Ray-Ban aviator sunglasses"\n}` },
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

    // Step 2: Generate outfit mockup image using the model's actual photo
    let mockupImage: string | null = null
    try {
      const clothingDesc = outfit.clothingDescription || outfit.description

      if (modelImage) {
        // Use GPT-4o image editing with the person's actual photo as input
        // Convert data URL to base64 buffer for the API
        const base64Data = modelImage.replace(/^data:image\/\w+;base64,/, '')
        const imageBuffer = Buffer.from(base64Data, 'base64')

        // Use the images/edits endpoint with the person's photo
        const formData = new FormData()
        formData.append('model', 'gpt-image-1')
        formData.append('image', new Blob([imageBuffer], { type: 'image/png' }), 'model.png')
        formData.append('prompt', `Transform this person's outfit. Keep their EXACT face, hair, and body but dress them in: ${clothingDesc}. Full body shot, clean white studio background, fashion photography, natural pose, high quality. The person's face must remain exactly the same - only change their clothes.`)
        formData.append('size', '1024x1536')
        formData.append('quality', 'high')

        const imgRes = await fetch('https://api.openai.com/v1/images/edits', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${OPENAI_KEY}` },
          body: formData,
        })

        if (imgRes.ok) {
          const imgData = await imgRes.json()
          if (imgData.data?.[0]?.b64_json) {
            mockupImage = `data:image/png;base64,${imgData.data[0].b64_json}`
          } else if (imgData.data?.[0]?.url) {
            mockupImage = imgData.data[0].url
          }
        } else {
          const errText = await imgRes.text()
          console.error('Image edit failed:', errText)
          // Fallback to generation without model photo
          const fallbackRes = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_KEY}` },
            body: JSON.stringify({
              model: 'gpt-image-1',
              prompt: `Fashion photography of a young man wearing: ${clothingDesc}. Full body shot, standing confidently, clean white studio background, professional lighting. Photorealistic, high quality.`,
              n: 1,
              size: '1024x1536',
              quality: 'high',
            }),
          })
          if (fallbackRes.ok) {
            const fbData = await fallbackRes.json()
            if (fbData.data?.[0]?.b64_json) mockupImage = `data:image/png;base64,${fbData.data[0].b64_json}`
            else if (fbData.data?.[0]?.url) mockupImage = fbData.data[0].url
          }
        }
      } else {
        // No model photo — generate a flat lay
        const imgRes = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_KEY}` },
          body: JSON.stringify({
            model: 'gpt-image-1',
            prompt: `Professional fashion flat lay on clean white background: ${clothingDesc}. Items neatly arranged as a styled outfit. Overhead shot, luxury editorial style, minimal. Each item clearly visible and identifiable.`,
            n: 1,
            size: '1024x1536',
            quality: 'high',
          }),
        })

        if (imgRes.ok) {
          const imgData = await imgRes.json()
          if (imgData.data?.[0]?.b64_json) mockupImage = `data:image/png;base64,${imgData.data[0].b64_json}`
          else if (imgData.data?.[0]?.url) mockupImage = imgData.data[0].url
        }
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
