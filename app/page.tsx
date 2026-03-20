'use client'

import { useCallback, useRef, useState } from 'react'

type TabId = 'wardrobe' | 'outfits' | 'sell'

interface ClothingItem {
  id: string
  image: string // base64
  name: string
  type: string
  color: string
  material: string
  season: string
  occasions: string[]
  brand: string
  searchQuery: string
  addedAt: string
}

const TYPE_EMOJI: Record<string, string> = {
  top: '👕', bottom: '👖', dress: '👗', outerwear: '🧥',
  shoes: '👟', accessory: '💍', default: '🏷️',
}

function uid() { return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` }

export default function HomePage() {
  const [tab, setTab] = useState<TabId>('wardrobe')
  const [wardrobe, setWardrobe] = useState<ClothingItem[]>([])
  const [identifying, setIdentifying] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(async (file: File) => {
    const reader = new FileReader()
    reader.onload = async () => {
      const base64 = reader.result as string
      setCapturedImage(base64)
      setIdentifying(true)

      try {
        const res = await fetch('/api/identify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64 }),
        })
        const data = await res.json()
        if (data.item) {
          const newItem: ClothingItem = {
            id: uid(),
            image: base64,
            ...data.item,
            addedAt: new Date().toISOString(),
          }
          setWardrobe(prev => [newItem, ...prev])
          setCapturedImage(null)
        } else {
          alert('Could not identify the clothing item. Try a clearer photo.')
          setCapturedImage(null)
        }
      } catch {
        alert('Something went wrong. Please try again.')
        setCapturedImage(null)
      } finally {
        setIdentifying(false)
      }
    }
    reader.readAsDataURL(file)
  }, [])

  const categories = ['all', 'top', 'bottom', 'dress', 'outerwear', 'shoes', 'accessory']
  const [filterCat, setFilterCat] = useState('all')
  const filtered = filterCat === 'all' ? wardrobe : wardrobe.filter(i => i.type === filterCat)

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0a0a 0%, #141318 50%, #0e0c14 100%)',
      fontFamily: "'Inter', system-ui, sans-serif",
      color: '#fafaf9',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <header style={{
        padding: '52px 24px 20px',
        textAlign: 'center',
      }}>
        <div style={{
          fontSize: 11, letterSpacing: 4, textTransform: 'uppercase',
          color: '#c4a265', fontWeight: 600, marginBottom: 8,
        }}>Richard&apos;s</div>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 36, fontWeight: 400, margin: 0, letterSpacing: 1,
          fontStyle: 'italic',
        }}>Wardrobe</h1>
        <div style={{
          width: 40, height: 1, background: 'linear-gradient(90deg, transparent, #c4a265, transparent)',
          margin: '12px auto 0',
        }} />
      </header>

      {/* Add Button — Hero */}
      <div style={{ padding: '0 24px 20px', display: 'flex', gap: 12 }}>
        <button
          onClick={() => cameraInputRef.current?.click()}
          style={{
            flex: 1, padding: '16px',
            background: 'linear-gradient(135deg, #c4a265, #d4b87a)',
            border: 'none', borderRadius: 16, cursor: 'pointer',
            color: '#0a0a0a', fontWeight: 700, fontSize: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          📷 Take Photo
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            flex: 1, padding: '16px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, cursor: 'pointer',
            color: '#fafaf9', fontWeight: 600, fontSize: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          🖼️ Upload
        </button>
        <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }}
          onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }} />
        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }}
          onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }} />
      </div>

      {/* Identifying overlay */}
      {identifying && capturedImage && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 20, padding: 40,
        }}>
          <div style={{
            width: 200, height: 200, borderRadius: 24, overflow: 'hidden',
            border: '2px solid #c4a265',
          }}>
            <img src={capturedImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: 4, background: '#c4a265',
              animation: 'pulse 1s ease-in-out infinite',
            }} />
            <span style={{ fontSize: 15, fontWeight: 600, color: '#c4a265' }}>Identifying clothing...</span>
          </div>
          <p style={{ fontSize: 12, color: '#666', textAlign: 'center', maxWidth: 280 }}>
            AI is analyzing the photo to identify the item, colour, material, and find it online
          </p>
        </div>
      )}

      {/* Category Filter */}
      <div style={{
        padding: '0 24px 16px',
        display: 'flex', gap: 8, overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCat(cat)}
            style={{
              padding: '8px 16px', borderRadius: 20, fontSize: 12, fontWeight: 600,
              whiteSpace: 'nowrap', cursor: 'pointer', transition: 'all 0.2s',
              background: filterCat === cat ? '#c4a265' : 'rgba(255,255,255,0.05)',
              color: filterCat === cat ? '#0a0a0a' : '#888',
              border: filterCat === cat ? 'none' : '1px solid rgba(255,255,255,0.08)',
              textTransform: 'capitalize',
            }}
          >
            {cat === 'all' ? 'All Items' : `${TYPE_EMOJI[cat] || ''} ${cat}`}
          </button>
        ))}
      </div>

      {/* Wardrobe Grid */}
      <div style={{ flex: 1, padding: '0 24px 140px' }}>
        {tab === 'wardrobe' && (
          <>
            {filtered.length === 0 && !identifying && (
              <div style={{
                textAlign: 'center', padding: '60px 20px',
              }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>👗</div>
                <h2 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 22, fontWeight: 400, fontStyle: 'italic', marginBottom: 8,
                }}>Your wardrobe is empty</h2>
                <p style={{ fontSize: 13, color: '#666', maxWidth: 260, margin: '0 auto' }}>
                  Take a photo of any clothing item — even while you&apos;re wearing it — and AI will identify it and add it here
                </p>
              </div>
            )}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 14,
            }}>
              {filtered.map(item => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  style={{
                    borderRadius: 20, overflow: 'hidden',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    cursor: 'pointer', transition: 'transform 0.2s',
                  }}
                >
                  <div style={{ aspectRatio: '3/4', overflow: 'hidden' }}>
                    <img src={item.image} alt={item.name} style={{
                      width: '100%', height: '100%', objectFit: 'cover',
                    }} />
                  </div>
                  <div style={{ padding: '12px 14px' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2, lineHeight: 1.3 }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: 11, color: '#888' }}>
                      {item.color} · {item.material}
                    </div>
                    {item.brand !== 'Unknown' && (
                      <div style={{ fontSize: 11, color: '#c4a265', fontWeight: 600, marginTop: 4 }}>
                        {item.brand}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 'outfits' && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✨</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 400, fontStyle: 'italic', marginBottom: 8 }}>
              AI Outfit Generator
            </h2>
            <p style={{ fontSize: 13, color: '#666', maxWidth: 280, margin: '0 auto' }}>
              Add items to your wardrobe first, then tell the AI where you&apos;re going and it&apos;ll create the perfect outfit from your clothes
            </p>
          </div>
        )}

        {tab === 'sell' && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🛍️</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 400, fontStyle: 'italic', marginBottom: 8 }}>
              Sell to Friends
            </h2>
            <p style={{ fontSize: 13, color: '#666', maxWidth: 280, margin: '0 auto' }}>
              Done with something? List it and your friends can buy it directly. No strangers, no fees.
            </p>
          </div>
        )}
      </div>

      {/* Item Detail Modal */}
      {selectedItem && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 99999,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)',
          }}
          onClick={() => setSelectedItem(null)}
        >
          <div
            style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              background: '#1a1a1f', borderRadius: '24px 24px 0 0',
              maxHeight: '88vh', overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Drag handle */}
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 10, paddingBottom: 4 }}>
              <div style={{ width: 40, height: 4, borderRadius: 2, background: '#333' }} />
            </div>

            {/* Image */}
            <div style={{ padding: '0 20px', marginBottom: 16 }}>
              <div style={{ borderRadius: 20, overflow: 'hidden', aspectRatio: '4/5' }}>
                <img src={selectedItem.image} alt={selectedItem.name} style={{
                  width: '100%', height: '100%', objectFit: 'cover',
                }} />
              </div>
            </div>

            {/* Details */}
            <div style={{ padding: '0 24px 24px' }}>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 24, fontWeight: 400, margin: '0 0 4px', fontStyle: 'italic',
              }}>{selectedItem.name}</h2>
              {selectedItem.brand !== 'Unknown' && (
                <div style={{ fontSize: 13, color: '#c4a265', fontWeight: 600, marginBottom: 12 }}>
                  {selectedItem.brand}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                <DetailPill label="Colour" value={selectedItem.color} />
                <DetailPill label="Material" value={selectedItem.material} />
                <DetailPill label="Type" value={selectedItem.type} />
                <DetailPill label="Season" value={selectedItem.season} />
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, fontWeight: 600 }}>
                  Best for
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {selectedItem.occasions.map(o => (
                    <span key={o} style={{
                      padding: '5px 12px', borderRadius: 20, fontSize: 12,
                      background: 'rgba(196,162,101,0.1)', color: '#c4a265',
                      border: '1px solid rgba(196,162,101,0.2)', fontWeight: 500,
                      textTransform: 'capitalize',
                    }}>{o}</span>
                  ))}
                </div>
              </div>

              <a
                href={`https://www.google.com/search?q=${encodeURIComponent(selectedItem.searchQuery)}&tbm=shop`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  width: '100%', padding: 16, borderRadius: 16,
                  background: 'linear-gradient(135deg, #c4a265, #d4b87a)',
                  color: '#0a0a0a', fontWeight: 700, fontSize: 14,
                  textDecoration: 'none', marginBottom: 12,
                }}
              >
                🔍 Find Online
              </a>

              <button
                onClick={() => {
                  setWardrobe(prev => prev.filter(i => i.id !== selectedItem.id))
                  setSelectedItem(null)
                }}
                style={{
                  width: '100%', padding: 14, borderRadius: 16,
                  background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                  color: '#ef4444', fontWeight: 600, fontSize: 13, cursor: 'pointer',
                  marginBottom: 'max(12px, env(safe-area-inset-bottom))',
                }}
              >
                Remove from Wardrobe
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Bar */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(10,10,10,0.95)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', justifyContent: 'center',
        paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
        paddingTop: 10, zIndex: 100,
      }}>
        <div style={{ display: 'flex', maxWidth: 400, width: '100%', justifyContent: 'space-around' }}>
          {([
            { id: 'wardrobe' as TabId, emoji: '👗', label: 'Wardrobe' },
            { id: 'outfits' as TabId, emoji: '✨', label: 'Outfits' },
            { id: 'sell' as TabId, emoji: '🛍️', label: 'Sell' },
          ]).map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '4px 20px', opacity: tab === t.id ? 1 : 0.4,
                transition: 'opacity 0.2s',
              }}
            >
              <span style={{ fontSize: 20 }}>{t.emoji}</span>
              <span style={{
                fontSize: 10, fontWeight: tab === t.id ? 700 : 500,
                color: tab === t.id ? '#c4a265' : '#888',
              }}>{t.label}</span>
              {tab === t.id && (
                <div style={{ width: 4, height: 4, borderRadius: 2, background: '#c4a265' }} />
              )}
            </button>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  )
}

function DetailPill({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 14, padding: '10px 14px',
    }}>
      <div style={{ fontSize: 10, color: '#666', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, marginBottom: 2 }}>
        {label}
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, textTransform: 'capitalize' }}>{value}</div>
    </div>
  )
}
