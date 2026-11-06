import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const pageMeta = {
  '/': ['Shantasra | Peer-to-Peer (P2P) Cross-Border Delivery Agency', 'Shantasra is a trusted peer-to-peer (P2P) delivery agency connecting package senders with verified travelers between the UAE and Ethiopia.'],
  '/packages': ['Packages for Delivery | Shantasra P2P Delivery Agency', 'Browse active peer-to-peer package delivery requests between the UAE and Ethiopia on Shantasra.'],
  '/travelers': ['Find Verified Travelers | Shantasra P2P Delivery Agency', 'Connect with verified travelers carrying packages between the UAE and Ethiopia through Shantasra.'],
  '/how-it-works': ['How Shantasra Works | P2P Delivery Agency', 'Learn how Shantasra connects senders with verified travelers for peer-to-peer cross-border delivery.'],
  '/faq': ['Frequently Asked Questions | Shantasra', 'Answers about sending packages and traveling with the Shantasra P2P delivery agency.'],
  '/about': ['About Shantasra | Peer-to-Peer Delivery Agency', 'Shantasra is a peer-to-peer delivery agency helping people move packages across borders through verified travelers.'],
  '/contact': ['Contact Shantasra | P2P Delivery Agency', 'Contact Shantasra for assistance with your peer-to-peer package or traveler listing.'],
  '/safety': ['Safety & Trust at Shantasra | P2P Delivery Agency', 'Learn how Shantasra ensures safe peer-to-peer package handovers and verified travel listings.'],
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
