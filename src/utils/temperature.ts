export function formatTemp(tempC: number, language: string): string {
  if (language.startsWith('en')) {
    const f = Math.round((tempC * 9) / 5 + 32);
    return `${f}°F`;
  }
  return `${tempC}°C`;
}
