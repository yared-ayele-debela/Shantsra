#!/usr/bin/env bash
set -euo pipefail

base_url="${1:-http://127.0.0.1:8000}"
html="$(curl --fail --silent --show-error "$base_url/faq")"
grep -q '<title>' <<<"$html"
grep -q 'name="description"' <<<"$html"
grep -q 'rel="canonical"' <<<"$html"
grep -q 'hreflang="am"' <<<"$html"
grep -q 'application/ld+json' <<<"$html"
echo "SEO head checks passed for $base_url/faq"
