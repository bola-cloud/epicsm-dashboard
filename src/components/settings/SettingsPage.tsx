"use client";

import API from "@/utils/API";
import { getJwtFromLocalStorage } from "@/utils/localStorage";
import { AxiosError } from "axios";
import { Loader } from "lucide-react";
import React, { useEffect, useState } from "react";

export interface Settings {
  executionMethod: string;
  executionMethods: string[];
  reportErrors: boolean;
  reportHtml: boolean;
  mimicScroll: boolean;
  rt: number;
  rrt: number;
}

const headers = {
  Authorization: `JWT ${getJwtFromLocalStorage()}`,
  "Content-Type": "application/json",
};

function SettingsPage() {
  const [settings, setSettings] = useState({
    executionMethod: "",
    executionMethods: [""],
    reportErrors: false,
    reportHtml: false,
    mimicScroll: false,
    rt: 0,
    rrt: 0,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const fetchSettings = async (): Promise<void> => {
    try {
      const res = await API.get<Settings>("/api/v3/settings", {
        headers,
      });
      setSettings(res.data);
    } catch (error) {
      const errorMessage =
        error instanceof AxiosError
          ? error.response?.data?.error || error.message
          : "Failed to load settings";

      setMessage({ type: "error", text: errorMessage });
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await API.post("/api/v3/settings", settings, {
        headers,
      });

      if (res.status !== 200) {
        throw new Error("Failed to save settings");
      }

      setMessage({ type: "success", text: "Settings saved successfully" });
    } catch (error) {
      const errorMessage =
        error instanceof AxiosError
          ? error.response?.data?.error || error.message
          : "Failed to save settings";

      setMessage({ type: "error", text: errorMessage });
    } finally {
      setLoading(false);
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
    <div className="mx-auto p-6">
      <div className="rounded-lg bg-white p-6 shadow-md">
        <h1 className="mb-6 text-2xl font-bold">Settings</h1>

        {message.text && (
          <div
            className={`mb-4 rounded-lg p-4 font-semibold ${
              message.type === "error"
                ? "border border-[#FF0000] bg-[#ff00002c] text-[#FF0000]"
                : "border border-green-200 bg-green-50 text-green-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="executionMethod"
              className="text-gray-700 mb-1 block text-sm font-medium"
            >
              Execution Method
            </label>
            <select
              id="executionMethod"
              value={settings.executionMethod}
              onChange={(e) =>
                setSettings({ ...settings, executionMethod: e.target.value })
              }
              className="border-gray-300 w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {settings?.executionMethods &&
                settings?.executionMethods.map((method) => (
                  <option key={method} value={method}>
                    {method.charAt(0).toUpperCase() + method.slice(1)}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="rt"
              className="text-gray-700 mb-1 block text-sm font-medium"
            >
              Range Time (milliseconds)
            </label>
            <input
              type="number"
              id="rt"
              min="0"
              value={settings.rt}
              onChange={(e) =>
                setSettings({ ...settings, rt: parseInt(e.target.value) || 0 })
              }
              className="border-gray-300 w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="rrt"
              className="text-gray-700 mb-1 block text-sm font-medium"
            >
              Random Range Time (milliseconds)
            </label>
            <input
              type="number"
              id="rrt"
              min="0"
              value={settings.rrt}
              onChange={(e) =>
                setSettings({ ...settings, rrt: parseInt(e.target.value) || 0 })
              }
              className="border-gray-300 w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <label
              htmlFor="reportErrors"
              className="text-gray-700 text-sm font-medium"
            >
              Report Errors
            </label>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                id="reportErrors"
                checked={settings.reportErrors}
                onChange={(e) =>
                  setSettings({ ...settings, reportErrors: e.target.checked })
                }
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-[#dbdbdb] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-[#808080] after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <label
              htmlFor="reportHtml"
              className="text-gray-700 text-sm font-medium"
            >
              Report HTML
            </label>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                id="reportHtml"
                checked={settings.reportHtml}
                onChange={(e) =>
                  setSettings({ ...settings, reportHtml: e.target.checked })
                }
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-[#dbdbdb] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-[#808080] after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <label
              htmlFor="mimicScroll"
              className="text-gray-700 text-sm font-medium"
            >
              Mimic Scroll
            </label>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                id="mimicScroll"
                checked={settings.mimicScroll}
                onChange={(e) =>
                  setSettings({ ...settings, mimicScroll: e.target.checked })
                }
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-[#dbdbdb] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-[#808080] after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300"></div>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-md border border-transparent bg-blue-600 px-4 py-2 text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              loading ? "cursor-not-allowed opacity-50" : ""
            }`}
          >
            {loading ? "Saving..." : "Save Settings"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default SettingsPage;
