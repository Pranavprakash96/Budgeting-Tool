import { NextRequest, NextResponse } from "next/server";
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

function mapRow(row: MonzoRow): Transaction {
  return {
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
  };
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Missing file field in form data" }, { status: 400 });
  }

  if (!file.name.endsWith(".csv") && file.type !== "text/csv") {
    return NextResponse.json({ error: "File must be a CSV" }, { status: 415 });
  }

  let text: string;
  try {
    text = await file.text();
  } catch {
    return NextResponse.json({ error: "Failed to read file content" }, { status: 500 });
  }

  const result = Papa.parse<MonzoRow>(text, {
    header: true,
    skipEmptyLines: true,
  });

  if (result.errors.length > 0 && result.data.length === 0) {
    return NextResponse.json(
      { error: "CSV parse failed", details: result.errors.map((e) => e.message) },
      { status: 422 },
    );
  }

  const transactions: Transaction[] = result.data
    .map(mapRow)
    .filter((t) => !(t.amount === 0 && t.name === ""));

  return NextResponse.json({ transactions, count: transactions.length });
}
