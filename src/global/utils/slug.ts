export function generateSlug(name: string): string {
  return name
    .toLowerCase() // Convert to lowercase
    .trim() // Remove leading and trailing whitespace
    .replace(/[^\w\s-]/g, '') // Remove special characters except whitespace and hyphens
    .replace(/\s+/g, '-') // Replace whitespace with hyphens
    .replace(/-+/g, '-'); // Replace multiple consecutive hyphens with a single hyphen
}
