import { Product } from '../types';

export const PRIMARY_DOMAIN = 'https://haybahbd.com';

/**
 * Returns a clean, short, canonical product share URL using the primary custom domain haybahbd.com.
 * Format: https://haybahbd.com/product/:id or /p/:id (with fallback query parameter support).
 */
export function getProductShareUrl(product: Product): string {
  const identifier = product.slug || product.id;
  // Always use primary live domain haybahbd.com
  return `${PRIMARY_DOMAIN}/product/${encodeURIComponent(identifier)}`;
}

/**
 * Returns a short share URL using primary live domain haybahbd.com
 */
export function getProductShortUrl(product: Product): string {
  const identifier = product.slug || product.id;
  return `${PRIMARY_DOMAIN}/p/${encodeURIComponent(identifier)}`;
}

/**
 * Parses the current browser URL to detect if a specific product is requested.
 * Supports:
 * - /product/:id or /product/:slug
 * - /p/:id or /p/:slug
 * - ?product=:id or ?p=:id
 * - Hash routes like #/product/:id
 */
export function parseProductFromUrl(
  products: Product[],
  urlPath?: string,
  urlSearch?: string
): Product | null {
  if (typeof window === 'undefined' && !urlPath) return null;

  const pathname = urlPath ?? window.location.pathname;
  const search = urlSearch ?? window.location.search;
  const hash = typeof window !== 'undefined' ? window.location.hash : '';

  // 1. Check path matches: /product/:slug or /p/:slug
  const productPathRegex = /^\/(?:product|p)\/([^/?#]+)/i;
  const pathMatch = pathname.match(productPathRegex);
  let targetIdentifier = pathMatch ? decodeURIComponent(pathMatch[1]) : null;

  // 2. Check query params: ?product=... or ?p=... or ?id=...
  if (!targetIdentifier && search) {
    try {
      const params = new URLSearchParams(search);
      targetIdentifier =
        params.get('product') || params.get('p') || params.get('id');
    } catch {
      // Ignore
    }
  }

  // 3. Check hash routes: #/product/:slug
  if (!targetIdentifier && hash) {
    const hashMatch = hash.match(/^#\/?(?:product|p)\/([^/?#]+)/i);
    if (hashMatch) {
      targetIdentifier = decodeURIComponent(hashMatch[1]);
    }
  }

  if (!targetIdentifier) return null;

  const normalized = targetIdentifier.trim().toLowerCase();

  // Find exact slug or ID match first
  const match = products.find(
    (p) =>
      p.id.toLowerCase() === normalized ||
      (p.slug && p.slug.toLowerCase() === normalized)
  );

  if (match) return match;

  // Partial slug or name match fallback
  return (
    products.find(
      (p) =>
        p.id.toLowerCase().includes(normalized) ||
        (p.slug && p.slug.toLowerCase().includes(normalized)) ||
        p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').includes(normalized)
    ) || null
  );
}
