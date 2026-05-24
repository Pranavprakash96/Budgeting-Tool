import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  formatDate,
  formatShortDate,
  getCategoryById,
  getAccountById,
  getNetWorth,
  getTotalAssets,
  getTotalLiabilities,
  getTransactionsForMonth,
  getMonthlySpend,
  getMonthlyIncome,
  getSpendByCategory,
  getRecurringTransactions,
  getMonthlyStats,
  getCurrentMonth,
} from "@/lib/utils";
import { accounts, transactions } from "@/lib/mock-data";

describe("formatCurrency", () => {
  it("formats positive GBP amounts", () => {
    expect(formatCurrency(1234.56)).toBe("£1,234.56");
  });

  it("formats zero", () => {
    expect(formatCurrency(0)).toBe("£0.00");
  });

  it("formats negative amounts as positive (abs value)", () => {
    expect(formatCurrency(-643.20)).toBe("£643.20");
  });
});

describe("formatDate", () => {
  it("formats date string to readable format", () => {
    const result = formatDate("2026-05-24");
    expect(result).toContain("2026");
    expect(result).toContain("24");
  });
});

describe("formatShortDate", () => {
  it("returns short date without year", () => {
    const result = formatShortDate("2026-05-24");
    expect(result).toContain("24");
    expect(result).not.toContain("2026");
  });
});

describe("getCategoryById", () => {
  it("returns a category for a valid id", () => {
    const cat = getCategoryById("cat1");
    expect(cat).toBeDefined();
    expect(cat?.name).toBe("Groceries");
  });

  it("returns undefined for unknown id", () => {
    expect(getCategoryById("nonexistent")).toBeUndefined();
  });
});

describe("getAccountById", () => {
  it("returns account for valid id", () => {
    const acc = getAccountById("acc1", accounts);
    expect(acc).toBeDefined();
    expect(acc?.name).toBe("Current Account");
  });

  it("returns undefined for unknown id", () => {
    expect(getAccountById("xyz", accounts)).toBeUndefined();
  });
});

describe("getNetWorth", () => {
  it("sums all account balances", () => {
    const expected = accounts.reduce((s, a) => s + a.balance, 0);
    expect(getNetWorth(accounts)).toBeCloseTo(expected, 2);
  });
});

describe("getTotalAssets", () => {
  it("sums only positive balances", () => {
    const expected = accounts.filter((a) => a.balance > 0).reduce((s, a) => s + a.balance, 0);
    expect(getTotalAssets(accounts)).toBeCloseTo(expected, 2);
  });
});

describe("getTotalLiabilities", () => {
  it("sums absolute value of negative balances", () => {
    const expected = accounts.filter((a) => a.balance < 0).reduce((s, a) => s + Math.abs(a.balance), 0);
    expect(getTotalLiabilities(accounts)).toBeCloseTo(expected, 2);
  });
});

describe("getTransactionsForMonth", () => {
  it("filters to only transactions in the given month", () => {
    const may = getTransactionsForMonth(transactions, "2026-05");
    expect(may.every((t) => t.date.startsWith("2026-05"))).toBe(true);
  });

  it("returns empty array for a month with no data", () => {
    expect(getTransactionsForMonth(transactions, "2020-01")).toHaveLength(0);
  });
});

describe("getMonthlySpend", () => {
  it("returns positive total of debits for a month", () => {
    const spend = getMonthlySpend(transactions, "2026-05");
    expect(spend).toBeGreaterThan(0);
  });
});

describe("getMonthlyIncome", () => {
  it("returns positive total of credits for a month", () => {
    const income = getMonthlyIncome(transactions, "2026-05");
    expect(income).toBeGreaterThan(0);
  });
});

describe("getSpendByCategory", () => {
  it("returns an object keyed by category id", () => {
    const result = getSpendByCategory(transactions, "2026-05");
    expect(typeof result).toBe("object");
    Object.values(result).forEach((v) => expect(v).toBeGreaterThan(0));
  });

  it("does not include income category", () => {
    const result = getSpendByCategory(transactions, "2026-05");
    expect(result["cat8"]).toBeUndefined();
  });
});

describe("getRecurringTransactions", () => {
  it("returns only recurring transactions", () => {
    const recurring = getRecurringTransactions(transactions);
    expect(recurring.length).toBeGreaterThan(0);
    recurring.forEach((t) => expect(t.isRecurring).toBe(true));
  });

  it("returns unique merchants only", () => {
    const recurring = getRecurringTransactions(transactions);
    const merchants = recurring.map((t) => t.merchant);
    const unique = new Set(merchants);
    expect(merchants.length).toBe(unique.size);
  });
});

describe("getMonthlyStats", () => {
  it("returns up to 3 months of data", () => {
    const stats = getMonthlyStats(transactions);
    expect(stats.length).toBeGreaterThan(0);
    expect(stats.length).toBeLessThanOrEqual(3);
  });

  it("each entry has month, income, spend", () => {
    const stats = getMonthlyStats(transactions);
    stats.forEach((s) => {
      expect(s.month).toBeTruthy();
      expect(typeof s.income).toBe("number");
      expect(typeof s.spend).toBe("number");
    });
  });
});

describe("getCurrentMonth", () => {
  it("returns the latest month present in transactions", () => {
    const month = getCurrentMonth(transactions);
    expect(month).toBe("2026-05");
  });

  it("returns current month for empty array", () => {
    const month = getCurrentMonth([]);
    expect(month).toMatch(/^\d{4}-\d{2}$/);
  });
});
