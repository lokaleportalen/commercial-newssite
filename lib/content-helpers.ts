export function normalizeArticleHeadings(content: string): string {
  return content.replace(/^# /gm, '## ');
}

export function getContentPreview(content: string, maxChars: number = 400): string {
  // First normalize headings to ensure proper hierarchy
  let processedContent = normalizeArticleHeadings(content.trim());

  if (processedContent.length <= maxChars) {
    return processedContent;
  }

  // Try to find a paragraph break first
  const paragraphBreak = processedContent.indexOf('\n\n', maxChars * 0.5);
  if (paragraphBreak !== -1 && paragraphBreak <= maxChars) {
    return processedContent.substring(0, paragraphBreak);
  }

  // Try to find a sentence ending
  const sentenceEndings = ['. ', '! ', '? '];
  let lastSentenceEnd = -1;

  for (const ending of sentenceEndings) {
    const pos = processedContent.lastIndexOf(ending, maxChars);
    if (pos > lastSentenceEnd) {
      lastSentenceEnd = pos;
    }
  }

  if (lastSentenceEnd !== -1) {
    return processedContent.substring(0, lastSentenceEnd + 1);
  }

  // Fallback: truncate at last space before maxChars
  const lastSpace = processedContent.lastIndexOf(' ', maxChars);
  if (lastSpace !== -1) {
    return processedContent.substring(0, lastSpace) + '...';
  }

  // Ultimate fallback
  return processedContent.substring(0, maxChars) + '...';
}

export function getExtendedPreview(content: string, maxPercentage: number = 0.4): string {
  const processedContent = normalizeArticleHeadings(content.trim());
  const targetLength = Math.floor(processedContent.length * maxPercentage);

  if (processedContent.length <= targetLength) {
    return processedContent;
  }

  // Try to find a paragraph break near the target length
  const paragraphBreak = processedContent.indexOf('\n\n', targetLength * 0.9);
  if (paragraphBreak !== -1 && paragraphBreak <= targetLength * 1.1) {
    return processedContent.substring(0, paragraphBreak);
  }

  // Try to find a sentence ending
  const sentenceEndings = ['. ', '! ', '? '];
  let lastSentenceEnd = -1;

  for (const ending of sentenceEndings) {
    const pos = processedContent.lastIndexOf(ending, targetLength);
    if (pos > lastSentenceEnd) {
      lastSentenceEnd = pos;
    }
  }

  if (lastSentenceEnd !== -1) {
    return processedContent.substring(0, lastSentenceEnd + 1);
  }

  // Fallback: truncate at last space
  const lastSpace = processedContent.lastIndexOf(' ', targetLength);
  if (lastSpace !== -1) {
    return processedContent.substring(0, lastSpace);
  }

  return processedContent.substring(0, targetLength);
}
