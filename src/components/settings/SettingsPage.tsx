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
  globalDailyReward?: number;
  rewardDelayMinutes?: number;
  pointsPerDollar?: number;
}

const headers = {
  Authorization: `JWT ${getJwtFromLocalStorage()}`,
  "Content-Type": "application/json",
};

function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    executionMethod: "",
    executionMethods: [""],
    reportErrors: false,
    reportHtml: false,
    mimicScroll: false,
    rt: 0,
    rrt: 0,
    globalDailyReward: 50,
    rewardDelayMinutes: 30,
    pointsPerDollar: 100,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const fetchSettings = async (): Promise<void> => {
    try {
      const res = await API.get<Settings>("/api/v3/settings", {
        headers,
      });
      setSettings({
        ...res.data,
        globalDailyReward: res.data.globalDailyReward ?? 50,
        rewardDelayMinutes: res.data.rewardDelayMinutes ?? 30,
        pointsPerDollar: res.data.pointsPerDollar ?? 100,
      });
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
    <div className="mx-auto p-4 md:p-6 2xl:p-10">
      <div className="rounded-xl border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <h1 className="mb-6 text-2xl font-bold text-black dark:text-white">Settings</h1>

        {message.text && (
          <div
            className={`mb-4 rounded-lg p-4 font-semibold ${
              message.type === "error"
                ? "border border-danger/20 bg-danger/10 text-danger"
                : "border border-success/20 bg-success/10 text-success"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="executionMethod"
              className="mb-1.5 block text-sm font-medium text-black dark:text-white"
            >
              Execution Method
            </label>
            <select
              id="executionMethod"
              value={settings.executionMethod}
              onChange={(e) =>
                setSettings({ ...settings, executionMethod: e.target.value })
              }
              className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2.5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            >
              {settings?.executionMethods &&
                settings?.executionMethods.map((method) => (
                  <option key={method} value={method} className="dark:bg-boxdark">
                    {method.charAt(0).toUpperCase() + method.slice(1)}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="rt"
              className="mb-1.5 block text-sm font-medium text-black dark:text-white"
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
              className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2.5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>

          <div>
            <label
              htmlFor="rrt"
              className="mb-1.5 block text-sm font-medium text-black dark:text-white"
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
              className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2.5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>

          <div className="rounded-xl border border-stroke bg-gray-50/70 p-6 shadow-sm dark:border-strokedark dark:bg-meta-4/20 space-y-5">
            <h3 className="font-bold text-black dark:text-white text-base flex items-center gap-2 border-b border-stroke pb-3 dark:border-strokedark">
              🎁 إعدادات المكافآت الموحدة ونظام النقاط (Global Points & Reward System)
            </h3>
            
            <div>
              <label
                htmlFor="globalDailyReward"
                className="text-black dark:text-white mb-2 block text-sm font-semibold"
              >
                نقاط المكافأة الموحدة لجميع المستخدمين (Global Reward Points)
              </label>
              <input
                type="number"
                id="globalDailyReward"
                min="0"
                value={settings.globalDailyReward ?? 50}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    globalDailyReward: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full rounded-lg border border-stroke bg-white px-4 py-2.5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary font-medium"
              />
              <p className="text-gray-500 dark:text-bodydark1 text-xs mt-1.5 leading-relaxed font-normal">
                هذا الرقم يحدد عدد النقاط الموحدة التي يحصل عليها أي مستخدم عند استلام المكافأة / بعد تصفير نقاطه، وكذلك الرصيد المبدئي لأي مستخدم جديد يسجل لأول مرة (يطبق فورياً على كل المستخدمين).
              </p>
            </div>

            <div>
              <label
                htmlFor="rewardDelayMinutes"
                className="text-black dark:text-white mb-2 block text-sm font-semibold"
              >
                وقت الانتظار قبل نزول النقاط بالدقائق (Reward Wait Time)
              </label>
              <input
                type="number"
                id="rewardDelayMinutes"
                min="1"
                value={settings.rewardDelayMinutes ?? 30}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    rewardDelayMinutes: parseInt(e.target.value) || 30,
                  })
                }
                className="w-full rounded-lg border border-stroke bg-white px-4 py-2.5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary font-medium"
              />
              <p className="text-gray-500 dark:text-bodydark1 text-xs mt-1.5 leading-relaxed font-normal">
                المدة بالدقائق التي ينتظرها المستخدم بعد طلب المكافأة حتى تنزل النقاط في رصيده (افتراضياً 30 دقيقة).
              </p>
            </div>

            <div>
              <label
                htmlFor="pointsPerDollar"
                className="text-black dark:text-white mb-2 block text-sm font-semibold"
              >
                معدل تحويل وفك الدولار إلى نقاط (Points per 1 Dollar)
              </label>
              <input
                type="number"
                id="pointsPerDollar"
                min="1"
                value={settings.pointsPerDollar ?? 100}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    pointsPerDollar: parseInt(e.target.value) || 1,
                  })
                }
                className="w-full rounded-lg border border-stroke bg-white px-4 py-2.5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary font-medium"
              />
              <p className="text-gray-500 dark:text-bodydark1 text-xs mt-1.5 leading-relaxed font-normal">
                يحدد كم نقطة يحصل عليها المستخدم مقابل كل 1 دولار عند فك أو تحويل رصيد الدولار إلى نقاط (مثلاً: إذا تم ضبطه على 100، فكل 1$ = 100 نقطة).
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label
              htmlFor="reportErrors"
              className="text-sm font-medium text-black dark:text-white"
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
              <div className="peer h-6 w-11 rounded-full bg-[#dbdbdb] dark:bg-meta-4 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-[#808080] after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <label
              htmlFor="reportHtml"
              className="text-sm font-medium text-black dark:text-white"
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
              <div className="peer h-6 w-11 rounded-full bg-[#dbdbdb] dark:bg-meta-4 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-[#808080] after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <label
              htmlFor="mimicScroll"
              className="text-sm font-medium text-black dark:text-white"
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
              <div className="peer h-6 w-11 rounded-full bg-[#dbdbdb] dark:bg-meta-4 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-[#808080] after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none"></div>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-lg bg-primary py-3 px-6 font-medium text-white transition hover:bg-opacity-90 shadow-md ${
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
