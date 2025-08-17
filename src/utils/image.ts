export function normalizeImageUrl(url?: string | null, fallback = '/file.svg') {
  if (!url) return fallback;
  try {
    const s = String(url).trim();
    if (!s) return fallback;
    // If it's a data URL keep as-is (should be uploaded before save), if absolute URL keep as-is
    if (s.startsWith('data:') || s.startsWith('http://') || s.startsWith('https://')) return s;

    // If it starts with a leading slash it's a site-relative path (/productos/...), prefer it
    if (s.startsWith('/')) {
      // On server we can verify the file exists under <project>/public. On client keep the path as-is.
      if (typeof window === 'undefined') {
        try {
          // require dynamically so bundlers don't include fs in client builds
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const fs = require('fs');
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const path = require('path');
          const publicPath = path.join(process.cwd(), 'public', s.replace(/^\//, ''));
          if (fs.existsSync(publicPath)) return s;
          return fallback;
        } catch {
          // If anything goes wrong during the check, fall back to returning the original path
          return s;
        }
      }

      return s;
    }

    // Otherwise treat as relative path (no leading slash) — leave as-is (component code should normalize)
    return s;
  } catch {
    return fallback;
  }
}

/**
 * Obtiene una URL de imagen con timestamp para evitar caché
 */
export function getImageUrlWithTimestamp(imageUrl: string | null | undefined): string | null {
  const normalizedUrl = normalizeImageUrl(imageUrl);
  if (!normalizedUrl || normalizedUrl === '/file.svg') return normalizedUrl;
  
  // Si la imagen ya tiene parámetros, agregar timestamp con &, si no con ?
  const separator = normalizedUrl.includes('?') ? '&' : '?';
  return `${normalizedUrl}${separator}t=${Date.now()}`;
}

/**
 * Obtiene una URL de imagen con timestamp aleatorio para evitar caché de forma persistente
 */
export function getImageUrlWithRandomTimestamp(imageUrl: string | null | undefined): string | null {
  const normalizedUrl = normalizeImageUrl(imageUrl);
  if (!normalizedUrl || normalizedUrl === '/file.svg') return normalizedUrl;
  
  // Usar timestamp + número aleatorio para mayor aleatoriedad
  const timestamp = Date.now() + Math.floor(Math.random() * 1000);
  const separator = normalizedUrl.includes('?') ? '&' : '?';
  return `${normalizedUrl}${separator}t=${timestamp}`;
}
