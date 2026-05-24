import { type Transaction, type Account, categories } from "./mock-data";

export interface ParsedRow {
  date: string;
  description: string;
  amount: number;
  type: "debit" | "credit";
  balance?: number;
}

export interface ParseResult {
  rows: ParsedRow[];
  bankName: string;
  errors: string[];
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function normaliseDate(raw: string): string | null {
  // Try DD/MM/YYYY
  const dmy = raw.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})$/);
  if (dmy) {
    const [, d, m, y] = dmy;
    const year = y.length === 2 ? "20" + y : y;
    return `${year}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  // Try YYYY-MM-DD (already ISO)
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return raw;
  // Try MM/DD/YYYY (US format)
  const mdy = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mdy) {
    const [, m, d, y] = mdy;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return null;
}

function cleanAmount(raw: string): number | null {
  const cleaned = raw.replace(/[£$€,\s]/g, "");
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : n;
}

// Keyword → categoryId mapping for auto-categorisation
const CATEGORY_RULES: { pattern: RegExp; categoryId: string }[] = [
  { pattern: /tesco|sainsbury|waitrose|lidl|aldi|morrisons|co-op|ocado|asda|marks|m&s|wholefood/i, categoryId: "cat1" },
  { pattern: /uber|tfl|rail|train|bus|oyster|national rail|avanti|gwr|eurostar|half.*ord|parking|petrol|fuel/i, categoryId: "cat2" },
  { pattern: /restaurant|pret|costa|starbucks|cafe|nando|wagamama|pizza|mcdonald|burger|kfc|subway|deliveroo|just.*eat|uber.*eat/i, categoryId: "cat3" },
  { pattern: /cinema|vue|cineworld|odeon|netflix|spotify|disney|apple.*tv|amazon.*prime|sky|now.*tv|game|xbox|playstation/i, categoryId: "cat4" },
  { pattern: /british.*gas|sse|eon|edf|bulb|octopus|thames.*water|water|electric|energy|broadband|bt |virgin.*media|sky.*broadband/i, categoryId: "cat5" },
  { pattern: /subscription|headspace|audible|kindle|icloud|google.*one|dropbox|adobe|microsoft/i, categoryId: "cat6" },
  { pattern: /pharmacy|boots|lloyds.*pharm|superdrug|gp|doctor|dental|optician|gym|nuffield|pure.*gym/i, categoryId: "cat7" },
  { pattern: /salary|payroll|wages|employer|income|freelance|invoice|dividend|interest/i, categoryId: "cat8" },
];

function guessCategory(description: string): string {
  for (const { pattern, categoryId } of CATEGORY_RULES) {
    if (pattern.test(description)) return categoryId;
  }
  return "cat3"; // Default to Dining Out as a neutral catch-all for unknown debits
}

function guessIsRecurring(description: string): boolean {
  return /netflix|spotify|amazon.*prime|disney|apple.*tv|headspace|gym|membership|subscription|audible|icloud|google.*one/i.test(description);
}

// ---- Bank format detectors ----

interface FormatDetector {
  name: string;
  detect: (headers: string[]) => boolean;
  parse: (headers: string[], row: string[]) => ParsedRow | null;
}

const FORMATS: FormatDetector[] = [
  {
    name: "Monzo",
    detect: (h) => h.some((x) => /transaction type/i.test(x)) && h.some((x) => /money out/i.test(x)),
    parse: (h, row) => {
      const get = (pat: RegExp) => row[h.findIndex((x) => pat.test(x))] ?? "";
      const date = normaliseDate(get(/^date$/i));
      const desc = get(/^name$/i) || get(/^description$/i);
      const out = cleanAmount(get(/money out/i));
      const inn = cleanAmount(get(/money in/i));
      if (!date || !desc) return null;
      if (inn && inn > 0) return { date, description: desc, amount: inn, type: "credit" };
      if (out && out > 0) return { date, description: desc, amount: out, type: "debit" };
      return null;
    },
  },
  {
    name: "Barclays",
    detect: (h) => h.some((x) => /memo/i.test(x)) && h.some((x) => /debit/i.test(x)) && h.some((x) => /credit/i.test(x)),
    parse: (h, row) => {
      const get = (pat: RegExp) => row[h.findIndex((x) => pat.test(x))] ?? "";
      const date = normaliseDate(get(/^date$/i));
      const desc = get(/memo|description/i);
      const debit = cleanAmount(get(/^debit/i));
      const credit = cleanAmount(get(/^credit/i));
      if (!date || !desc) return null;
      if (credit && credit > 0) return { date, description: desc, amount: credit, type: "credit" };
      if (debit && debit > 0) return { date, description: desc, amount: debit, type: "debit" };
      return null;
    },
  },
  {
    name: "Starling",
    detect: (h) => h.some((x) => /counter party/i.test(x)) && h.some((x) => /spending category/i.test(x)),
    parse: (h, row) => {
      const get = (pat: RegExp) => row[h.findIndex((x) => pat.test(x))] ?? "";
      const date = normaliseDate(get(/^date$/i));
      const desc = get(/counter party/i) || get(/reference/i);
      const amount = cleanAmount(get(/^amount$/i));
      if (!date || !desc || amount === null) return null;
      return { date, description: desc, amount: Math.abs(amount), type: amount < 0 ? "debit" : "credit" };
    },
  },
  {
    name: "HSBC",
    detect: (h) => h.some((x) => /^date$/i.test(x)) && h.some((x) => /^description$/i.test(x)) && h.some((x) => /^amount$/i.test(x)),
    parse: (h, row) => {
      const get = (pat: RegExp) => row[h.findIndex((x) => pat.test(x))] ?? "";
      const date = normaliseDate(get(/^date$/i));
      const desc = get(/^description$/i) || get(/^payee$/i);
      const amount = cleanAmount(get(/^amount$/i));
      if (!date || !desc || amount === null) return null;
      return { date, description: desc, amount: Math.abs(amount), type: amount < 0 ? "debit" : "credit" };
    },
  },
  {
    // Generic: tries to find date, description/payee, amount/debit/credit columns heuristically
    name: "Generic",
    detect: () => true,
    parse: (h, row) => {
      const dateIdx = h.findIndex((x) => /date/i.test(x));
      const descIdx = h.findIndex((x) => /description|payee|merchant|name|narrative/i.test(x));
      const amtIdx = h.findIndex((x) => /^amount$/i.test(x));
      const debitIdx = h.findIndex((x) => /debit|out/i.test(x));
      const creditIdx = h.findIndex((x) => /credit|in/i.test(x));

      if (dateIdx === -1 || descIdx === -1) return null;
      const date = normaliseDate(row[dateIdx] || "");
      const desc = row[descIdx] || "";
      if (!date || !desc) return null;

      if (amtIdx !== -1) {
        const amount = cleanAmount(row[amtIdx] || "");
        if (amount === null) return null;
        return { date, description: desc, amount: Math.abs(amount), type: amount < 0 ? "debit" : "credit" };
      }
      const debit = debitIdx !== -1 ? cleanAmount(row[debitIdx] || "") : null;
      const credit = creditIdx !== -1 ? cleanAmount(row[creditIdx] || "") : null;
      if (credit && credit > 0) return { date, description: desc, amount: credit, type: "credit" };
      if (debit && debit > 0) return { date, description: desc, amount: debit, type: "debit" };
      return null;
    },
  },
];

export function parseCSV(content: string, accountId: string): ParseResult {
  const lines = content.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return { rows: [], bankName: "Unknown", errors: ["File appears empty"] };

  // Find header row - skip lines until we find one with 3+ comma-separated values
  let headerIdx = 0;
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    if (lines[i].split(",").length >= 3) { headerIdx = i; break; }
  }

  const headers = parseCSVLine(lines[headerIdx]).map((h) => h.replace(/^["']|["']$/g, "").trim());
  const format = FORMATS.find((f) => f.detect(headers)) || FORMATS[FORMATS.length - 1];

  const rows: ParsedRow[] = [];
  const errors: string[] = [];

  for (let i = headerIdx + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const cols = parseCSVLine(line);
    const parsed = format.parse(headers, cols);
    if (parsed) {
      rows.push(parsed);
    } else {
      if (errors.length < 3) errors.push(`Skipped row ${i + 1}: could not parse "${line.slice(0, 60)}"`);
    }
  }

  return { rows, bankName: format.name, errors };
}

export function toTransactions(rows: ParsedRow[], accountId: string): Transaction[] {
  return rows.map((row, i) => ({
    id: `imported-${accountId}-${i}-${row.date}`,
    accountId,
    date: row.date,
    merchant: row.description,
    amount: row.amount,
    type: row.type,
    categoryId: row.type === "credit" ? "cat8" : guessCategory(row.description),
    isRecurring: guessIsRecurring(row.description),
  }));
}
