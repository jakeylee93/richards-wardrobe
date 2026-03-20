export interface SeedItem {
  name: string
  type: string
  color: string
  material: string
  season: string
  occasions: string[]
  brand: string
  price: string
  priceValue: number
  image: string
  searchQuery: string
}

export const SEED_WARDROBE: SeedItem[] = [
  // TOPS
  { name: 'Paint Drip Trucker Hat', type: 'accessory', color: 'Black', material: 'Cotton/Mesh', season: 'all', occasions: ['casual', 'streetwear'], brand: 'AMIRI', price: '£295', priceValue: 295, image: '/products/amiri-hat.jpg', searchQuery: 'AMIRI paint drip trucker hat black' },
  { name: 'Compass Patch T-Shirt', type: 'top', color: 'White', material: '100% Cotton', season: 'summer', occasions: ['casual', 'streetwear'], brand: 'Stone Island', price: '£165', priceValue: 165, image: '/products/stone-island-tee.jpg', searchQuery: 'Stone Island compass patch t-shirt white' },
  { name: 'Essentials Tee', type: 'top', color: 'Cream', material: '100% Cotton', season: 'all', occasions: ['casual', 'streetwear'], brand: 'Fear of God', price: '£90', priceValue: 90, image: '/products/fog-essentials-tee.jpg', searchQuery: 'Fear of God Essentials cream t-shirt' },
  { name: 'Polo Bear Knit Sweater', type: 'top', color: 'Navy', material: 'Cotton Blend', season: 'autumn', occasions: ['smart casual', 'casual'], brand: 'Ralph Lauren', price: '£329', priceValue: 329, image: '/products/ralph-lauren-bear.jpg', searchQuery: 'Ralph Lauren polo bear navy sweater' },
  { name: 'Box Logo Tee', type: 'top', color: 'Red', material: '100% Cotton', season: 'all', occasions: ['casual', 'streetwear'], brand: 'Supreme', price: '£148', priceValue: 148, image: '/products/supreme-box-logo.jpg', searchQuery: 'Supreme box logo tee red' },
  { name: 'Club Fleece Hoodie', type: 'top', color: 'Black', material: 'Cotton Fleece', season: 'autumn', occasions: ['casual', 'sport'], brand: 'Nike', price: '£59.99', priceValue: 59.99, image: '/products/nike-hoodie.jpg', searchQuery: 'Nike club fleece hoodie black' },
  { name: 'Trefoil Crew Sweatshirt', type: 'top', color: 'Grey Heather', material: 'French Terry', season: 'autumn', occasions: ['casual', 'sport'], brand: 'adidas Originals', price: '£55', priceValue: 55, image: '/products/adidas-crew.jpg', searchQuery: 'adidas originals trefoil crew sweatshirt grey' },
  { name: 'G9 Harrington Jacket', type: 'outerwear', color: 'Tan', material: 'Cotton', season: 'spring', occasions: ['smart casual', 'casual'], brand: 'Baracuta', price: '£395', priceValue: 395, image: '/products/baracuta-g9.jpg', searchQuery: 'Baracuta G9 harrington jacket tan' },
  { name: '1996 Retro Nuptse Jacket', type: 'outerwear', color: 'Black', material: 'Nylon/700 Fill Down', season: 'winter', occasions: ['casual', 'streetwear'], brand: 'The North Face', price: '£290', priceValue: 290, image: '/products/tnf-nuptse.jpg', searchQuery: 'North Face 1996 retro nuptse jacket black' },
  { name: 'Wool Blend Overcoat', type: 'outerwear', color: 'Camel', material: 'Wool Blend', season: 'winter', occasions: ['smart', 'formal'], brand: 'COS', price: '£175', priceValue: 175, image: '/products/cos-overcoat.jpg', searchQuery: 'COS camel wool overcoat' },
  // BOTTOMS
  { name: '501 Original Fit Jeans', type: 'bottom', color: 'Indigo', material: '100% Cotton Denim', season: 'all', occasions: ['casual'], brand: "Levi's", price: '£95', priceValue: 95, image: '/products/levis-501.jpg', searchQuery: "Levi's 501 original fit jeans indigo" },
  { name: 'Tech Fleece Joggers', type: 'bottom', color: 'Black', material: 'Tech Fleece', season: 'all', occasions: ['casual', 'sport'], brand: 'Nike', price: '£89.99', priceValue: 89.99, image: '/products/nike-tech-fleece.jpg', searchQuery: 'Nike tech fleece joggers black' },
  { name: 'Aviation Cargo Pant', type: 'bottom', color: 'Cypress', material: 'Cotton Ripstop', season: 'all', occasions: ['casual', 'streetwear'], brand: 'Carhartt WIP', price: '£119', priceValue: 119, image: '/products/carhartt-cargo.jpg', searchQuery: 'Carhartt WIP aviation cargo pant cypress' },
  { name: 'Slim Fit Chinos', type: 'bottom', color: 'Beige', material: 'Stretch Cotton', season: 'spring', occasions: ['smart casual', 'casual'], brand: 'Polo Ralph Lauren', price: '£125', priceValue: 125, image: '/products/ralph-chinos.jpg', searchQuery: 'Ralph Lauren slim fit chinos beige' },
  { name: 'Gale Tailored Trousers', type: 'bottom', color: 'Charcoal', material: 'Wool Blend', season: 'autumn', occasions: ['smart', 'formal'], brand: 'Reiss', price: '£148', priceValue: 148, image: '/products/reiss-trousers.jpg', searchQuery: 'Reiss Gale tailored trousers charcoal' },
  // SHOES
  { name: 'Air Force 1 07', type: 'shoes', color: 'White', material: 'Full Grain Leather', season: 'all', occasions: ['casual', 'streetwear'], brand: 'Nike', price: '£109.99', priceValue: 109.99, image: '/products/nike-af1.jpg', searchQuery: 'Nike Air Force 1 07 white' },
  { name: 'Yeezy Boost 350 V2', type: 'shoes', color: 'Bone', material: 'Primeknit', season: 'all', occasions: ['casual', 'streetwear'], brand: 'adidas Yeezy', price: '£220', priceValue: 220, image: '/products/yeezy-350.jpg', searchQuery: 'adidas Yeezy Boost 350 V2 Bone' },
  { name: 'Chelsea Boot', type: 'shoes', color: 'Black', material: 'Italian Suede', season: 'autumn', occasions: ['smart casual', 'smart'], brand: 'Common Projects', price: '£485', priceValue: 485, image: '/products/common-projects-chelsea.jpg', searchQuery: 'Common Projects chelsea boot suede black' },
  { name: '550', type: 'shoes', color: 'White/Green', material: 'Leather', season: 'all', occasions: ['casual', 'streetwear'], brand: 'New Balance', price: '£110', priceValue: 110, image: '/products/nb-550.jpg', searchQuery: 'New Balance 550 white green' },
  { name: 'Old Skool', type: 'shoes', color: 'Black/White', material: 'Canvas/Suede', season: 'all', occasions: ['casual'], brand: 'Vans', price: '£65', priceValue: 65, image: '/products/vans-old-skool.jpg', searchQuery: 'Vans Old Skool black white' },
  // ACCESSORIES
  { name: 'LV Initiales 40mm Belt', type: 'accessory', color: 'Monogram Brown', material: 'Coated Canvas/Leather', season: 'all', occasions: ['smart', 'smart casual'], brand: 'Louis Vuitton', price: '£450', priceValue: 450, image: '/products/lv-belt.jpg', searchQuery: 'Louis Vuitton LV initiales belt monogram' },
  { name: 'Submariner Date 41mm', type: 'accessory', color: 'Black/Oystersteel', material: 'Oystersteel', season: 'all', occasions: ['smart', 'formal', 'casual'], brand: 'Rolex', price: '£7,500', priceValue: 7500, image: '/products/rolex-sub.jpg', searchQuery: 'Rolex Submariner Date 126610LN' },
  { name: 'Aviator Classic', type: 'accessory', color: 'Gold/Green', material: 'Metal/Crystal', season: 'summer', occasions: ['casual', 'smart casual'], brand: 'Ray-Ban', price: '£159', priceValue: 159, image: '/products/rayban-aviator.jpg', searchQuery: 'Ray-Ban aviator classic RB3025 gold green' },
  { name: 'Classic Sport Cap', type: 'accessory', color: 'Navy', material: 'Cotton Chino', season: 'all', occasions: ['casual', 'sport'], brand: 'Polo Ralph Lauren', price: '£49', priceValue: 49, image: '/products/ralph-cap.jpg', searchQuery: 'Ralph Lauren classic sport cap navy' },
  // SMART
  { name: 'Slim Fit Oxford Shirt', type: 'top', color: 'Light Blue', material: 'Oxford Cotton', season: 'all', occasions: ['smart casual', 'smart'], brand: 'Charles Tyrwhitt', price: '£49.95', priceValue: 49.95, image: '/products/tyrwhitt-oxford.jpg', searchQuery: 'Charles Tyrwhitt slim fit oxford shirt blue' },
  { name: 'Belper Polo Shirt', type: 'top', color: 'Black', material: 'Extra Fine Merino', season: 'autumn', occasions: ['smart casual', 'smart'], brand: 'John Smedley', price: '£175', priceValue: 175, image: '/products/smedley-polo.jpg', searchQuery: 'John Smedley Belper polo shirt black' },
  { name: 'Burlington V-Neck Sweater', type: 'top', color: 'Fumo Grey', material: '100% Cashmere', season: 'winter', occasions: ['smart casual', 'smart'], brand: 'N.Peal', price: '£229', priceValue: 229, image: '/products/npeal-vneck.jpg', searchQuery: 'N.Peal Burlington cashmere v-neck fumo grey' },
  { name: 'Blanks Heavyweight Crew', type: 'top', color: 'Vintage Black', material: 'Heavyweight Cotton', season: 'all', occasions: ['casual', 'streetwear'], brand: 'Represent', price: '£80', priceValue: 80, image: '/products/represent-crew.jpg', searchQuery: 'Represent blanks heavyweight crew vintage black' },
  { name: 'Bulldog Swim Shorts', type: 'bottom', color: 'Navy', material: 'Quick-Dry Nylon', season: 'summer', occasions: ['casual', 'holiday'], brand: 'Orlebar Brown', price: '£175', priceValue: 175, image: '/products/orlebar-swim.jpg', searchQuery: 'Orlebar Brown Bulldog swim shorts navy' },
  { name: 'Classic Track Jacket', type: 'outerwear', color: 'Black', material: 'Technical Jersey', season: 'spring', occasions: ['casual', 'sport', 'streetwear'], brand: 'Palm Angels', price: '£395', priceValue: 395, image: '/products/palm-angels-track.jpg', searchQuery: 'Palm Angels classic track jacket black' },
]
