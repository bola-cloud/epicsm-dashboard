"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Filter } from "lucide-react";
import API from "@/utils/API";
import { AxiosError } from "axios";

interface Log {
  _id: string;
  userId: string;
  type: "Error" | "Warning" | "Info";
  content: string;
  timestamp: string;
}

interface LogsResponse {
  logs: Log[];
  pages: number;
  total: number;
  currentPage: number;
}

interface FilterState {
  userId: string;
  type: "" | "Error" | "Warning" | "Info";
  startDate: string;
  endDate: string;
}

interface ExpandedLogs {
  [key: string]: boolean;
}

interface TypeColors {
  background: string;
  text: string;
}

// Helper function to check if content is HTML
const isHTML = (str: string): boolean => {
  const doc = new DOMParser().parseFromString(str, "text/html");
  return Array.from(doc.body.childNodes).some((node) => node.nodeType === 1);
};

// Safe HTML component with sanitization
const SafeHTML = ({ content }: { content: string }) => {
  return <div dangerouslySetInnerHTML={{ __html: content }} />;
};

const Logs = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [expandedLogs, setExpandedLogs] = useState<ExpandedLogs>({});
  const [filters, setFilters] = useState<FilterState>({
    userId: "",
    type: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    fetchLogs();
  }, [page, filters]);

  const fetchLogs = async (): Promise<void> => {
    try {
      setLoading(true);
      const { data } = await API.get<LogsResponse>("/api/v2/stats/logs", {
        params: {
          page,
          limit: 10,
          ...filters,
        },
      });

      setLogs(data.logs);
      setTotalPages(data.pages);
    } catch (error) {
      console.error("Error fetching logs:", error);
      if (error instanceof AxiosError) {
        const errorMessage = error.response?.data?.message || error.message;
        console.error("Axios error:", errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (logId: string): void => {
    setExpandedLogs((prev) => ({
      ...prev,
      [logId]: !prev[logId],
    }));
  };

  const getTypeColor = (type: Log["type"]): TypeColors => {
    switch (type) {
      case "Error":
        return {
          background: "#FEE2E2",
          text: "#b32626",
        };
      case "Warning":
        return {
          background: "#FDE68A",
          text: "#B45309",
        };
      case "Info":
        return {
          background: "#BFDBFE",
          text: "#1D4ED8",
        };
      default:
        return {
          background: "#F3F4F6",
          text: "#374151",
        };
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Logs</h1>

      <div className="mb-6 rounded-lg bg-white p-4 shadow">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span className="font-medium">Filters:</span>
          </div>

          <input
            type="text"
            placeholder="User ID"
            className="rounded border px-3 py-2"
            value={filters.userId}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, userId: e.target.value }))
            }
          />

          <select
            className="rounded border px-3 py-2"
            value={filters.type}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                type: e.target.value as FilterState["type"],
              }))
            }
          >
            <option value="">All Types</option>
            <option value="Error">Error</option>
            <option value="Warning">Warning</option>
            <option value="Info">Info</option>
          </select>

          <input
            type="date"
            className="rounded border px-3 py-2"
            value={filters.startDate}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, startDate: e.target.value }))
            }
          />

          <input
            type="date"
            className="rounded border px-3 py-2"
            value={filters.endDate}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, endDate: e.target.value }))
            }
          />
        </div>
      </div>

      {loading ? (
        <div className="py-8 text-center">Loading...</div>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => {
            const typeColors = getTypeColor(log.type);
            const isContentHTML = isHTML(log.content);

            return (
              <div
                key={log._id}
                className="rounded-lg bg-white shadow transition-colors duration-200"
                style={{ backgroundColor: typeColors.background }}
              >
                <div
                  className="flex cursor-pointer items-center justify-between p-4"
                  onClick={() => toggleExpand(log._id)}
                >
                  <div className="flex items-center gap-4">
                    <span style={{ color: typeColors.text }}>
                      UserID: {log.userId}
                    </span>
                    <span style={{ color: typeColors.text }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  {expandedLogs[log._id] ? (
                    <ChevronUp
                      style={{ color: typeColors.text }}
                      className="h-5 w-5"
                    />
                  ) : (
                    <ChevronDown
                      style={{ color: typeColors.text }}
                      className="h-5 w-5"
                    />
                  )}
                </div>

                {expandedLogs[log._id] && (
                  <div className="border-t border-black border-opacity-20 px-2 pb-4">
                    <div className="mt-4 flex items-center gap-3">
                      <span
                        className="rounded-full px-3 py-1 text-sm font-semibold"
                        style={{ color: typeColors.text }}
                      >
                        {log.type}
                      </span>
                      <div style={{ color: typeColors.text }}>
                        {isContentHTML ? (
                          <SafeHTML content={log.content} />
                        ) : (
                          <p>{log.content}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6 flex justify-center gap-2">
        <button
          className="rounded border px-4 py-2 disabled:opacity-50"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </button>
        <span className="px-4 py-2">
          Page {page} of {totalPages}
        </span>
        <button
          className="rounded border px-4 py-2 disabled:opacity-50"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Logs;
