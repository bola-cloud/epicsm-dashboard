"use client";

import { useEffect, useState } from "react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

const API_BASE = "https://api.epicsm.goviral.ma/api/v4/admin/v2";

interface UserWithCookies {
  _id: string;
  email: string;
  name: string;
  photo: string;
  cookiePreview: string;
}

interface ExtractionAccount {
  platform: string;
  userId: string | null;
  email: string | null;
}

interface CookieHealth {
  platform: string;
  isConfigured: boolean;
  totalJobs: number;
  resolvedCount: number;
  fallbackCount: number;
  successRate: number;
  consecutiveFailures: number;
  lastSuccessAt: string | null;
  lastFallback: {
    jobId: string;
    targetLink: string;
    error: string;
    createdAt: string;
  } | null;
  healthStatus: "healthy" | "isolated_issue" | "critical" | "not_configured";
  message: string;
}

const CookieSettings = () => {
  // --- Diagnostics & Health ---
  const [cookieHealth, setCookieHealth] = useState<CookieHealth[]>([]);
  const [healthLoading, setHealthLoading] = useState(false);

  // --- Admin cookies (raw) ---
  const [platform, setPlatform] = useState("facebook");
  const [cookieString, setCookieString] = useState("");
  const [cookieStatus, setCookieStatus] = useState<any[]>([]);
  const [adminCookieMsg, setAdminCookieMsg] = useState("");
  const [adminCookieLoading, setAdminCookieLoading] = useState(false);

  // --- Extraction account ---
  const [exPlatform, setExPlatform] = useState("facebook");
  const [searchQuery, setSearchQuery] = useState("");
  const [usersWithCookies, setUsersWithCookies] = useState<UserWithCookies[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [extractionAccounts, setExtractionAccounts] = useState<ExtractionAccount[]>([]);
  const [exLoading, setExLoading] = useState(false);
  const [exMsg, setExMsg] = useState("");
  const [usersLoading, setUsersLoading] = useState(false);

  // Fetch cookie health & diagnostics
  const fetchCookieHealth = async () => {
    setHealthLoading(true);
    try {
      const res = await fetch(`${API_BASE}/cookies-health`);
      const data = await res.json();
      setCookieHealth(Array.isArray(data) ? data : []);
    } catch {}
    setHealthLoading(false);
  };

  // Fetch admin cookie status
  const fetchCookieStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/cookies`);
      const data = await res.json();
      setCookieStatus(Array.isArray(data) ? data : []);
    } catch {}
  };

  // Fetch current extraction accounts
  const fetchExtractionAccounts = async () => {
    try {
      const res = await fetch(`${API_BASE}/extraction-account`);
      const data = await res.json();
      setExtractionAccounts(Array.isArray(data) ? data : []);
    } catch {}
  };

  // Fetch users that have Facebook cookies
  const fetchUsersWithCookies = async (plat: string) => {
    setUsersLoading(true);
    setUsersWithCookies([]);
    setSelectedUserId("");
    try {
      const res = await fetch(`${API_BASE}/users-with-cookies?platform=${plat}`);
      const data = await res.json();
      setUsersWithCookies(Array.isArray(data) ? data : []);

      // Pre-select current extraction account for facebook
      const current = extractionAccounts.find((a) => a.platform === plat);
      if (current?.userId) setSelectedUserId(current.userId);
    } catch {}
    setUsersLoading(false);
  };

  useEffect(() => {
    fetchCookieStatus();
    fetchExtractionAccounts();
    fetchCookieHealth();
  }, []);

  useEffect(() => {
    if (extractionAccounts.length >= 0) {
      fetchUsersWithCookies(exPlatform);
    }
  }, [extractionAccounts.length, exPlatform]);

  // Save admin raw cookies
  const handleAdminCookieSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminCookieLoading(true);
    setAdminCookieMsg("");
    try {
      const res = await fetch(`${API_BASE}/cookies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, cookieString }),
      });
      const data = await res.json();
      setAdminCookieMsg(res.ok ? `success:${data.message}` : `error:${data.message}`);
      if (res.ok) { setCookieString(""); fetchCookieStatus(); fetchCookieHealth(); }
    } catch (err: any) {
      setAdminCookieMsg(`error:${err.message}`);
    } finally {
      setAdminCookieLoading(false);
    }
  };

  // Set extraction account (Facebook only)
  const handleSetExtractionAccount = async () => {
    if (!selectedUserId) return;
    setExLoading(true);
    setExMsg("");
    try {
      const res = await fetch(`${API_BASE}/extraction-account`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: exPlatform, userId: selectedUserId }),
      });
      const data = await res.json();
      setExMsg(res.ok ? `success:${data.message}` : `error:${data.message}`);
      if (res.ok) { fetchExtractionAccounts(); fetchCookieHealth(); }
    } catch (err: any) {
      setExMsg(`error:${err.message}`);
    } finally {
      setExLoading(false);
    }
  };

  const getExtractionForPlatform = (plat: string) =>
    extractionAccounts.find((a) => a.platform === plat);

  const filteredUsers = usersWithCookies.filter((u) => {
    const nameMatch = (u.name || "").toLowerCase().includes(searchQuery.toLowerCase());
    const emailMatch = (u.email || "").toLowerCase().includes(searchQuery.toLowerCase());
    return nameMatch || emailMatch;
  });

  return (
    <DefaultLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-black dark:text-white">V2 System Settings</h2>
        <p className="text-sm text-gray-500 mt-1">Configure cookies and extraction accounts for automatic ID resolution</p>
      </div>

      {/* ==================== COOKIE HEALTH & DIAGNOSTICS ==================== */}
      <div className="mb-6 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stroke pb-4 dark:border-strokedark">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success bg-opacity-10 text-success">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-black dark:text-white flex items-center gap-2">
                فحص ومراقبة استقرار الكوكيز (Cookie Health & Diagnostics)
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                </span>
              </h3>
              <p className="text-xs text-gray-500">
                متابعة دقيقة للأداء ونسبة استخراج المعرفات، والتمييز بين حالات الروابط الفردية وتلف الكوكيز الحقيقي.
              </p>
            </div>
          </div>
          <button
            onClick={fetchCookieHealth}
            disabled={healthLoading}
            className="flex items-center gap-2 rounded bg-gray-100 hover:bg-gray-200 dark:bg-meta-4 dark:hover:bg-opacity-80 px-3 py-1.5 text-xs font-medium text-black dark:text-white transition disabled:opacity-50"
          >
            <svg className={`w-3.5 h-3.5 ${healthLoading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {healthLoading ? "جاري التحديث..." : "تحديث الفحص"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {cookieHealth.map((item) => {
            const isCritical = item.healthStatus === "critical";
            const isIsolated = item.healthStatus === "isolated_issue";
            const isHealthy = item.healthStatus === "healthy";

            return (
              <div
                key={item.platform}
                className={`rounded-lg border p-4 transition-all ${
                  isCritical
                    ? "border-danger bg-danger bg-opacity-5"
                    : isIsolated
                    ? "border-warning border-opacity-40 bg-warning bg-opacity-5"
                    : isHealthy
                    ? "border-success border-opacity-30 bg-success bg-opacity-5"
                    : "border-stroke dark:border-strokedark"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base capitalize text-black dark:text-white">
                      {item.platform}
                    </span>
                    <span className="text-xs text-gray-400">({item.totalJobs.toLocaleString()} طلب)</span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      isCritical
                        ? "bg-danger text-white"
                        : isIsolated
                        ? "bg-warning bg-opacity-20 text-warning"
                        : isHealthy
                        ? "bg-success bg-opacity-15 text-success"
                        : "bg-gray-200 text-gray-700 dark:bg-meta-4 dark:text-gray-300"
                    }`}
                  >
                    {isCritical && "🔴 تنبيه: فشل متكرر للكوكيز"}
                    {isIsolated && "🟡 حالة فردية لمستخدم (الكوكيز سليمة)"}
                    {isHealthy && "🟢 سليمة ومستقرة تماماً"}
                    {item.healthStatus === "not_configured" && "⚪ غير معينة"}
                  </span>
                </div>

                {/* Explanation text */}
                <div className="rounded p-2.5 mb-3 bg-white bg-opacity-60 dark:bg-boxdark-2 text-xs leading-relaxed text-black dark:text-white">
                  {item.message}
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded bg-white dark:bg-boxdark p-2 border border-stroke dark:border-strokedark">
                    <span className="text-gray-400 block text-[10px]">نسبة النجاح</span>
                    <span className="font-bold text-success text-sm">{item.successRate}%</span>
                  </div>
                  <div className="rounded bg-white dark:bg-boxdark p-2 border border-stroke dark:border-strokedark">
                    <span className="text-gray-400 block text-[10px]">طلبات ناجحة</span>
                    <span className="font-bold text-black dark:text-white text-sm">{item.resolvedCount.toLocaleString()}</span>
                  </div>
                  <div className="rounded bg-white dark:bg-boxdark p-2 border border-stroke dark:border-strokedark">
                    <span className="text-gray-400 block text-[10px]">طلبات مباشرة (Fallback)</span>
                    <span className={`font-bold text-sm ${item.fallbackCount > 0 ? "text-warning" : "text-gray-500"}`}>
                      {item.fallbackCount}
                    </span>
                  </div>
                </div>

                {/* Isolated or fallback details */}
                {item.lastFallback && (
                  <div className="mt-3 border-t border-stroke dark:border-strokedark pt-2 text-[11px] text-gray-500">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-700 dark:text-gray-300">آخر طلب تم تحويله لرابط مباشر:</span>
                      <span className="text-gray-400">
                        {new Date(item.lastFallback.createdAt).toLocaleDateString("ar-EG")}{" "}
                        {new Date(item.lastFallback.createdAt).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="truncate text-gray-400 font-mono" title={item.lastFallback.targetLink}>
                      {item.lastFallback.targetLink}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

        {/* ==================== EXTRACTION ACCOUNT ==================== */}
        <div className="flex flex-col gap-6">
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke px-6 py-4 dark:border-strokedark flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary bg-opacity-10">
                  <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-black dark:text-white capitalize">{exPlatform} Extraction Account</h3>
                  <p className="text-xs text-gray-400">Select the user whose {exPlatform} cookies will be used</p>
                </div>
              </div>
              <select
                value={exPlatform}
                onChange={(e) => setExPlatform(e.target.value)}
                className="rounded border-[1.5px] border-stroke bg-transparent px-3 py-1 text-sm text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
              >
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
              </select>
            </div>

            <div className="p-6">
              {/* Note about Instagram */}
              {exPlatform === "instagram" && (
                <div className="mb-4 rounded-lg border border-warning border-opacity-30 bg-warning bg-opacity-5 p-3 text-sm text-warning">
                  ⚠️ Instagram cookie extraction is disabled in the mobile app by default. Users will not appear here unless the app is updated to send them. Use Admin Cookies (Fallback) instead if this list is empty.
                </div>
              )}

              {/* Users list */}
              {usersLoading ? (
                <div className="py-8 text-center text-sm text-gray-400">Loading users...</div>
              ) : usersWithCookies.length === 0 ? (
                <div className="rounded-lg border border-warning border-opacity-30 bg-warning bg-opacity-5 p-4 text-center">
                  <p className="text-sm text-warning font-medium">No users with {exPlatform} cookies found</p>
                  <p className="text-xs text-gray-400 mt-1">Users need to send their {exPlatform} cookies via the mobile app first</p>
                </div>
              ) : (
                <>
                  <div className="mb-4 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      placeholder="Search users by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent pl-10 pr-4 py-2 text-sm text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    />
                  </div>
                  <div className="flex flex-col gap-2 mb-4 max-h-72 overflow-y-auto pr-2">
                    {filteredUsers.length === 0 ? (
                      <div className="py-4 text-center text-sm text-gray-400">No users match your search.</div>
                    ) : (
                      filteredUsers.map((user) => (
                    <label
                      key={user._id}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all ${
                        selectedUserId === user._id
                          ? "border-primary bg-primary bg-opacity-5"
                          : "border-stroke dark:border-strokedark hover:border-primary hover:bg-gray-50 dark:hover:bg-meta-4"
                      }`}
                    >
                      <input
                        type="radio"
                        name="extractionUser"
                        value={user._id}
                        checked={selectedUserId === user._id}
                        onChange={() => setSelectedUserId(user._id)}
                        className="accent-primary"
                      />
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 dark:bg-meta-4 overflow-hidden">
                        {user.photo ? (
                          <img src={user.photo} alt={user.name} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-sm font-bold text-gray-500">{user.name.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-black dark:text-white truncate">{user.name || "Unknown Name"}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email || "No Email"}</p>
                      </div>
                      {selectedUserId === user._id && (
                        <div className="flex-shrink-0">
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                        </div>
                      )}
                    </label>
                  )))}
                </div>
                </>
              )}

              {exMsg && (
                <div className={`mb-3 rounded p-3 text-sm ${exMsg.startsWith("error") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
                  {exMsg.replace(/^(error|success):/, "")}
                </div>
              )}

              <button
                onClick={handleSetExtractionAccount}
                disabled={!selectedUserId || exLoading}
                className="flex w-full items-center justify-center gap-2 rounded bg-primary py-3 font-medium text-white hover:bg-opacity-90 disabled:opacity-40"
              >
                {exLoading ? "Saving..." : `Set as ${exPlatform} Extraction Account`}
              </button>
            </div>
          </div>

          {/* Extraction Accounts Summary */}
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke px-6 py-4 dark:border-strokedark">
              <h3 className="font-semibold text-black dark:text-white">Active Extraction Account</h3>
            </div>
            <div className="p-6 flex flex-col gap-3">
              {["facebook", "instagram"].map((plat) => {
                const acc = getExtractionForPlatform(plat);
                return (
                  <div key={plat} className="flex items-center justify-between rounded-lg border border-stroke dark:border-strokedark p-3">
                    <div className="flex items-center gap-3">
                      <img
                        src="/images/brand/brand-01.svg"
                        alt="facebook"
                        className="h-7 w-7"
                      />
                      <div>
                        <p className="text-sm font-medium capitalize text-black dark:text-white">{plat}</p>
                        {acc?.email && <p className="text-xs text-gray-400">{acc.email}</p>}
                      </div>
                    </div>
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                      acc?.userId ? "bg-success bg-opacity-10 text-success" : "bg-danger bg-opacity-10 text-danger"
                    }`}>
                      {acc?.userId ? "Configured" : "Not Set"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ==================== ADMIN COOKIES (raw fallback) ==================== */}
        <div className="flex flex-col gap-6">
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke px-6 py-4 dark:border-strokedark flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning bg-opacity-10">
                <svg className="w-5 h-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-black dark:text-white">Admin Cookies (Fallback)</h3>
                <p className="text-xs text-gray-400">Used by the JobWorker as last resort if no extraction account set</p>
              </div>
            </div>
            <form onSubmit={handleAdminCookieSubmit}>
              <div className="p-6">
                {adminCookieMsg && (
                  <div className={`mb-4 rounded p-3 text-sm ${adminCookieMsg.startsWith("error") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
                    {adminCookieMsg.replace(/^(error|success):/, "")}
                  </div>
                )}
                <div className="mb-4">
                  <label className="mb-2 block text-sm text-black dark:text-white">Platform</label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-4 py-3 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  >
                    <option value="facebook">Facebook</option>
                    <option value="instagram">Instagram</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="mb-2 block text-sm text-black dark:text-white">Cookie String</label>
                  <textarea
                    rows={6}
                    required
                    value={cookieString}
                    onChange={(e) => setCookieString(e.target.value)}
                    placeholder="Paste the cookie string (e.g. c_user=123; xs=...)"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-4 py-3 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white font-mono text-xs"
                  />
                </div>
                <button
                  type="submit"
                  disabled={adminCookieLoading}
                  className="flex w-full justify-center rounded bg-warning py-3 font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
                >
                  {adminCookieLoading ? "Saving..." : "Save Admin Cookies"}
                </button>
              </div>
            </form>
          </div>

          {/* Admin cookies status */}
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke px-6 py-4 dark:border-strokedark">
              <h3 className="font-semibold text-black dark:text-white">Admin Cookie Status</h3>
            </div>
            <div className="p-6 flex flex-col gap-3">
              {["facebook", "instagram"].map((plat) => {
                const stat = cookieStatus.find((c) => c.platform === plat);
                return (
                  <div key={plat} className="flex items-center justify-between rounded-lg border border-stroke dark:border-strokedark p-3">
                    <span className="font-medium capitalize text-black dark:text-white">{plat}</span>
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${stat?.isSet ? "bg-success bg-opacity-10 text-success" : "bg-danger bg-opacity-10 text-danger"}`}>
                      {stat?.isSet ? "Configured" : "Not Set"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </DefaultLayout>
  );
};

export default CookieSettings;
