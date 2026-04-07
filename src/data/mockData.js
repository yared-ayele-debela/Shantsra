export const appStats = [
  { label: 'Successful deliveries', value: '12.4k+' },
  { label: 'Verified travelers', value: '4.8k' },
  { label: 'Average savings', value: '38%' },
]

export const howItWorks = [
  {
    title: 'Post or discover a trip',
    description:
      'Senders post parcel details while travelers share routes between UAE and Ethiopia.',
  },
  {
    title: 'Match with verified users',
    description:
      'Compare ratings, identity checks, and available luggage space before accepting a request.',
  },
  {
    title: 'Pay securely and track live',
    description:
      'Confirm bookings with secure checkout and follow each milestone until delivery is complete.',
  },
]

export const trustIndicators = [
  'Government ID verification',
  'Secure in-app payments',
  'Traveler ratings and reviews',
  'Escrow release after delivery',
]

export const customerFeatures = [
  {
    title: 'Lower delivery costs',
    description:
      'Save compared with traditional shipping by matching with travelers already flying your route.',
  },
  {
    title: 'Fast, transparent matching',
    description:
      'See available luggage space, travel date, ratings, and verification before you book.',
  },
  {
    title: 'Built for safe handoffs',
    description:
      'Track milestones, chat in-app, and only release payment after the parcel is delivered.',
  },
]

export const testimonials = [
  {
    name: 'Selam A.',
    role: 'Sender in Dubai',
    rating: 5,
    text: 'PeerBridge helped me send medicine to Addis in two days. The traveler was verified and communication was smooth from pickup to delivery.',
  },
  {
    name: 'Abel T.',
    role: 'Receiver in Addis Ababa',
    rating: 5,
    text: 'The tracking updates and payment protection made it feel safe. It looked and worked like a real product, not just a chat arrangement.',
  },
  {
    name: 'Fatima R.',
    role: 'Frequent traveler',
    rating: 5,
    text: 'I can share my route, accept requests quickly, and build trust through reviews. The mobile experience is very clean and easy to use.',
  },
]

export const faqs = [
  {
    question: 'How does PeerBridge keep deliveries safe?',
    answer:
      'Each booking shows verification badges, public ratings, secure messaging, and protected payment release after delivery is confirmed.',
  },
  {
    question: 'Can I see traveler details before booking?',
    answer:
      'Yes. You can review route, date, available weight, rating history, languages, and verification status before sending a request.',
  },
  {
    question: 'Is the platform mobile friendly?',
    answer:
      'Yes. The experience is designed mobile-first with large tap targets, sticky actions, and responsive layouts for tablet and desktop.',
  },
]

export const quickActions = [
  {
    title: 'Send a Package',
    description: 'Create a shipment request with route, date, and parcel details.',
    href: '/post-shipment',
  },
  {
    title: 'Find a Traveler',
    description: 'Browse trusted travelers already flying between Dubai and Addis Ababa.',
    href: '/travelers',
  },
]

export const recentActivities = [
  {
    title: 'Shipment request sent',
    meta: 'DXB to ADD • 3 kg electronics',
    time: '2 hours ago',
    status: 'Waiting for traveler',
  },
  {
    title: 'Traveler accepted booking',
    meta: 'Abu Dhabi to Addis Ababa • Hana M.',
    time: 'Yesterday',
    status: 'Accepted',
  },
  {
    title: 'Funds secured',
    meta: 'Order #PB-2841 escrow payment confirmed',
    time: '2 days ago',
    status: 'Protected',
  },
]

export const travelers = [
  {
    id: 1,
    name: 'Hana Mekonnen',
    rating: 4.9,
    reviews: 128,
    route: 'Dubai to Addis Ababa',
    date: 'Apr 16, 2026',
    weight: '7 kg available',
    price: '$42 / kg',
    verified: true,
    language: 'Amharic, English',
  },
  {
    id: 2,
    name: 'Yousef Al Mansoori',
    rating: 4.8,
    reviews: 97,
    route: 'Abu Dhabi to Addis Ababa',
    date: 'Apr 18, 2026',
    weight: '10 kg available',
    price: '$38 / kg',
    verified: true,
    language: 'Arabic, English',
  },
  {
    id: 3,
    name: 'Rahel Gebru',
    rating: 4.7,
    reviews: 84,
    route: 'Sharjah to Dire Dawa',
    date: 'Apr 22, 2026',
    weight: '5 kg available',
    price: '$35 / kg',
    verified: true,
    language: 'Amharic, English',
  },
]

