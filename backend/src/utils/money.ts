export function splitAmountInCents(amount: number, parts: number): number[] {
  const totalCents = Math.round(amount * 100);
  const baseCents = Math.floor(totalCents / parts);
  const remainder = totalCents % parts;
  return Array.from({ length: parts }, (_, index) => baseCents + (index < remainder ? 1 : 0));
}
