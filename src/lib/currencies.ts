// Maps an international dial code (from a signup phone number) to the
// country's currency. Not a real FX/conversion layer — the underlying
// ledger stays one set of numbers; this only changes which symbol a user
// sees, based on the country they signed up from. Covers the calling
// codes most signups will realistically use; falls back to Naira since
// that's the platform's home market.

export type CurrencyInfo = { country: string; currencyCode: string; symbol: string };

const DEFAULT_CURRENCY: CurrencyInfo = { country: "Nigeria", currencyCode: "NGN", symbol: "₦" };

// Ordered so longer/more specific dial codes are checked first.
const DIAL_CODES: { dial: string; info: CurrencyInfo }[] = [
  { dial: "1242", info: { country: "Bahamas", currencyCode: "BSD", symbol: "B$" } },
  { dial: "1246", info: { country: "Barbados", currencyCode: "BBD", symbol: "Bds$" } },
  { dial: "1876", info: { country: "Jamaica", currencyCode: "JMD", symbol: "J$" } },
  { dial: "1", info: { country: "United States", currencyCode: "USD", symbol: "$" } },
  { dial: "20", info: { country: "Egypt", currencyCode: "EGP", symbol: "E£" } },
  { dial: "212", info: { country: "Morocco", currencyCode: "MAD", symbol: "DH" } },
  { dial: "213", info: { country: "Algeria", currencyCode: "DZD", symbol: "DA" } },
  { dial: "233", info: { country: "Ghana", currencyCode: "GHS", symbol: "₵" } },
  { dial: "234", info: { country: "Nigeria", currencyCode: "NGN", symbol: "₦" } },
  { dial: "235", info: { country: "Chad", currencyCode: "XAF", symbol: "FCFA" } },
  { dial: "254", info: { country: "Kenya", currencyCode: "KES", symbol: "KSh" } },
  { dial: "255", info: { country: "Tanzania", currencyCode: "TZS", symbol: "TSh" } },
  { dial: "256", info: { country: "Uganda", currencyCode: "UGX", symbol: "USh" } },
  { dial: "233", info: { country: "Ghana", currencyCode: "GHS", symbol: "₵" } },
  { dial: "260", info: { country: "Zambia", currencyCode: "ZMW", symbol: "ZK" } },
  { dial: "263", info: { country: "Zimbabwe", currencyCode: "ZWL", symbol: "Z$" } },
  { dial: "27", info: { country: "South Africa", currencyCode: "ZAR", symbol: "R" } },
  { dial: "233", info: { country: "Ghana", currencyCode: "GHS", symbol: "₵" } },
  { dial: "221", info: { country: "Senegal", currencyCode: "XOF", symbol: "CFA" } },
  { dial: "225", info: { country: "Ivory Coast", currencyCode: "XOF", symbol: "CFA" } },
  { dial: "237", info: { country: "Cameroon", currencyCode: "XAF", symbol: "FCFA" } },
  { dial: "251", info: { country: "Ethiopia", currencyCode: "ETB", symbol: "Br" } },
  { dial: "44", info: { country: "United Kingdom", currencyCode: "GBP", symbol: "£" } },
  { dial: "353", info: { country: "Ireland", currencyCode: "EUR", symbol: "€" } },
  { dial: "49", info: { country: "Germany", currencyCode: "EUR", symbol: "€" } },
  { dial: "33", info: { country: "France", currencyCode: "EUR", symbol: "€" } },
  { dial: "34", info: { country: "Spain", currencyCode: "EUR", symbol: "€" } },
  { dial: "39", info: { country: "Italy", currencyCode: "EUR", symbol: "€" } },
  { dial: "31", info: { country: "Netherlands", currencyCode: "EUR", symbol: "€" } },
  { dial: "32", info: { country: "Belgium", currencyCode: "EUR", symbol: "€" } },
  { dial: "351", info: { country: "Portugal", currencyCode: "EUR", symbol: "€" } },
  { dial: "30", info: { country: "Greece", currencyCode: "EUR", symbol: "€" } },
  { dial: "41", info: { country: "Switzerland", currencyCode: "CHF", symbol: "CHF" } },
  { dial: "46", info: { country: "Sweden", currencyCode: "SEK", symbol: "kr" } },
  { dial: "47", info: { country: "Norway", currencyCode: "NOK", symbol: "kr" } },
  { dial: "45", info: { country: "Denmark", currencyCode: "DKK", symbol: "kr" } },
  { dial: "48", info: { country: "Poland", currencyCode: "PLN", symbol: "zł" } },
  { dial: "7", info: { country: "Russia", currencyCode: "RUB", symbol: "₽" } },
  { dial: "90", info: { country: "Turkey", currencyCode: "TRY", symbol: "₺" } },
  { dial: "971", info: { country: "United Arab Emirates", currencyCode: "AED", symbol: "AED" } },
  { dial: "966", info: { country: "Saudi Arabia", currencyCode: "SAR", symbol: "SAR" } },
  { dial: "974", info: { country: "Qatar", currencyCode: "QAR", symbol: "QAR" } },
  { dial: "965", info: { country: "Kuwait", currencyCode: "KWD", symbol: "KD" } },
  { dial: "91", info: { country: "India", currencyCode: "INR", symbol: "₹" } },
  { dial: "92", info: { country: "Pakistan", currencyCode: "PKR", symbol: "Rs" } },
  { dial: "880", info: { country: "Bangladesh", currencyCode: "BDT", symbol: "৳" } },
  { dial: "94", info: { country: "Sri Lanka", currencyCode: "LKR", symbol: "Rs" } },
  { dial: "86", info: { country: "China", currencyCode: "CNY", symbol: "¥" } },
  { dial: "81", info: { country: "Japan", currencyCode: "JPY", symbol: "¥" } },
  { dial: "82", info: { country: "South Korea", currencyCode: "KRW", symbol: "₩" } },
  { dial: "65", info: { country: "Singapore", currencyCode: "SGD", symbol: "S$" } },
  { dial: "60", info: { country: "Malaysia", currencyCode: "MYR", symbol: "RM" } },
  { dial: "62", info: { country: "Indonesia", currencyCode: "IDR", symbol: "Rp" } },
  { dial: "63", info: { country: "Philippines", currencyCode: "PHP", symbol: "₱" } },
  { dial: "66", info: { country: "Thailand", currencyCode: "THB", symbol: "฿" } },
  { dial: "84", info: { country: "Vietnam", currencyCode: "VND", symbol: "₫" } },
  { dial: "61", info: { country: "Australia", currencyCode: "AUD", symbol: "A$" } },
  { dial: "64", info: { country: "New Zealand", currencyCode: "NZD", symbol: "NZ$" } },
  { dial: "1", info: { country: "Canada", currencyCode: "CAD", symbol: "C$" } },
  { dial: "52", info: { country: "Mexico", currencyCode: "MXN", symbol: "MX$" } },
  { dial: "55", info: { country: "Brazil", currencyCode: "BRL", symbol: "R$" } },
  { dial: "54", info: { country: "Argentina", currencyCode: "ARS", symbol: "AR$" } },
  { dial: "57", info: { country: "Colombia", currencyCode: "COP", symbol: "COL$" } },
  { dial: "51", info: { country: "Peru", currencyCode: "PEN", symbol: "S/" } },
  { dial: "56", info: { country: "Chile", currencyCode: "CLP", symbol: "CLP$" } },
].sort((a, b) => b.dial.length - a.dial.length);

export function detectCurrencyFromPhone(phone: string): CurrencyInfo {
  const digits = phone.replace(/[^0-9]/g, "").replace(/^0+/, "");
  if (!digits) return DEFAULT_CURRENCY;
  for (const { dial, info } of DIAL_CODES) {
    if (digits.startsWith(dial)) return info;
  }
  return DEFAULT_CURRENCY;
}

export { DEFAULT_CURRENCY };
