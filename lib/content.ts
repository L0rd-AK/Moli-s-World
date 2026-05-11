export function stripHtml(html: string) {
  if (!html) return '';
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function estimateReadingTime(html: string) {
  const text = stripHtml(html);
  const words = text ? text.split(/\s+/).length : 0;
  return Math.max(1, Math.ceil(words / 180));
}
