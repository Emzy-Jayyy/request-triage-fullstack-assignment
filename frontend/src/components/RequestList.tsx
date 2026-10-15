import type { RequestRecord, RequestStatus } from "../api";

type RequestListProps = {
  requests: RequestRecord[];
  selectedId: number | null;
  onSelect: (id: number) => void;
};

const statusLabels: Record<RequestStatus, string> = {
  NEW: "New",
  IN_PROGRESS: "In progress",
  RESOLVED: "Resolved",
};

const statusStyles: Record<RequestStatus, string> = {
  NEW: "bg-blue-50 text-blue-700",
  IN_PROGRESS: "bg-amber-50 text-amber-700",
  RESOLVED: "bg-green-50 text-green-700",
};

const RequestList = ({ requests, selectedId, onSelect }: RequestListProps) => {
  if (requests.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
        <h3 className="font-semibold text-slate-900">No requests found</h3>

        <p className="mt-2 text-sm text-slate-500">
          There are no requests matching this status.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {requests.map((request) => (
        <article
          key={request.id}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500">
                {request.externalId}
              </p>

              <h3 className="mt-1 break-words text-base font-semibold text-slate-900">
                {request.subject}
              </h3>
            </div>

            <span
              className={`w-fit shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[request.status]}`}
            >
              {statusLabels[request.status]}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-sm sm:grid-cols-3">
            <div>
              <p className="text-xs text-slate-500">Requester</p>

              <p className="mt-1 break-words font-medium text-slate-800">
                {request.requester}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">Priority</p>

              <p className="mt-1 font-medium capitalize text-slate-800">
                {request.priority}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">Owner</p>

              <p className="mt-1 break-words font-medium text-slate-800">
                {request.owner ?? "Unassigned"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onSelect(request.id)}
            aria-pressed={selectedId === request.id}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            {selectedId === request.id ? "Viewing details" : "View details"}
          </button>
        </article>
      ))}
    </div>
  );
};

export default RequestList;
