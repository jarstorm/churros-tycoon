// Baloo 2 gives the game a rounded, friendly voice; weights are mapped to the
// numeric fontWeight values the styles already used.
export const FONT = {
  medium: 'Baloo2_500Medium',
  semi: 'Baloo2_600SemiBold',
  bold: 'Baloo2_700Bold',
  black: 'Baloo2_800ExtraBold',
} as const;

export function fontFor(weight: string): string {
  if (weight === '900' || weight === '800') return FONT.black;
  if (weight === '700') return FONT.bold;
  if (weight === '600') return FONT.semi;
  return FONT.medium;
}
