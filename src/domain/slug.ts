/** Deterministic, DOM-safe identifier from free text ("Wizeline / Senior" -> "wizeline-senior"). */
export function slugify(...parts: readonly string[]): string {
  return parts
    .join(' ')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
