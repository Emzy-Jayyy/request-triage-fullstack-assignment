import { useState } from "react";
import type { FormEvent } from "react";

import {
  updateRequest,
  type RequestRecord,
  type RequestStatus,
  type UpdateRequestInput,
} from "../api";

type RequestDetailsProps = {
  request: RequestRecord;
  onSaved: (updated: RequestRecord) => void;
};

export default function RequestDetails({
  request,
  onSaved,
}: RequestDetailsProps) {
  const [status, setStatus] = useState<RequestStatus>(request.status);

  const [owner, setOwner] = useState(request.owner ?? "");

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Compare the form against the stored request.
  const normalizedOwner = owner.trim() || null;

  const statusChanged = status !== request.status;

  const ownerChanged = normalizedOwner !== request.owner;

  const hasChanges = statusChanged || ownerChanged;

  async function handleSave() {
    if (!hasChanges || isSaving) return;

    const changes: UpdateRequestInput = {};

    // Send only the fields that actually changed.
    if (statusChanged) {
      changes.status = status;
    }

    if (ownerChanged) {
      changes.owner = normalizedOwner;
    }

    setIsSaving(true);
    setError(null);
    setSaved(false);

    try {
      const updated = await updateRequest(request.id, changes);

      // Synchronize inputs with the server response.
      setStatus(updated.status);
      setOwner(updated.owner ?? "");

      setSaved(true);
      onSaved(updated);
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : "Unable to save changes",
      );
    } finally {
      setIsSaving(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void handleSave();
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <header>
        <p className="text-xs font-semibold text-blue-700">
          {request.externalId}
        </p>

        <h2 className="mt-1 break-words text-xl font-semibold text-slate-900">
          {request.subject}
        </h2>

        <p className="mt-2 text-xs text-slate-500">Internal ID: {request.id}</p>
      </header>

      <dl className="mt-6 grid gap-5 border-t border-slate-100 pt-5 sm:grid-cols-2">
        <div>
          <dt className="text-xs text-slate-500">Requester</dt>
          <dd className="mt-1 font-medium text-slate-900">
            {request.requester}
          </dd>
        </div>

        <div>
          <dt className="text-xs text-slate-500">Priority</dt>
          <dd className="mt-1 font-medium capitalize text-slate-900">
            {request.priority}
          </dd>
        </div>

        <div className="sm:col-span-2">
          <dt className="text-xs text-slate-500">Received at</dt>
          <dd className="mt-1 text-sm text-slate-900">
            <time dateTime={request.receivedAt}>
              {new Date(request.receivedAt).toLocaleString()}
            </time>
          </dd>
        </div>

        <div className="sm:col-span-2">
          <dt className="text-xs text-slate-500">Description</dt>
          <dd className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
            {request.description || "No description provided"}
          </dd>
        </div>
      </dl>

      <form
        onSubmit={handleSubmit}
        aria-busy={isSaving}
        className="mt-6 space-y-5 border-t border-slate-200 pt-6"
      >
        <h3 className="text-base font-semibold text-slate-900">
          Update request
        </h3>

        <div>
          <label
            htmlFor={`status-${request.id}`}
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Status
          </label>

          <select
            id={`status-${request.id}`}
            value={status}
            disabled={isSaving}
            onChange={(event) => {
              setStatus(event.target.value as RequestStatus);
              setSaved(false);
            }}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
          >
            <option value="NEW">New</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>

        <div>
          <label
            htmlFor={`owner-${request.id}`}
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Assigned owner
          </label>

          <input
            id={`owner-${request.id}`}
            type="text"
            value={owner}
            disabled={isSaving}
            onChange={(event) => {
              setOwner(event.target.value);
              setSaved(false);
            }}
            placeholder="Enter owner name"
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
          />

          <p className="mt-2 text-xs text-slate-500">
            Leave empty to unassign this request.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {saved && (
          <p role="status" className="text-sm font-medium text-green-700">
            Changes saved successfully.
          </p>
        )}

        <button
          type="submit"
          disabled={!hasChanges || isSaving}
          className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? "Saving changes..." : "Save changes"}
        </button>
      </form>
    </section>
  );
}
