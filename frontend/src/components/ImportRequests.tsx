import { useState, type FormEvent } from "react";

import { importRequests, type ImportResult } from "../api";

type ImportRequestsProps = {
  onImported: () => void;
};

const MAX_FILE_SIZE = 1024 * 1024;

const ImportRequests = ({ onImported }: ImportRequestsProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!file || isUploading) return;

    setError(null);
    setResult(null);

    if (file.size > MAX_FILE_SIZE) {
      setError("The selected file must not exceed 1 MB.");
      return;
    }

    if (file.size === 0) {
      setError("The selected file is empty.");
      return;
    }

    setIsUploading(true);

    try {
      const importResult = await importRequests(file);

      setResult(importResult);

      // Tell App.tsx to refresh the request list.
      onImported();
    } catch (caughtError: unknown) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to import the CSV file.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <section
      aria-labelledby="import-heading"
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="mb-5">
        <h2
          id="import-heading"
          className="text-lg font-semibold text-slate-900"
        >
          Import requests
        </h2>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          Upload a CSV file to add requests. Invalid or duplicate rows will be
          reported.
        </p>
      </div>

      <form
        onSubmit={(event) => void handleSubmit(event)}
        aria-busy={isUploading}
        className="space-y-4"
      >
        <div>
          <label
            htmlFor="requests-csv"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            CSV file
          </label>

          <input
            id="requests-csv"
            type="file"
            accept=".csv,text/csv"
            disabled={isUploading}
            onChange={(event) => {
              setFile(event.target.files?.[0] ?? null);
              setError(null);
              setResult(null);
            }}
            className="block w-full min-w-0 rounded-xl border border-slate-300 bg-slate-50 p-3 text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-200 disabled:opacity-60"
          />

          <p className="mt-2 text-xs text-slate-500">
            Maximum file size: 1 MB.
          </p>
        </div>

        <button
          type="submit"
          disabled={!file || isUploading}
          className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {isUploading ? "Importing requests..." : "Import CSV"}
        </button>
      </form>

      {error && (
        <div
          role="alert"
          className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {result && (
        <div
          aria-live="polite"
          className="mt-6 space-y-5 border-t border-slate-200 pt-5"
        >
          <h3 className="text-base font-semibold text-slate-900">
            Import results
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-green-200 bg-green-50 p-4">
              <p className="text-2xl font-bold text-green-700">
                {result.imported}
              </p>

              <p className="mt-1 text-sm text-green-800">Imported</p>
            </div>

            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-2xl font-bold text-red-700">
                {result.rejected}
              </p>

              <p className="mt-1 text-sm text-red-800">Rejected</p>
            </div>
          </div>

          {result.errors.length > 0 ? (
            <div>
              <h4 className="mb-3 text-sm font-semibold text-slate-900">
                Rejection details
              </h4>

              <ul className="max-h-72 space-y-2 overflow-y-auto overscroll-contain pr-1">
                {result.errors.map((item, index) => (
                  <li
                    key={`${item.row}-${index}`}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm"
                  >
                    <span className="font-semibold text-slate-900">
                      Row {item.row}
                    </span>

                    <p className="mt-1 break-words text-slate-600">
                      {item.reason}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p role="status" className="text-sm text-green-700">
              No rejected rows.
            </p>
          )}
        </div>
      )}
    </section>
  );
};

export default ImportRequests;
