/**
 * Truncate content at a natural boundary (sentence or paragraph)
 * to provide a preview for non-authenticated users
 */
export function getContentPreview(content: string, maxChars: number = 400): string {
  if (content.length <= maxChars) {
    return content;
  }

  // Try to find a paragraph break first
  const paragraphBreak = content.indexOf('\n\n', maxChars * 0.5);
  if (paragraphBreak !== -1 && paragraphBreak <= maxChars) {
    return content.substring(0, paragraphBreak);
  }

  // Try to find a sentence ending
  const sentenceEndings = ['. ', '! ', '? '];
  let lastSentenceEnd = -1;

  for (const ending of sentenceEndings) {
    const pos = content.lastIndexOf(ending, maxChars);
    if (pos > lastSentenceEnd) {
      lastSentenceEnd = pos;
    }
  }

  if (lastSentenceEnd !== -1) {
    return content.substring(0, lastSentenceEnd + 1);
  }

  // Fallback: truncate at last space before maxChars
  const lastSpace = content.lastIndexOf(' ', maxChars);
  if (lastSpace !== -1) {
    return content.substring(0, lastSpace) + '...';
  }

  // Ultimate fallback
  return content.substring(0, maxChars) + '...';
}
