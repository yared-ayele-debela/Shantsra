export function slugify(value = '') {
  return String(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function packageTitle(item = {}) {
  return item.title || item.description || `${item.from_city || 'Origin'} to ${item.to_city || 'Destination'} delivery`;
}

export function packagePath(item) {
  return `/packages/${encodeURIComponent(item.id)}-${slugify(packageTitle(item))}`;
}

export function routePath(origin, destination) {
  return `/routes/${slugify(origin)}-to-${slugify(destination)}`;
}

export function viewPath(view) {
  return {
    home: '/',
    packages: '/packages',
    travelers: '/travelers',
    dashboard: '/dashboard',
    safety: '/safety',
    howItWorks: '/how-it-works',
    faq: '/faq',
    about: '/about',
    contact: '/contact',
  }[view] || '/';
}
