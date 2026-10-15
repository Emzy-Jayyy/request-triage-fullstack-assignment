export type RequestStatus = "NEW" | "IN_PROGRESS" | "RESOLVED";

export type RequestPriority = "low" | "normal" | "high" | "urgent";

export type RequestRecord = {
  id: number;
  externalId: string;
  receivedAt: string;
  requester: string;
  subject: string;
  description: string | null;
  priority: RequestPriority;
  status: RequestStatus;
  owner: string | null;
};

export type UpdateRequestInput = {
  status?: RequestStatus;
  owner?: string | null;
};

export type ImportError = {
  row: number;
  reason: string;
};

export type ImportResult = {
  imported: number;
  rejected: number;
  errors: ImportError[];
};

type ApiErrorBody = {
  message?: string | string[];
};

export async function listRequests(
  status?: RequestStatus,
  signal?: AbortSignal,
): Promise<RequestRecord[]> {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";

  const response = await fetch(`/api/requests${query}`, {
    signal,
  });

  if (!response.ok) {
    const error: ApiErrorBody = await response.json().catch(() => ({}));

    const message = Array.isArray(error.message)
      ? error.message.join(", ")
      : (error.message ?? `Request failed (${response.status})`);

    throw new Error(message);
  }

  return (await response.json()) as RequestRecord[];
}

export async function getRequest(
  id: number,
  signal?: AbortSignal,
): Promise<RequestRecord> {
  const response = await fetch(`/api/requests/${id}`, {
    signal,
  });

  if (!response.ok) {
    const error: ApiErrorBody = await response.json().catch(() => ({}));

    const message = Array.isArray(error.message)
      ? error.message.join(", ")
      : (error.message ?? `Request failed (${response.status})`);

    throw new Error(message);
  }

  return (await response.json()) as RequestRecord;
}

export async function updateRequest(
  id: number,
  changes: UpdateRequestInput,
): Promise<RequestRecord> {
  const response = await fetch(`/api/requests/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(changes),
  });

  if (!response.ok) {
    const error: ApiErrorBody = await response.json().catch(() => ({}));

    const message = Array.isArray(error.message)
      ? error.message.join(", ")
      : (error.message ?? `Failed to update request (${response.status})`);

    throw new Error(message);
  }

  return (await response.json()) as RequestRecord;
}

export async function importRequests(file: File): Promise<ImportResult> {
  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch("/api/requests/import", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error: ApiErrorBody = await response.json().catch(() => ({}));

    const message = Array.isArray(error.message)
      ? error.message.join(", ")
      : (error.message ?? `Import failed (${response.status})`);

    throw new Error(message);
  }

  return (await response.json()) as ImportResult;
}
