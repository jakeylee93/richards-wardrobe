'use client'

import { useCallback, useRef, useState, useEffect } from 'react'
import { SEED_WARDROBE, SeedItem } from '@/lib/seed-wardrobe'

type TabId = 'wardrobe' | 'outfits' | 'sell'

interface ClothingItem extends SeedItem {
  id: string
  addedAt: string
}

function uid() { return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` }

/* ── SVG Icons ── */
const Icons = {
  hanger: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7l7 4.5c1.33.86 1.33 2.64 0 3.5L13 19.5a2.35 2.35 0 0 1-2 0L4 15c-1.33-.86-1.33-2.64 0-3.5L11 7V5.73A2 2 0 0 1 12 2z"/></svg>,
  sparkle: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z"/></svg>,
  tag: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
  barcode: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="4" width="2" height="16"/><rect x="6" y="4" width="1" height="16"/><rect x="9" y="4" width="2" height="16"/><rect x="14" y="4" width="1" height="16"/><rect x="17" y="4" width="2" height="16"/><rect x="21" y="4" width="1" height="16"/></svg>,
  camera: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  upload: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  search: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  x: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  chevron: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  shirt: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20.38 3.46L16 2H8L3.62 3.46a2 2 0 0 0-1.34 1.25L1 8l3 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10l3-2-1.28-3.29a2 2 0 0 0-1.34-1.25z"/></svg>,
  trash: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
}

const TYPE_LABELS: Record<string, string> = {
  all: 'All', top: 'Tops', bottom: 'Bottoms', dress: 'Dresses',
  outerwear: 'Outerwear', shoes: 'Shoes', accessory: 'Accessories',
}

interface OutfitResult {
  outfitName: string
  description: string
  items: number[]
  styling_tips: string
  mockupImage?: string | null
}

export default function HomePage() {
  const [tab, setTab] = useState<TabId>('wardrobe')
  const [wardrobe, setWardrobe] = useState<ClothingItem[]>([])
  const [identifying, setIdentifying] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null)
  const [filterCat, setFilterCat] = useState('all')
  const [outfitPrompt, setOutfitPrompt] = useState('')
  const [outfitLoading, setOutfitLoading] = useState(false)
  const [outfitResult, setOutfitResult] = useState<OutfitResult | null>(null)
  const [modelImage, setModelImage] = useState<string | null>(null)
  const modelInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  // Seed wardrobe on first load
  useEffect(() => {
    if (wardrobe.length === 0) {
      const seeded: ClothingItem[] = SEED_WARDROBE.map(item => ({
        ...item,
        id: uid(),
        addedAt: new Date().toISOString(),
      }))
      setWardrobe(seeded)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleFile = useCallback(async (file: File) => {
    const reader = new FileReader()
    reader.onload = async () => {
      const base64 = reader.result as string
      setCapturedImage(base64)
      setIdentifying(true)
      try {
        const res = await fetch('/api/identify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image: base64 }) })
        const data = await res.json()
        if (data.item) {
          const newItem: ClothingItem = { id: uid(), image: base64, ...data.item, addedAt: new Date().toISOString() }
          setWardrobe(prev => [newItem, ...prev])
        } else { alert('Could not identify. Try a clearer photo.') }
        setCapturedImage(null)
      } catch { alert('Something went wrong.'); setCapturedImage(null) }
      finally { setIdentifying(false) }
    }
    reader.readAsDataURL(file)
  }, [])

  async function generateOutfit() {
    if (!outfitPrompt.trim() || wardrobe.length < 3) return
    setOutfitLoading(true)
    setOutfitResult(null)
    try {
      const res = await fetch('/api/outfit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: outfitPrompt, wardrobe, modelImage }),
      })
      const data = await res.json()
      if (data.outfit) setOutfitResult(data.outfit)
      else alert('Could not generate outfit. Try again.')
    } catch { alert('Something went wrong.') }
    finally { setOutfitLoading(false) }
  }

  function handleModelUpload(file: File) {
    const reader = new FileReader()
    reader.onload = () => setModelImage(reader.result as string)
    reader.readAsDataURL(file)
  }

  const filtered = filterCat === 'all' ? wardrobe : wardrobe.filter(i => i.type === filterCat)
  const totalValue = wardrobe.reduce((s, i) => s + (i.priceValue || 0), 0)

  return (
    <div style={{ minHeight: '100vh', background: '#fafaf8', fontFamily: "'Inter', system-ui, sans-serif", color: '#1a1a1a' }}>

      {/* Header */}
      <header style={{ padding: '52px 24px 16px', textAlign: 'center', background: '#fff', borderBottom: '1px solid #f0ede8' }}>
        <div style={{ fontSize: 11, letterSpacing: 5, textTransform: 'uppercase', color: '#b8a080', fontWeight: 600, marginBottom: 4 }}>
          Mitch&apos;s
        </div>
        <h1 style={{ fontFamily: "'Playfair Display', 'Georgia', serif", fontSize: 32, fontWeight: 400, margin: 0, letterSpacing: 2, fontStyle: 'italic' }}>
          Wardrobe
        </h1>
        <div style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
          {wardrobe.length} items · £{totalValue.toLocaleString('en-GB', { minimumFractionDigits: 0 })} collection
        </div>
      </header>

      {/* Action buttons */}
      <div style={{ padding: '16px 20px 12px', display: 'flex', gap: 10, background: '#fff' }}>
        <button onClick={() => cameraInputRef.current?.click()} style={{
          flex: 1, padding: '13px 8px', background: '#1a1a1a', border: 'none', borderRadius: 12,
          color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
        }}>
          {Icons.camera} Snap
        </button>
        <button onClick={() => fileInputRef.current?.click()} style={{
          flex: 1, padding: '13px 8px', background: '#f5f3ef', border: '1px solid #e8e4dd', borderRadius: 12,
          color: '#1a1a1a', fontWeight: 600, fontSize: 13, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
        }}>
          {Icons.upload} Upload
        </button>
        <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }} />
        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }} />
      </div>

      {/* Identifying overlay */}
      {identifying && capturedImage && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
          <div style={{ width: 180, height: 180, borderRadius: 24, overflow: 'hidden', border: '2px solid #e8e4dd', boxShadow: '0 20px 60px rgba(0,0,0,0.1)' }}>
            <img src={capturedImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: 4, background: '#b8a080', animation: 'pulse 1s ease-in-out infinite' }} />
            <span style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a' }}>Identifying item...</span>
          </div>
        </div>
      )}

      {/* Content based on tab */}
      <div style={{ padding: '0 0 120px' }}>

        {tab === 'wardrobe' && (
          <>
            {/* Category pills */}
            <div style={{ padding: '14px 20px', display: 'flex', gap: 8, overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              {Object.entries(TYPE_LABELS).map(([key, label]) => (
                <button key={key} onClick={() => setFilterCat(key)} style={{
                  padding: '8px 18px', borderRadius: 24, fontSize: 12, fontWeight: 600,
                  whiteSpace: 'nowrap', cursor: 'pointer', transition: 'all 0.2s',
                  background: filterCat === key ? '#1a1a1a' : '#fff',
                  color: filterCat === key ? '#fff' : '#888',
                  border: filterCat === key ? 'none' : '1px solid #e8e4dd',
                }}>{label}</button>
              ))}
            </div>

            {/* Grid */}
            <div style={{ padding: '0 16px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {filtered.map(item => (
                <div key={item.id} onClick={() => setSelectedItem(item)} style={{
                  borderRadius: 16, overflow: 'hidden', background: '#fff',
                  border: '1px solid #f0ede8', cursor: 'pointer',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                  transition: 'transform 0.15s',
                }}>
                  <div style={{ aspectRatio: '3/4', overflow: 'hidden', background: '#f5f3ef', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    {item.image ? (
                      <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    ) : (
                      <span style={{ fontSize: 40, opacity: 0.3 }}>{Icons.shirt}</span>
                    )}
                    {item.price && (
                      <div style={{ position: 'absolute', top: 10, right: 10, background: '#fff', borderRadius: 8, padding: '4px 10px', fontSize: 12, fontWeight: 700, color: '#1a1a1a', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                        {item.price}
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '12px 14px 14px' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3, lineHeight: 1.3 }}>{item.name}</div>
                    <div style={{ fontSize: 11, color: '#b8a080', fontWeight: 600 }}>{item.brand}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 'outfits' && (
          <div style={{ padding: '20px' }}>
            {/* Model Upload */}
            <div style={{ background: '#fff', borderRadius: 20, padding: 20, border: '1px solid #f0ede8', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div
                onClick={() => modelInputRef.current?.click()}
                style={{
                  width: 64, height: 64, borderRadius: 20, flexShrink: 0,
                  background: modelImage ? 'none' : '#f5f3ef',
                  border: modelImage ? '2px solid #b8a080' : '2px dashed #ddd',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', overflow: 'hidden',
                }}
              >
                {modelImage ? (
                  <img src={modelImage} alt="Model" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: 24, opacity: 0.3 }}>👤</span>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>
                  {modelImage ? 'Model set ✓' : 'Set your model'}
                </div>
                <div style={{ fontSize: 12, color: '#999' }}>
                  {modelImage ? 'Outfits will be mocked up on you' : 'Upload a full-body photo to try outfits on'}
                </div>
              </div>
              <input ref={modelInputRef} type="file" accept="image/*" style={{ display: 'none' }}
                onChange={e => { if (e.target.files?.[0]) handleModelUpload(e.target.files[0]) }} />
            </div>

            {/* Style Prompt */}
            <div style={{ background: '#fff', borderRadius: 20, padding: 24, border: '1px solid #f0ede8', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 400, fontStyle: 'italic', marginBottom: 4, marginTop: 0 }}>Style me</h2>
              <p style={{ fontSize: 13, color: '#999', marginBottom: 20 }}>Tell me where you&apos;re going and I&apos;ll create the perfect outfit from your wardrobe</p>
              <input
                type="text"
                value={outfitPrompt}
                onChange={e => setOutfitPrompt(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && generateOutfit()}
                placeholder="e.g. 20°C, drinks with mates, smart casual"
                style={{
                  width: '100%', padding: '14px 16px', borderRadius: 14,
                  border: '1px solid #e8e4dd', fontSize: 14, outline: 'none',
                  fontFamily: 'inherit', background: '#fafaf8', boxSizing: 'border-box',
                }}
              />
              <button
                onClick={generateOutfit}
                disabled={outfitLoading || !outfitPrompt.trim()}
                style={{
                  width: '100%', padding: 15, borderRadius: 14, marginTop: 12,
                  background: outfitPrompt.trim() ? '#1a1a1a' : '#e8e4dd',
                  color: outfitPrompt.trim() ? '#fff' : '#999',
                  border: 'none', fontWeight: 700, fontSize: 14,
                  cursor: outfitPrompt.trim() ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                {outfitLoading ? (
                  <span>
                    {modelImage ? '✨ Styling & generating mockup...' : '✨ Generating outfit...'}
                  </span>
                ) : (
                  <>{Icons.sparkle} Make my outfit</>
                )}
              </button>
            </div>

            {/* Outfit result */}
            {outfitResult && (
              <div style={{ marginTop: 20, background: '#fff', borderRadius: 20, overflow: 'hidden', border: '1px solid #f0ede8' }}>
                {/* Mockup Image */}
                {outfitResult.mockupImage && (
                  <div style={{ aspectRatio: '2/3', background: '#f5f3ef', overflow: 'hidden' }}>
                    <img src={outfitResult.mockupImage} alt={outfitResult.outfitName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}

                <div style={{ padding: 24 }}>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontStyle: 'italic', fontWeight: 400, marginTop: 0, marginBottom: 4 }}>
                    {outfitResult.outfitName}
                  </h3>
                  <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6, marginBottom: 20 }}>{outfitResult.description}</p>

                  {/* Item list */}
                  <div style={{ fontSize: 10, color: '#999', textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 700, marginBottom: 10 }}>The Look</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                    {outfitResult.items.map(idx => {
                      const item = wardrobe[idx - 1]
                      if (!item) return null
                      return (
                        <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fafaf8', borderRadius: 14, padding: 10, border: '1px solid #f0ede8' }}>
                          <div style={{ width: 56, height: 56, borderRadius: 12, overflow: 'hidden', background: '#f0ede8', flexShrink: 0 }}>
                            {item.image && <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 1 }}>{item.name}</div>
                            <div style={{ fontSize: 11, color: '#b8a080' }}>{item.brand}</div>
                          </div>
                          <div style={{ fontSize: 14, fontWeight: 800, flexShrink: 0 }}>{item.price}</div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Total */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderTop: '1px solid #f0ede8', marginBottom: 16 }}>
                    <span style={{ fontSize: 13, color: '#999' }}>Outfit total</span>
                    <span style={{ fontSize: 20, fontWeight: 800 }}>
                      £{outfitResult.items.reduce((s, idx) => s + (wardrobe[idx - 1]?.priceValue || 0), 0).toLocaleString('en-GB')}
                    </span>
                  </div>

                  <div style={{ padding: '14px 16px', background: '#fafaf8', borderRadius: 14, fontSize: 13, color: '#666', lineHeight: 1.6, border: '1px solid #f0ede8' }}>
                    💡 {outfitResult.styling_tips}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'sell' && (
          <div style={{ padding: '60px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 20, opacity: 0.3 }}>{Icons.tag}</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 400, fontStyle: 'italic', marginBottom: 8 }}>Sell to Friends</h2>
            <p style={{ fontSize: 13, color: '#999', maxWidth: 260, margin: '0 auto' }}>
              Done with something? List it and your mates can buy it. No strangers, no fees.
            </p>
          </div>
        )}
      </div>

      {/* Item Detail Modal */}
      {selectedItem && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)' }} onClick={() => setSelectedItem(null)}>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#fff', borderRadius: '24px 24px 0 0', maxHeight: '90vh', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 10 }}>
              <div style={{ width: 40, height: 4, borderRadius: 2, background: '#e0ddd6' }} />
            </div>
            <div style={{ padding: '8px 20px 12px', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectedItem(null)} style={{ background: '#f5f3ef', border: 'none', borderRadius: 20, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#999' }}>{Icons.x}</button>
            </div>
            <div style={{ padding: '0 20px' }}>
              <div style={{ borderRadius: 20, overflow: 'hidden', aspectRatio: '4/5', background: '#f5f3ef', marginBottom: 20 }}>
                {selectedItem.image && <img src={selectedItem.image} alt={selectedItem.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>
            </div>
            <div style={{ padding: '0 24px 32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 400, margin: 0, fontStyle: 'italic', flex: 1 }}>{selectedItem.name}</h2>
                {selectedItem.price && <span style={{ fontSize: 22, fontWeight: 800, flexShrink: 0, marginLeft: 16 }}>{selectedItem.price}</span>}
              </div>
              <div style={{ fontSize: 13, color: '#b8a080', fontWeight: 600, marginBottom: 16 }}>{selectedItem.brand}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                {[
                  { l: 'Colour', v: selectedItem.color },
                  { l: 'Material', v: selectedItem.material },
                  { l: 'Season', v: selectedItem.season },
                  { l: 'Type', v: selectedItem.type },
                ].map(d => (
                  <div key={d.l} style={{ background: '#fafaf8', borderRadius: 14, padding: '10px 14px', border: '1px solid #f0ede8' }}>
                    <div style={{ fontSize: 10, color: '#999', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, marginBottom: 2 }}>{d.l}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, textTransform: 'capitalize' }}>{d.v}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 10, color: '#999', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, marginBottom: 8 }}>Best for</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {selectedItem.occasions.map(o => (
                    <span key={o} style={{ padding: '5px 14px', borderRadius: 20, fontSize: 12, background: '#f5f3ef', border: '1px solid #e8e4dd', fontWeight: 500, textTransform: 'capitalize' }}>{o}</span>
                  ))}
                </div>
              </div>
              <a href={`https://www.google.com/search?q=${encodeURIComponent(selectedItem.searchQuery)}&tbm=shop`} target="_blank" rel="noopener noreferrer" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: 16, borderRadius: 14, background: '#1a1a1a', color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none', marginBottom: 12,
              }}>
                {Icons.search} Find Online
              </a>
              <button onClick={() => { setWardrobe(prev => prev.filter(i => i.id !== selectedItem.id)); setSelectedItem(null) }} style={{
                width: '100%', padding: 14, borderRadius: 14, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 'max(12px, env(safe-area-inset-bottom))',
              }}>
                {Icons.trash} Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Bar */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid #f0ede8',
        display: 'flex', justifyContent: 'center',
        paddingBottom: 'max(12px, env(safe-area-inset-bottom))', paddingTop: 10, zIndex: 100,
      }}>
        <div style={{ display: 'flex', maxWidth: 400, width: '100%', justifyContent: 'space-around' }}>
          {([
            { id: 'wardrobe' as TabId, icon: Icons.hanger, label: 'Wardrobe' },
            { id: 'outfits' as TabId, icon: Icons.sparkle, label: 'Outfits' },
            { id: 'sell' as TabId, icon: Icons.tag, label: 'Sell' },
          ]).map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              background: 'none', border: 'none', cursor: 'pointer', padding: '4px 20px',
              color: tab === t.id ? '#1a1a1a' : '#ccc', transition: 'color 0.2s',
            }}>
              {t.icon}
              <span style={{ fontSize: 10, fontWeight: tab === t.id ? 700 : 500, letterSpacing: 0.5 }}>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        body { -webkit-font-smoothing: antialiased; }
      `}</style>
    </div>
  )
}
