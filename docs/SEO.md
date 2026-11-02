# Shantasra SEO

## Architecture

Laravel owns public HTML. `PublicSeoController` builds a cached page descriptor from the same
shipment and travel models used by the API, and `resources/views/seo/spa.blade.php` emits the
title, description, canonical, social tags, hreflang, JSON-LD, and a crawlable content block.
The React app mounts into that block and updates metadata on client navigation with
`react-helmet-async`.

Public package URLs use `/packages/{id}-{slug}`; the numeric ID is authoritative and stale slugs
redirect to the canonical URL. Public sitemap data is cached by `SitemapController` and refreshed
hourly by `seo:sitemaps`.

## Adding an indexable page type

1. Add a controller method that returns a title under 60 characters, a description under 160
   characters, canonical URL, safe public content, and valid JSON-LD.
2. Cache database-backed descriptors and exclude private contact or verification data.
3. Add a named web route before the 404 fallback.
4. Add the URL to `SitemapController` only when it is indexable and has meaningful content.
5. Add a focused feature test for metadata, status, and privacy.
6. Add the matching client route/view and a canonical link.

## Post-deploy checklist

- Set `APP_URL`, `FRONTEND_URL`, `SEO_OG_IMAGE`, `SEO_GSC_VERIFICATION`, and optional
  `GA4_MEASUREMENT_ID`.
- Run `php artisan seo:sitemaps` and verify `/sitemap.xml`, child sitemaps, and `/robots.txt`.
- Run `php artisan test --filter=SeoTest` and `tests/scripts/check-seo.sh`.
- Submit the sitemap in Google Search Console.
- Validate package, route, and organization markup with Rich Results Test.
- Review Search Console coverage, 404/410 handling, canonical selection, and Core Web Vitals.
- Confirm HTTPS/host redirects and hashed asset cache headers at the web server.
