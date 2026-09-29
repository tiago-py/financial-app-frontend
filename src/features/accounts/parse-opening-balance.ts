// Accept BRL input without silently treating malformed values as zero.
export function parseOpeningBalance(input: string): number | null {
  const value = input.trim();
  if (!/^-?(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d{1,2})?$/.test(value)) return null;
  const negative = value.startsWith("-");
  const unsigned = value.replace(/^-/, "").replace(/\./g, "");
  const [whole, fraction = ""] = unsigned.split(",");
  const cents = BigInt(whole) * BigInt(100) + BigInt(fraction.padEnd(2, "0"));
  if (cents > BigInt(Number.MAX_SAFE_INTEGER)) return null;
  return Number(cents) * (negative ? -1 : 1);
}
