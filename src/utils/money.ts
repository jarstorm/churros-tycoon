export function formatMoney(amount: number, language: string): string {
  if (language.startsWith('en')) {
    return `$${amount.toFixed(2)}`;
  }
  return `${amount.toFixed(2)} €`;
}
