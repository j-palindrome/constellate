/**
 * Strips HTML tags from a text string.
 * @param html The HTML string to strip tags from.
 * @returns The text content without HTML tags.
 */
export function stripHtmlTags(html: string): string {
  if (!html) return ''

  // Create a temporary DOM element
  const doc = new DOMParser().parseFromString(html, 'text/html')

  // Return just the text content
  return doc.body.textContent || ''
}

// For environments where DOMParser is not available (e.g. Node.js without jsdom)
export function stripHtmlTagsRegex(html: string): string {
  if (!html) return ''

  // Remove all HTML tags using regex
  return html.replace(/<[^>]*>/g, '')
}
