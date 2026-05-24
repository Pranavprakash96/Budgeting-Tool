"use client";

import { useState, useRef, useCallback } from "react";
import { X, Upload, FileText, AlertTriangle, Check, RotateCcw } from "lucide-react";
import { parseCSV, toTransactions, type ParsedRow } from "@/lib/csv-parser";
import { useData } from "@/lib/data-context";
import { formatCurrency } from "@/lib/utils";
import { type AccountType } from "@/lib/mock-data";

interface Props {
  onClose: () => void;
}

type Step = "upload" | "preview" | "success";

const ACCOUNT_TYPES: AccountType[] = ["checking", "savings", "credit", "investment"];

export default function BankImportModal({ onClose }: Props) {
  const { importTransactions, resetToMockData, hasImportedData } = useData();
  const [step, setStep] = useState<Step>("upload");
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const [bankName, setBankName] = useState("");
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [accountName, setAccountName] = useState("Imported Account");
  const [accountType, setAccountType] = useState<AccountType>("checking");
  const [importCount, setImportCount] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  function processFile(file: File) {
    if (!file.name.endsWith(".csv") && file.type !== "text/csv") {
      setParseErrors(["Please upload a CSV file. Most banks let you export transactions as CSV."]);
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const result = parseCSV(content, "preview");
      setBankName(result.bankName);
      setParsedRows(result.rows);
      setParseErrors(result.errors);
      if (result.rows.length > 0) setStep("preview");
    };
    reader.readAsText(file);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, []);

  function confirmImport() {
    const accountId = `imported-${Date.now()}`;
    const txns = toTransactions(parsedRows, accountId);
    const credits = txns.filter((t) => t.type === "credit").reduce((s, t) => s + t.amount, 0);
    const debits = txns.filter((t) => t.type === "debit").reduce((s, t) => s + t.amount, 0);
    const balance = credits - debits;

    importTransactions(txns, {
      id: accountId,
      name: accountName,
      institution: bankName !== "Generic" ? bankName : "Imported",
      type: accountType,
      balance,
      currency: "GBP",
    });
    setImportCount(txns.length);
    setStep("success");
  }

  const debits = parsedRows.filter((r) => r.type === "debit");
  const credits = parsedRows.filter((r) => r.type === "credit");
  const previewRows = parsedRows.slice(0, 8);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-lg font-bold text-[#032147]">Import Bank Statement</h2>
            <p className="text-[#888888] text-xs mt-0.5">Upload a CSV export from your bank</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-[#888888] hover:bg-gray-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Step: Upload */}
          {step === "upload" && (
            <>
              {/* Drop zone */}
              <div
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors cursor-pointer ${
                  isDragging ? "border-[#209dd7] bg-[#209dd7]/5" : "border-gray-200 hover:border-[#209dd7]/50"
                }`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
              >
                <Upload size={32} className="mx-auto text-[#209dd7] mb-3" />
                <p className="text-[#032147] font-semibold">Drop your CSV here, or click to browse</p>
                <p className="text-[#888888] text-sm mt-1">Supports Monzo, Barclays, Starling, HSBC, and most CSV exports</p>
                <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFileInput} />
              </div>

              {parseErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
                  <AlertTriangle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    {parseErrors.map((e, i) => <p key={i} className="text-red-600 text-sm">{e}</p>)}
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="bg-[#032147]/5 rounded-xl p-4 space-y-2">
                <p className="text-sm font-semibold text-[#032147]">How to export from your bank</p>
                <ul className="text-xs text-[#888888] space-y-1 list-disc list-inside">
                  <li><span className="font-medium text-[#032147]">Monzo:</span> Account tab → Export transactions → CSV</li>
                  <li><span className="font-medium text-[#032147]">Barclays:</span> Statements → Export → CSV format</li>
                  <li><span className="font-medium text-[#032147]">Starling:</span> Account → Download Statement → CSV</li>
                  <li><span className="font-medium text-[#032147]">HSBC:</span> View Statement → Download → CSV</li>
                  <li><span className="font-medium text-[#032147]">Other banks:</span> Look for Export / Download Transactions in statements</li>
                </ul>
              </div>

              {hasImportedData && (
                <button
                  onClick={() => { resetToMockData(); onClose(); }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl text-sm text-[#888888] hover:text-red-500 hover:border-red-300 transition-colors"
                >
                  <RotateCcw size={14} /> Reset to sample data
                </button>
              )}
            </>
          )}

          {/* Step: Preview */}
          {step === "preview" && (
            <>
              <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-3">
                <FileText size={16} className="text-green-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-[#032147]">{fileName}</p>
                  <p className="text-xs text-[#888888]">Detected format: <span className="font-medium text-[#209dd7]">{bankName}</span> — {parsedRows.length} transactions found</p>
                </div>
              </div>

              {parseErrors.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
                  <AlertTriangle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>{parseErrors.map((e, i) => <p key={i} className="text-xs text-amber-700">{e}</p>)}</div>
                </div>
              )}

              {/* Summary stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#032147]/5 rounded-xl p-3 text-center">
                  <p className="text-xs text-[#888888]">Total rows</p>
                  <p className="text-xl font-bold text-[#032147]">{parsedRows.length}</p>
                </div>
                <div className="bg-red-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-[#888888]">Debits</p>
                  <p className="text-xl font-bold text-red-500">{debits.length}</p>
                  <p className="text-xs text-[#888888]">{formatCurrency(debits.reduce((s, r) => s + r.amount, 0))}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-[#888888]">Credits</p>
                  <p className="text-xl font-bold text-green-600">{credits.length}</p>
                  <p className="text-xs text-[#888888]">{formatCurrency(credits.reduce((s, r) => s + r.amount, 0))}</p>
                </div>
              </div>

              {/* Account settings */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                <p className="text-sm font-semibold text-[#032147]">Account details</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[#888888] font-medium block mb-1">Account name</label>
                    <input
                      type="text"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-[#032147] focus:outline-none focus:border-[#209dd7]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#888888] font-medium block mb-1">Account type</label>
                    <select
                      value={accountType}
                      onChange={(e) => setAccountType(e.target.value as AccountType)}
                      className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm text-[#032147] focus:outline-none focus:border-[#209dd7]"
                    >
                      {ACCOUNT_TYPES.map((t) => <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Preview table */}
              <div>
                <p className="text-xs text-[#888888] font-medium mb-2">Preview (first {previewRows.length} rows)</p>
                <div className="border border-gray-100 rounded-xl overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-[#032147]/5">
                        <th className="text-left px-3 py-2 text-[#888888] font-medium">Date</th>
                        <th className="text-left px-3 py-2 text-[#888888] font-medium">Description</th>
                        <th className="text-right px-3 py-2 text-[#888888] font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewRows.map((row, i) => (
                        <tr key={i} className="border-t border-gray-50">
                          <td className="px-3 py-2 text-[#888888] whitespace-nowrap">{row.date}</td>
                          <td className="px-3 py-2 text-[#032147] truncate max-w-[180px]">{row.description}</td>
                          <td className={`px-3 py-2 text-right font-medium whitespace-nowrap ${row.type === "credit" ? "text-green-600" : "text-[#032147]"}`}>
                            {row.type === "credit" ? "+" : "-"}{formatCurrency(row.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {parsedRows.length > 8 && (
                    <p className="text-center text-xs text-[#888888] py-2 bg-gray-50 border-t border-gray-100">
                      +{parsedRows.length - 8} more rows
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setStep("upload")}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-[#888888] hover:border-gray-300 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={confirmImport}
                  className="flex-1 py-2.5 bg-[#753991] text-white rounded-xl text-sm font-semibold hover:bg-[#753991]/90 transition-colors"
                >
                  Import {parsedRows.length} transactions
                </button>
              </div>
            </>
          )}

          {/* Step: Success */}
          {step === "success" && (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Check size={28} className="text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-[#032147]">Import complete</h3>
              <p className="text-[#888888] text-sm mt-1">
                {importCount} transactions imported from <span className="font-medium text-[#032147]">{fileName}</span>
              </p>
              <p className="text-xs text-[#888888] mt-1">Categories were assigned automatically — you can review them in Transactions.</p>
              <button
                onClick={onClose}
                className="mt-6 px-8 py-2.5 bg-[#032147] text-white rounded-xl text-sm font-semibold hover:bg-[#032147]/90 transition-colors"
              >
                View transactions
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
