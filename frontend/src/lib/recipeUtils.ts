export function sanitizeHtml(html: string): string {
  // Simple HTML sanitization - in production, use DOMPurify or similar
  return html
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
}

export function parseInstructionsFromHtml(html: string): string[] {
  const cleanHtml = sanitizeHtml(html);
  return cleanHtml
    .split(/\.\s+/)
    .filter(step => step.trim().length > 0)
    .map(step => step.trim());
}

export function parseInstructionsIntoSteps(instructions: string): Array<{ number: number; step: string }> {
  const steps = parseInstructionsFromHtml(instructions);
  return steps.map((step, index) => ({
    number: index + 1,
    step: step.endsWith('.') ? step : step + '.'
  }));
}

export function formatCookingTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

export function formatServings(servings: number): string {
  return servings === 1 ? '1 serving' : `${servings} servings`;
} 