export const conversations = [
  {
    id: 1,
    name: 'Hana Mekonnen',
    route: 'Dubai to Addis Ababa',
    unread: 2,
    verified: true,
    messages: [
      { id: 1, sender: 'them', text: 'Hi, I can take up to 7 kg on Apr 16.', time: '09:12' },
      { id: 2, sender: 'me', text: 'Perfect. The parcel is a phone and some documents.', time: '09:15' },
      { id: 3, sender: 'them', text: 'That works. Please upload the invoice in checkout.', time: '09:18' },
      { id: 4, sender: 'me', text: 'Will do. Sending the booking now.', time: '09:19' },
    ],
  },
  {
    id: 2,
    name: 'Selam A.',
    route: 'Dubai to Addis Ababa',
    unread: 0,
    verified: true,
    messages: [
      { id: 1, sender: 'them', text: 'I land in Addis at 6:20 PM.', time: 'Yesterday' },
      { id: 2, sender: 'me', text: 'Thanks. The receiver can meet you at the airport.', time: 'Yesterday' },
    ],
  },
  {
    id: 3,
    name: 'Abel T.',
    route: 'Addis Ababa to Dubai',
    unread: 0,
    verified: true,
    messages: [
      { id: 1, sender: 'them', text: 'I land in Dubai at 6:20 PM.', time: 'Yesterday' },
      { id: 2, sender: 'me', text: 'Thanks. The receiver can meet you at the airport.', time: 'Yesterday' },
    ],
  },
  {
    id: 4,
    name: 'Mekdes A.',
    route: 'Sharjah to Dire Dawa',
    unread: 0,
    verified: true,
    messages: [
      { id: 1, sender: 'them', text: 'I land in Dire Dawa at 6:20 PM.', time: 'Yesterday' },
      { id: 2, sender: 'me', text: 'Thanks. The receiver can meet you at the airport.', time: 'Yesterday' },
    ],
  },
  {
    id: 5,
    name: 'Yousef Al Mansoori',
    route: 'Abu Dhabi to Addis Ababa',
    unread: 0,
    verified: true,
    messages: [
      { id: 1, sender: 'them', text: 'I land in Addis at 6:20 PM.', time: 'Yesterday' },
      { id: 2, sender: 'me', text: 'Thanks. The receiver can meet you at the airport.', time: 'Yesterday' },
    ],
  },
  {
    id: 2,
    name: 'Yousef Al Mansoori',
    route: 'Abu Dhabi to Addis Ababa',
    unread: 0,
    verified: true,
    messages: [
      { id: 1, sender: 'them', text: 'I land in Addis at 6:20 PM.', time: 'Yesterday' },
      { id: 2, sender: 'me', text: 'Thanks. The receiver can meet you at the airport.', time: 'Yesterday' },
    ],
  },
]

export const orderSummary = {
  shipment: '2.5 kg parcel',
  route: 'Dubai to Addis Ababa',
  traveler: 'Hana Mekonnen',
  travelDate: 'Apr 16, 2026',
  basePrice: '$105.00',
  commission: '$9.50',
  insurance: '$6.00',
  total: '$120.50',
}

export const trackingSteps = [
  { title: 'Pending', description: 'Booking request created', status: 'complete' },
  { title: 'Accepted', description: 'Traveler confirmed the parcel', status: 'complete' },
  { title: 'In Transit', description: 'Parcel is on the way to Ethiopia', status: 'current' },
  { title: 'Delivered', description: 'Receiver confirms handoff', status: 'upcoming' },
]

export const profile = {
  name: 'Mimi Tesfaye',
  email: 'mimi.tesfaye@example.com',
  city: 'Dubai, UAE',
  joined: 'Joined January 2025',
  rating: 4.9,
  reviews: 46,
  verified: true,
  bio: 'Frequent traveler between UAE and Ethiopia, focused on safe handoffs and fast communication.',
}

export const reviews = [
  {
    author: 'Alem K.',
    rating: 5,
    text: 'Very reliable and communicative. My package arrived exactly as expected.',
  },
  {
    author: 'Sara N.',
    rating: 5,
    text: 'Smooth pickup and excellent updates throughout the trip.',
  },
]

export const pastDeliveries = [
  {
    id: 'PB-2041',
    route: 'Dubai to Addis Ababa',
    date: 'Mar 28, 2026',
    status: 'Delivered',
  },
  {
    id: 'PB-1982',
    route: 'Addis Ababa to Abu Dhabi',
    date: 'Mar 08, 2026',
    status: 'Delivered',
  },
]
