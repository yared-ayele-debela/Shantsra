export const CATEGORIES = [
  { name: 'Documents', icon: 'FileText' },
  { name: 'Coffee & Spices', icon: 'Coffee' },
  { name: 'Electronics', icon: 'Smartphone' },
  { name: 'Clothing & Textiles', icon: 'Shirt' },
  { name: 'Cosmetics & Beauty', icon: 'Sparkles' },
  { name: 'Medicine & Healthcare', icon: 'Pill' },
  { name: 'Personal Gifts', icon: 'Gift' },
  { name: 'Other Items', icon: 'Package' }
];

export const DEFAULT_REQUESTS = [
  {
    id: 'r1',
    title: 'Yirgacheffe Coffee (5 kg)',
    desc: 'Freshly roasted whole-bean coffee, securely packaged for delivery to Deira or Dubai Marina. Priority request.',
    sender: 'Kaleb T.',
    route: 'ADD_TO_DXB',
    weight: '5.0',
    reward: 'AED 150',
    category: 'Coffee & Spices',
    deadline: 'Needed by July 28, 2026',
    img: 'photo-1447933601403-0c6688de566e',
    status: 'pending',
    phone: '251911223344',
    createdAt: Date.now() - 3600000 * 24 * 2
  },
  {
    id: 'r2',
    title: 'iPhone 15 Pro Max',
    desc: 'Purchased from an authorized retailer in Dubai. Delivery requested to Addis Ababa; handover and reward to be arranged at Bole International Airport.',
    sender: 'Sarah Al-M.',
    route: 'DXB_TO_ADD',
    weight: '0.4',
    reward: 'ETB 4,000',
    category: 'Electronics',
    deadline: 'Needed by August 2, 2026',
    img: 'photo-1592286927505-1def25115558',
    status: 'pending',
    phone: '971501234567',
    createdAt: Date.now() - 3600000 * 24 * 1
  },
  {
    id: 'r3',
    title: 'Legal Contract Documents',
    desc: 'Time-sensitive business documents in a lightweight envelope (under 200 g). A traveler departing within the next one to two days is requested.',
    sender: 'Abdi K.',
    route: 'ADD_TO_DXB',
    weight: '0.2',
    reward: 'AED 200',
    category: 'Documents',
    deadline: 'Urgent - by July 22, 2026',
    img: 'photo-1450133064473-71024230f91b',
    status: 'pending',
    phone: '251911987654',
    createdAt: Date.now() - 3600000 * 12
  },
  {
    id: 'r4',
    title: 'Traditional Habesha Dresses (Wedding)',
    desc: 'Two handmade traditional garments for a wedding in Dubai, neatly folded in protective garment bags and ready for handover.',
    sender: 'Marta W.',
    route: 'ADD_TO_DXB',
    weight: '2.5',
    reward: 'AED 120',
    category: 'Clothing & Textiles',
    deadline: 'Needed by August 5, 2026',
    img: 'photo-1595777457583-95e059d581b8',
    status: 'pending',
    phone: '251911555444',
    createdAt: Date.now() - 3600000 * 24 * 3
  },
  {
    id: 'r5',
    title: 'Oud Perfume Bottles & Bakhoor',
    desc: 'Arabian fragrance products purchased in Deira, Dubai. Delivery requested to the Bole Medhanialem area.',
    sender: 'Fatima H.',
    route: 'DXB_TO_ADD',
    weight: '1.2',
    reward: 'ETB 3,000',
    category: 'Cosmetics & Beauty',
    deadline: 'Needed by August 10, 2026',
    img: 'photo-1541643600914-78b084683601',
    status: 'pending',
    phone: '971505556667',
    createdAt: Date.now() - 3600000 * 5
  }
];

export const DEFAULT_PROFILES = {
  'Kaleb T.': {
    name: 'Kaleb T.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
    rating: '4.8',
    deliveriesCount: 8,
    bio: 'Business consultant who travels regularly between Addis Ababa and the UAE, with experience in agricultural trade.',
    verifications: { id: true, flight: true, phone: true },
    upcomingTrip: { route: 'ADD ➔ DXB', date: 'July 28, 2026', flight: 'Emirates EK724' },
    reviews: [
      { reviewer: 'Dawit G.', rating: 5, comment: 'Kaleb handled my coffee samples securely and communicated clearly throughout.', date: 'July 10, 2026' }
    ]
  },
  'Sarah Al-M.': {
    name: 'Sarah Al-M.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
    rating: '5.0',
    deliveriesCount: 14,
    bio: 'E-commerce logistics manager who travels frequently for supply-chain visits and family commitments.',
    verifications: { id: true, flight: true, phone: true },
    upcomingTrip: { route: 'DXB ➔ ADD', date: 'August 2, 2026', flight: 'FlyDubai FZ803' },
    reviews: [
      { reviewer: 'Solomon K.', rating: 5, comment: 'Sarah carried a sealed laptop safely.', date: 'July 05, 2026' }
    ]
  },
  'Abdi K.': {
    name: 'Abdi K.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80',
    rating: '4.9',
    deliveriesCount: 5,
    bio: 'Frequent traveler supporting personal and small-business import needs.',
    verifications: { id: true, flight: false, phone: true },
    upcomingTrip: null,
    reviews: []
  },
  'Marta W.': {
    name: 'Marta W.',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80',
    rating: '4.7',
    deliveriesCount: 3,
    bio: 'Textile artisan and designer based in Addis Ababa, sending sample garments to retail partners.',
    verifications: { id: true, flight: true, phone: false },
    upcomingTrip: null,
    reviews: []
  },
  'Fatima H.': {
    name: 'Fatima H.',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=100&q=80',
    rating: '4.9',
    deliveriesCount: 11,
    bio: 'Boutique owner based in Deira, Dubai, specializing in incense and cosmetics.',
    verifications: { id: true, flight: true, phone: true },
    upcomingTrip: null,
    reviews: []
  }
};
