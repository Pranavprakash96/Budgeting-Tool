"use client";

import { useState, useRef, useCallback, type DragEvent, type ChangeEvent } from "react";
import { Upload, FileText, AlertCircle, Loader2 } from "lucide-react";
import { parseMonzoCSV } from "@/lib/utils/parseMonzoCSV";
import { type Transaction } from "@/lib/types/transaction";

interface CSVUploadProps {
  onTransactionsLoaded: (transactions: Transaction[]) => void;
}

type State = "idle" | "dragging" | "loading" | "error";

export default function CSVUpload({ onTransactionsLoaded }: CSVUploadProps) {
  const [state, setState] = useState<State>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function processFile(file: File) {
    if (!file.name.endsWith(".csv") && file.type !== "text/csv") {
      setState("error");
      setErrorMessage("Please upload a CSV file.");
      return;
    }

    setState("loading");
    setErrorMessage("");

    try {
      const transactions = await parseMonzoCSV(file);
      if (transactions.length === 0) {
        setState("error");
        setErrorMessage("No transactions found in this file. Make sure it is a valid Monzo CSV export.");
        return;
      }
      setState("idle");
      onTransactionsLoaded(transactions);
    } catch (err) {
      setState("error");
      setErrorMessage(err instanceof Error ? err.message : "Failed to parse the CSV file.");
    }
  }

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setState("idle");
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, []);

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setState("dragging");
  }

  function handleDragLeave(e: DragEvent<HTMLDivElement>) {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setState("idle");
    }
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  }

  const isDragging = state === "dragging";
  const isLoading = state === "loading";
  const isError = state === "error";

  return (
    <div className="w-full space-y-3">
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload CSV file"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !isLoading && inputRef.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && !isLoading && inputRef.current?.click()}
        className={[
          "relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors outline-none",
          isLoading
            ? "cursor-not-allowed border-gray-200 bg-gray-50"
            : "cursor-pointer focus-visible:ring-2 focus-visible:ring-[#209dd7] focus-visible:ring-offset-2",
          isDragging
            ? "border-[#209dd7] bg-[#209dd7]/5"
            : isError
            ? "border-red-300 bg-red-50"
            : "border-gray-200 bg-white hover:border-[#209dd7]/50 hover:bg-[#209dd7]/5",
        ].join(" ")}
      >
        {isLoading ? (
          <>
            <Loader2 size={32} className="animate-spin text-[#209dd7]" />
            <p className="text-sm font-medium text-[#888888]">Parsing transactions...</p>
          </>
        ) : isDragging ? (
          <>
            <Upload size={32} className="text-[#209dd7]" />
            <p className="text-sm font-semibold text-[#209dd7]">Drop to upload</p>
          </>
        ) : (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#209dd7]/10">
              <FileText size={24} className="text-[#209dd7]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#032147]">
                Drop your Monzo CSV here, or{" "}
                <span className="text-[#209dd7] underline underline-offset-2">browse</span>
              </p>
              <p className="mt-1 text-xs text-[#888888]">CSV files only</p>
            </div>
          </>
        )}

        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="sr-only"
          onChange={handleInputChange}
          disabled={isLoading}
        />
      </div>

      {isError && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0 text-red-500" />
          <p className="text-sm text-red-600">{errorMessage}</p>
        </div>
      )}
    </div>
  );
}
