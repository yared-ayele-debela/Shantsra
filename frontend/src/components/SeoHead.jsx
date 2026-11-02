import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const pageMeta = {
  '/': ['Shantasra | Cross-border delivery between UAE and Ethiopia', 'Send packages between the UAE and Ethiopia with trusted travelers on Shantasra.'],
  '/packages': ['Packages for delivery | Shantasra', 'Browse active package delivery requests between the UAE and Ethiopia.'],
  '/travelers': ['Find travelers | Shantasra', 'Find trusted travelers carrying packages between the UAE and Ethiopia.'],
  '/how-it-works': ['How Shantasra works', 'Learn how Shantasra connects senders with trusted travelers for cross-border delivery.'],
  '/faq': ['Frequently asked questions | Shantasra', 'Answers about sending packages and traveling with Shantasra.'],
  '/about': ['About Shantasra', 'Shantasra helps people move packages across borders through trusted travelers.'],
  '/contact': ['Contact Shantasra', 'Contact Shantasra for help with a package or traveler listing.'],
  '/safety': ['Safety at Shantasra', 'Learn how Shantasra supports safer package handovers and verified travel listings.'],
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
