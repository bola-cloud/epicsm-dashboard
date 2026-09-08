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

const CookieSettings = () => {
  // --- Admin cookies (raw) ---
  const [platform, setPlatform] = useState("facebook");
  const [cookieString, setCookieString] = useState("");
  const [cookieStatus, setCookieStatus] = useState<any[]>([]);
  const [adminCookieMsg, setAdminCookieMsg] = useState("");
  const [adminCookieLoading, setAdminCookieLoading] = useState(false);

  // --- Extraction account ---
  const [usersWithCookies, setUsersWithCookies] = useState<UserWithCookies[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [extractionAccounts, setExtractionAccounts] = useState<ExtractionAccount[]>([]);
  const [exLoading, setExLoading] = useState(false);
  const [exMsg, setExMsg] = useState("");
  const [usersLoading, setUsersLoading] = useState(false);

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
  }, []);

  useEffect(() => {
    if (extractionAccounts.length >= 0) {
      fetchUsersWithCookies("facebook");
    }
  }, [extractionAccounts.length]);

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
      if (res.ok) { setCookieString(""); fetchCookieStatus(); }
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
        body: JSON.stringify({ platform: "facebook", userId: selectedUserId }),
      });
      const data = await res.json();
      setExMsg(res.ok ? `success:${data.message}` : `error:${data.message}`);
      if (res.ok) fetchExtractionAccounts();
    } catch (err: any) {
      setExMsg(`error:${err.message}`);
    } finally {
      setExLoading(false);
    }
  };

  const getExtractionForPlatform = (plat: string) =>
    extractionAccounts.find((a) => a.platform === plat);

  return (
    <DefaultLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-black dark:text-white">V2 System Settings</h2>
        <p className="text-sm text-gray-500 mt-1">Configure cookies and extraction accounts for automatic ID resolution</p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

        {/* ==================== EXTRACTION ACCOUNT ==================== */}
        <div className="flex flex-col gap-6">
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke px-6 py-4 dark:border-strokedark flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary bg-opacity-10">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-black dark:text-white">Facebook Extraction Account</h3>
                <p className="text-xs text-gray-400">Select the user whose Facebook cookies will be used to resolve target_id for all Facebook jobs</p>
              </div>
            </div>

            <div className="p-6">
              {/* Note about Instagram */}
              <div className="mb-4 rounded-lg border border-warning border-opacity-30 bg-warning bg-opacity-5 p-3 text-sm text-warning">
                ⚠️ Instagram cookie extraction is disabled (unreliable). Only Facebook extraction account is needed.
              </div>

              {/* Users list */}
              {usersLoading ? (
                <div className="py-8 text-center text-sm text-gray-400">Loading users...</div>
              ) : usersWithCookies.length === 0 ? (
                <div className="rounded-lg border border-warning border-opacity-30 bg-warning bg-opacity-5 p-4 text-center">
                  <p className="text-sm text-warning font-medium">No users with Facebook cookies found</p>
                  <p className="text-xs text-gray-400 mt-1">Users need to send their Facebook cookies via the mobile app first</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2 mb-4 max-h-72 overflow-y-auto">
                  {usersWithCookies.map((user) => (
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
                        <p className="text-sm font-medium text-black dark:text-white truncate">{user.name || user.email}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                        <p className="text-xs text-gray-300 font-mono truncate">{user.cookiePreview}</p>
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
                  ))}
                </div>
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
                {exLoading ? "Saving..." : "Set as Facebook Extraction Account"}
              </button>
            </div>
          </div>

          {/* Extraction Accounts Summary */}
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke px-6 py-4 dark:border-strokedark">
              <h3 className="font-semibold text-black dark:text-white">Active Extraction Account</h3>
            </div>
            <div className="p-6 flex flex-col gap-3">
              {["facebook"].map((plat) => {
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
                        <p className="text-sm font-medium capitalize text-black dark:text-white">Facebook</p>
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
