import { useEffect, useState } from "react";
import {
  getRequest,
  listRequests,
  type RequestRecord,
  type RequestStatus,
} from "./api";
import RequestList from "./components/RequestList";
import RequestDetails from "./components/RequestDetails";
import ResponsiveDetails from "./components/ResponsiveDetails";
import ImportRequests from "./components/ImportRequests";

type StatusFilter = "ALL" | RequestStatus;

type LoadResult = {
  filter: StatusFilter;
  retry: number;
  requests: RequestRecord[];
  error: string | null;
};

const App = () => {
  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const [retry, setRetry] = useState(0);
  const [result, setResult] = useState<LoadResult | null>(null);

  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [detail, setDetail] = useState<{
    id: number;
    request: RequestRecord | null;
    error: string | null;
  } | null>(null);

  const [detailRetry, setDetailRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const selectedStatus = filter === "ALL" ? undefined : filter;

    void listRequests(selectedStatus, controller.signal)
      .then((requests) => {
        if (!controller.signal.aborted) {
          setResult({
            filter,
            retry,
            requests,
            error: null,
          });
        }
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setResult({
            filter,
            retry,
            requests: [],
            error:
              error instanceof Error
                ? error.message
                : "Unable to load requests",
          });
        }
      });

    return () => {
      controller.abort();
    };
  }, [filter, retry]);

  useEffect(() => {
    if (selectedId === null) return;

    const controller = new AbortController();

    void getRequest(selectedId, controller.signal)
      .then((request) => {
        if (!controller.signal.aborted) {
          setDetail({
            id: selectedId,
            request,
            error: null,
          });
        }
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setDetail({
            id: selectedId,
            request: null,
            error:
              error instanceof Error
                ? error.message
                : "Could not load request details",
          });
        }
      });

    return () => controller.abort();
  }, [selectedId, detailRetry]);

  const isLoading = result === null || result.filter !== filter;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-700">
            Operations workspace
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Request Triage
          </h1>

          <p className="mt-3 text-sm text-slate-600 sm:text-base">
            Review customer requests and track their progress.
          </p>
        </header>

        <ImportRequests
          onImported={() => {
            setRetry((value) => value + 1);
          }}
        />

        <section className="mt-10 mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Requests</h2>

            <p className="mt-1 text-sm text-slate-500">
              {isLoading
                ? "Loading requests..."
                : result.error
                  ? "Unable to load requests"
                  : `${result.requests.length} requests`}
            </p>
          </div>

          <div className="w-full sm:w-52">
            <label
              htmlFor="status-filter"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Filter by status
            </label>

            <select
              id="status-filter"
              value={filter}
              onChange={(event) => {
                setFilter(event.target.value as StatusFilter);
                setSelectedId(null);
                setDetail(null);
              }}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            >
              <option value="ALL">All requests</option>
              <option value="NEW">New</option>
              <option value="IN_PROGRESS">In progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
        </section>

        {isLoading ? (
          <div
            role="status"
            className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-600"
          >
            Loading requests...
          </div>
        ) : result.error ? (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-white p-6"
          >
            <h3 className="font-semibold text-red-700">
              Could not load requests
            </h3>

            <p className="mt-2 text-sm text-slate-600">{result.error}</p>

            <button
              type="button"
              onClick={() => setRetry((value) => value + 1)}
              className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.85fr)]">
            <RequestList
              requests={result.requests}
              selectedId={selectedId}
              onSelect={(id) => {
                setSelectedId(id);
                setDetail(null);
              }}
            />

            {selectedId !== null && (
              <ResponsiveDetails
                onClose={() => {
                  setSelectedId(null);
                  setDetail(null);
                }}
              >
                {detail?.id !== selectedId ? (
                  <div
                    role="status"
                    className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600"
                  >
                    Loading request details...
                  </div>
                ) : detail.error ? (
                  <div
                    role="alert"
                    className="rounded-2xl border border-red-200 bg-white p-6"
                  >
                    <p className="font-semibold text-red-700">
                      Could not load details
                    </p>

                    <p className="mt-2 text-sm text-slate-600">
                      {detail.error}
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        setDetail(null);
                        setDetailRetry((value) => value + 1);
                      }}
                      className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white"
                    >
                      Try again
                    </button>
                  </div>
                ) : detail.request ? (
                  <RequestDetails
                    key={detail.request.id}
                    request={detail.request}
                    onSaved={(updated) => {
                      // Update the selected request without allowing
                      // an old save to overwrite another selection.
                      setDetail((current) =>
                        current?.id === updated.id
                          ? {
                              id: updated.id,
                              request: updated,
                              error: null,
                            }
                          : current,
                      );

                      // Immediately synchronize the visible list
                      // with the server's successful response.
                      setResult((current) => {
                        if (!current || current.error) {
                          return current;
                        }

                        const matchesFilter =
                          current.filter === "ALL" ||
                          updated.status === current.filter;

                        return {
                          ...current,
                          requests: current.requests
                            .filter(
                              (item) => item.id !== updated.id || matchesFilter,
                            )
                            .map((item) =>
                              item.id === updated.id ? updated : item,
                            ),
                        };
                      });

                      // Close details if the saved request no longer
                      // matches the selected status filter.
                      if (filter !== "ALL" && updated.status !== filter) {
                        setSelectedId((current) =>
                          current === updated.id ? null : current,
                        );
                      }

                      // Fetch authoritative list data again.
                      setRetry((value) => value + 1);
                    }}
                  />
                ) : null}
              </ResponsiveDetails>
            )}
          </div>
        )}
      </div>
    </main>
  );
};

export default App;
