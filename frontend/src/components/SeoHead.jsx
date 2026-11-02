import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const pageMeta = {
  '/': ['PeerBridge Delivery | Cross-border delivery between UAE and Ethiopia', 'Send packages between the UAE and Ethiopia with trusted travelers on PeerBridge Delivery.'],
  '/packages': ['Packages for delivery | PeerBridge Delivery', 'Browse active package delivery requests between the UAE and Ethiopia.'],
  '/travelers': ['Find travelers | PeerBridge Delivery', 'Find trusted travelers carrying packages between the UAE and Ethiopia.'],
  '/how-it-works': ['How PeerBridge Delivery works', 'Learn how PeerBridge connects senders with trusted travelers for cross-border delivery.'],
  '/faq': ['Frequently asked questions | PeerBridge Delivery', 'Answers about sending packages and traveling with PeerBridge Delivery.'],
  '/about': ['About PeerBridge Delivery', 'PeerBridge Delivery helps people move packages across borders through trusted travelers.'],
  '/contact': ['Contact PeerBridge Delivery', 'Contact PeerBridge Delivery for help with a package or traveler listing.'],
  '/safety': ['Safety at PeerBridge Delivery', 'Learn how PeerBridge supports safer package handovers and verified travel listings.'],
};

export default function SeoHead() {
  const { pathname } = useLocation();
  const [title, description] = pageMeta[pathname] || pageMeta['/'];
  const canonical = `${window.location.origin}${pathname}`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
    </Helmet>
  );
}
