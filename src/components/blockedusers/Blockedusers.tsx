"use client";

import React, { useState, useEffect } from "react";
import { UserX, Loader, Ban, Trash2 } from "lucide-react";
import API from "@/utils/API";
import { getJwtFromLocalStorage } from "@/utils/localStorage";
import { AxiosError } from "axios";
import { Alert, AlertDescription } from "@/components/ui/alert";

const headers = {
  Authorization: `JWT ${getJwtFromLocalStorage()}`,
  "Content-Type": "application/json",
};

interface BlockedData {
  blockedAP: string[];
  blockedPL: string[];
  _id: string;
}

const BlockedUsers = () => {
  const [blockedData, setBlockedData] = useState<BlockedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newValue, setNewValue] = useState("");
  const [blockType, setBlockType] = useState<"ap" | "pl">("ap");
  const [blockLoading, setBlockLoading] = useState(false);
  const [blockError, setBlockError] = useState<string | null>(null);
  const [blockSuccess, setBlockSuccess] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchBlockedData();
  }, []);

  const fetchBlockedData = async () => {
    try {
      const response = await API.get("/api/v3/blocked", { headers });
      setBlockedData(response.data);
    } catch (error) {
      const errorMessage =
        error instanceof AxiosError
          ? error.response?.data?.message || error.message
          : "Failed to fetch blocked data";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setBlockLoading(true);
    setBlockError(null);
    setBlockSuccess(null);

    try {
      await API.post(
        `/api/v3/blocked/${blockType}`,
        { value: newValue },
        { headers },
      );
      setBlockSuccess(
        `Value "${newValue}" has been added to blocked${blockType.toUpperCase()} successfully`,
      );
      setNewValue("");
      fetchBlockedData();
    } catch (error) {
      const errorMessage =
        error instanceof AxiosError
          ? error.response?.data?.message || error.message
          : "Failed to add blocked value";
      setBlockError(errorMessage);
    } finally {
      setBlockLoading(false);
    }
  };

  const handleDelete = async (type: "ap" | "pl", value: string) => {
    setDeleteLoading(value);
    try {
      await API.delete(`/api/v3/blocked/${type}/${encodeURIComponent(value)}`, {
        headers,
      });
      fetchBlockedData();
    } catch (error) {
      const errorMessage =
        error instanceof AxiosError
          ? error.response?.data?.message || error.message
          : "Failed to delete blocked value";
      setBlockError(errorMessage);
    } finally {
      setDeleteLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader className="text-gray-500 h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-8 rounded-lg bg-white p-4 shadow">
        <h3 className="mb-4 text-lg font-medium">Add Blocked Value</h3>
        <form onSubmit={handleAddBlock} className="space-y-4">
          <div>
            <label
              htmlFor="blockType"
              className="text-gray-700 mb-1 block text-sm font-medium"
            >
              Block Type
            </label>
            <select
              id="blockType"
              value={blockType}
              onChange={(e) => setBlockType(e.target.value as "ap" | "pl")}
              className="border-gray-300 mb-4 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ap">Blocked AP</option>
              <option value="pl">Blocked PL</option>
            </select>

            <label
              htmlFor="newValue"
              className="text-gray-700 mb-1 block text-sm font-medium"
            >
              Value
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                id="newValue"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className="border-gray-300 flex-1 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter value to block"
                required
              />
              <button
                type="submit"
                disabled={blockLoading || !newValue}
                className="focus:ring-red-500 inline-flex w-fit items-center rounded-md bg-red px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:bg-[#FF0000] focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {blockLoading ? (
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Ban className="mr-2 h-4 w-4" />
                )}
                Block
              </button>
            </div>
          </div>

          {blockError && (
            <Alert
              variant="destructive"
              className="mb-4 rounded-lg border border-[#FF0000] bg-[#ff00002c] p-4 font-medium text-[#FF0000]"
            >
              <AlertDescription>{blockError}</AlertDescription>
            </Alert>
          )}
        </form>
      </div>

      {error && (
        <Alert
          variant="destructive"
          className="mb-4 rounded-lg border border-[#FF0000] bg-[#ff00002c] p-4 font-medium text-[#FF0000]"
        >
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!blockedData ||
      (blockedData.blockedAP.length === 0 &&
        blockedData.blockedPL.length === 0) ? (
        <div className="bg-gray-50 rounded-lg py-8 text-center">
          <UserX className="text-gray-400 mx-auto h-12 w-12" />
          <h3 className="text-gray-900 mt-2 text-sm font-semibold">
            No blocked values
          </h3>
          <p className="text-gray-500 mt-1 text-sm">
            There are currently no blocked values in the system.
          </p>
        </div>
      ) : (
        <div className="flex w-full flex-col gap-4 sm:flex-row">
          {blockedData.blockedAP.length > 0 && (
            <div className="w-full">
              <h2 className="mb-4 text-xl font-semibold">Blocked AP</h2>
              <div className="rounded-lg bg-white shadow">
                <ul className="divide-y divide-black/20">
                  {blockedData.blockedAP.map((value) => (
                    <li key={value} className="p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-gray-900 font-medium">{value}</p>
                        <button
                          onClick={() => handleDelete("ap", value)}
                          disabled={deleteLoading === value}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full p-1 transition-colors"
                        >
                          {deleteLoading === value ? (
                            <Loader className="h-5 w-5 animate-spin" />
                          ) : (
                            <Trash2 className="h-5 w-5" color="red" />
                          )}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {blockedData.blockedPL.length > 0 && (
            <div className="w-full">
              <h2 className="mb-4 text-xl font-semibold">Blocked PL</h2>
              <div className="rounded-lg bg-white shadow">
                <ul className="divide-y divide-black/20">
                  {blockedData.blockedPL.map((value) => (
                    <li key={value} className="hover:bg-gray-50 p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-gray-900 font-medium">{value}</p>
                        <button
                          onClick={() => handleDelete("pl", value)}
                          disabled={deleteLoading === value}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full p-1 transition-colors"
                        >
                          {deleteLoading === value ? (
                            <Loader className="h-5 w-5 animate-spin" />
                          ) : (
                            <Trash2 className="h-5 w-5" color="red" />
                          )}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BlockedUsers;
