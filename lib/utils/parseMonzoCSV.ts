import Papa from "papaparse";
import { type Transaction } from "@/lib/types/transaction";

interface MonzoRow {
  "Transaction ID": string;
  "Date": string;
  "Time": string;
  "Type": string;
  "Name": string;
  "Emoji": string;
  "Category": string;
  "Amount": string;
  "Currency": string;
  "Local amount": string;
  "Local currency": string;
  "Notes and #tags": string;
  "Address": string;
  "Description": string;
  "Money out": string;
  "Money in": string;
}

function parseFloat_(value: string): number {
  const n = parseFloat(value);
  return isNaN(n) ? 0 : n;
}

function parseNullableFloat(value: string): number | null {
  if (!value || !value.trim()) return null;
  const n = parseFloat(value);
  return isNaN(n) ? null : n;
}

export function parseMonzoCSV(file: File): Promise<Transaction[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<MonzoRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        const transactions: Transaction[] = results.data
          .map((row): Transaction => ({
            id: row["Transaction ID"] ?? "",
            date: row["Date"] ?? "",
            time: row["Time"] ?? "",
            type: row["Type"] ?? "",
            name: row["Name"] ?? "",
            emoji: row["Emoji"] ?? "",
            category: row["Category"] ?? "",
            amount: parseFloat_(row["Amount"]),
            currency: row["Currency"] ?? "",
            localAmount: parseFloat_(row["Local amount"]),
            localCurrency: row["Local currency"] ?? "",
            notes: row["Notes and #tags"] ?? "",
            address: row["Address"] ?? "",
            description: row["Description"] ?? "",
            moneyOut: parseNullableFloat(row["Money out"]),
            moneyIn: parseNullableFloat(row["Money in"]),
          }))
          .filter((t) => !(t.amount === 0 && t.name === ""));

        resolve(transactions);
      },
      error(err) {
        reject(new Error(err.message));
      },
    });
  });
}
