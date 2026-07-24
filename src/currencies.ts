export interface CurrencyDetail {
  code: string;
  symbol: string;
  label: string;
  isSuffix?: boolean;
}

export const currenciesList: CurrencyDetail[] = [
  { code: "USD", symbol: "$", label: "USD ($)" },
  { code: "BDT", symbol: "৳", label: "BDT (৳)", isSuffix: true },
  { code: "INR", symbol: "₹", label: "INR (₹)" },
  { code: "EUR", symbol: "€", label: "EUR (€)" },
  { code: "GBP", symbol: "£", label: "GBP (£)" },
  { code: "RUB", symbol: "₽", label: "RUB (₽)", isSuffix: true },
  { code: "IDR", symbol: "Rp ", label: "IDR (Rp)" },
  { code: "PKR", symbol: "₨ ", label: "PKR (₨)" },
  { code: "MYR", symbol: "RM ", label: "MYR (RM)" },
  { code: "PHP", symbol: "₱", label: "PHP (₱)" },
  { code: "VND", symbol: "₫", label: "VND (₫)", isSuffix: true },
  { code: "THB", symbol: "฿", label: "THB (฿)" },
  { code: "SGD", symbol: "S$", label: "SGD (S$)" },
  { code: "CAD", symbol: "C$", label: "CAD (C$)" },
  { code: "AUD", symbol: "A$", label: "AUD (A$)" },
  { code: "AED", symbol: "د.إ ", label: "AED (د.إ)" },
  { code: "SAR", symbol: "ر.س ", label: "SAR (ر.س)" },
  { code: "TRY", symbol: "₺", label: "TRY (₺)" },
  { code: "KZT", symbol: "₸", label: "KZT (₸)", isSuffix: true },
  { code: "BRL", symbol: "R$", label: "BRL (R$)" },
  { code: "CNY", symbol: "¥", label: "CNY (¥)" }
];

export function formatValueWithCurrency(amount: number, currencyCode: string): string {
  const cur = currenciesList.find(c => c.code === currencyCode) || currenciesList[0];
  const decimals = amount < 0.01 && amount > 0 ? 4 : 2;
  const valStr = amount.toFixed(decimals);
  if (cur.isSuffix) {
    return `${valStr}${cur.symbol}`;
  }
  return `${cur.symbol}${valStr}`;
}
