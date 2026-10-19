"use client";

import React, { useState, useEffect } from "react";
import API from "@/utils/API";
import { getJwtFromLocalStorage } from "@/utils/localStorage";
import { toast } from "react-hot-toast";

interface NotificationStats {
  totalUsers: number;
  usersWithFcmCount: number;
}

interface BroadcastResult {
  totalTargetTokens: number;
  successCount: number;
  failureCount: number;
  topicBroadcast: boolean;
  sentAt: string;
}

export default function NotificationBroadcastPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [lastResult, setLastResult] = useState<BroadcastResult | null>(null);

  const getAuthHeaders = () => ({
    Authorization: `JWT ${getJwtFromLocalStorage() || ""}`,
    "Content-Type": "application/json",
  });

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const res = await API.get("/api/v3/notifications/stats", {
        headers: getAuthHeaders(),
      });
      if (res.data) {
        setStats(res.data);
      }
    } catch (err: any) {
      console.warn("Could not fetch notification stats", err);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSendBroadcast = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error("يرجى إدخال عنوان الإشعار ونص الرسالة");
      return;
    }

    try {
      setLoading(true);
      setShowConfirmModal(false);

      const res = await API.post(
        "/api/v3/notifications/broadcast",
        {
          title: title.trim(),
          body: body.trim(),
          imageUrl: imageUrl.trim() || undefined,
        },
        { headers: getAuthHeaders() }
      );

      if (res.status === 200 && res.data.success) {
        toast.success(res.data.message || "تم إرسال الإشعار لجميع المستخدمين بنجاح!");
        if (res.data.stats) {
          setLastResult(res.data.stats);
        }
        setTitle("");
        setBody("");
        setImageUrl("");
        fetchStats();
      }
    } catch (error: any) {
      const errMsg =
        error.response?.data?.message || error.message || "فشل إرسال الإشعار";
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6 2xl:p-10">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-title-md2 font-bold text-black dark:text-white flex items-center gap-2">
            📢 إرسال إشعار عام لجميع المستخدمين (Broadcast Notification)
          </h2>
          <p className="text-sm text-gray-500 dark:text-bodydark1 mt-1">
            أرسل إشعارات Push Notifications فورية إلى جميع الأجهزة والمستخدمين المسجلين في التطبيق.
          </p>
        </div>
      </div>

      {/* Audience Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        <div className="rounded-xl border border-stroke bg-white p-5 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
              </svg>
            </div>
            <div>
              <span className="text-xs font-medium text-gray-500 dark:text-bodydark1">إجمالي المستخدمين في النظام</span>
              <h4 className="text-title-sm font-bold text-black dark:text-white">
                {statsLoading ? "..." : (stats?.totalUsers?.toLocaleString() || "0")}
              </h4>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-stroke bg-white p-5 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
              </svg>
            </div>
            <div>
              <span className="text-xs font-medium text-gray-500 dark:text-bodydark1">أجهزة فعالة تستقبل الإشعارات (FCM)</span>
              <h4 className="text-title-sm font-bold text-success">
                {statsLoading ? "..." : (stats?.usersWithFcmCount?.toLocaleString() || "0")}
              </h4>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-stroke bg-white p-5 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-meta-5/10 text-meta-5">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 19.5v-.75a7.5 7.5 0 0 0-7.5-7.5H4.5m0-6.75h.75c7.87 0 14.25 6.38 14.25 14.25v.75M6 18.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
              </svg>
            </div>
            <div>
              <span className="text-xs font-medium text-gray-500 dark:text-bodydark1">طريقة البث الإضافية</span>
              <h4 className="text-title-sm font-bold text-black dark:text-white">
                FCM Topic + Live Sockets
              </h4>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form and Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-7">
          <div className="rounded-xl border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
            <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">
              ✍️ تفاصيل الإشعار
            </h3>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-black dark:text-white">
                  عنوان الإشعار (Notification Title) <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: عرض خاص ومكافآت جديدة بانتظارك!"
                  maxLength={100}
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2.5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
                <div className="text-right text-xs text-gray-400 mt-1">
                  {title.length} / 100 حرف
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-black dark:text-white">
                  نص الإشعار (Notification Body) <span className="text-danger">*</span>
                </label>
                <textarea
                  rows={4}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="مثال: ادخل التطبيق الآن واجمع نقاطك اليومية قبل انتهاء العرض..."
                  maxLength={300}
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2.5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
                <div className="text-right text-xs text-gray-400 mt-1">
                  {body.length} / 300 حرف
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-black dark:text-white">
                  رابط صورة إضافية (اختياري - Image URL)
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/banner.jpg"
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2.5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  disabled={loading || !title.trim() || !body.trim()}
                  onClick={() => setShowConfirmModal(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 px-6 font-medium text-white transition hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  {loading ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      جاري البث لجميع المستخدمين...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                      </svg>
                      إرسال الإشعار لجميع المستخدمين ({stats?.usersWithFcmCount?.toLocaleString() || "الكل"})
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Live Mobile Preview Section */}
        <div className="lg:col-span-5">
          <div className="rounded-xl border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
            <h3 className="mb-4 text-lg font-semibold text-black dark:text-white flex items-center gap-2">
              📱 معاينة حية لشكل الإشعار على هاتف المستخدم
            </h3>

            <div className="mx-auto max-w-sm rounded-2xl border-4 border-gray-800 bg-gray-100 p-4 shadow-xl dark:border-gray-700 dark:bg-gray-900">
              <div className="flex justify-between items-center text-xs text-gray-500 mb-3 px-1">
                <span>9:41</span>
                <div className="flex gap-1.5 items-center">
                  <span>📶</span>
                  <span>🔋</span>
                </div>
              </div>

              {/* Notification Card */}
              <div className="rounded-xl bg-white p-3.5 shadow-md dark:bg-boxdark border border-gray-100 dark:border-gray-800 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">
                      F
                    </div>
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Flyker App</span>
                    <span className="text-[10px] text-gray-400">• الآن</span>
                  </div>
                  <span className="text-gray-400 text-xs">🔔</span>
                </div>

                <h5 className="text-sm font-bold text-black dark:text-white mb-1">
                  {title || "عنوان الإشعار يظهر هنا..."}
                </h5>

                <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed">
                  {body || "نص الإشعار التوضيحي يظهر هنا كما سيراه المستخدم فور استلامه على هاتفه..."}
                </p>

                {imageUrl && (
                  <div className="mt-2.5 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 max-h-36">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageUrl}
                      alt="Banner Preview"
                      className="w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="text-center text-[11px] text-gray-400 mt-4">
                يصل الإشعار حتى وإن كان التطبيق مغلقاً عبر نظام Firebase Push
              </div>
            </div>

            {/* Last Result Card */}
            {lastResult && (
              <div className="mt-6 rounded-lg bg-green-50 p-4 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <h4 className="text-sm font-bold text-green-800 dark:text-green-300 flex items-center gap-1.5 mb-1">
                  ✅ تقرير آخر إرسال ناجح:
                </h4>
                <ul className="text-xs text-green-700 dark:text-green-400 space-y-1">
                  <li>• تم التوجيه إلى: <strong>{lastResult.totalTargetTokens.toLocaleString()}</strong> جهاز</li>
                  <li>• تم الاستلام بنجاح: <strong>{lastResult.successCount.toLocaleString()}</strong> جهاز</li>
                  <li>• بث القناة العامة (Topic): <strong>{lastResult.topicBroadcast ? "مفعل بنجاح" : "معطل"}</strong></li>
                  <li>• وقت الإرسال: {new Date(lastResult.sentAt).toLocaleTimeString()}</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-800 bg-opacity-60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-boxdark border border-stroke dark:border-strokedark text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-warning/10 text-warning">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>

            <h3 className="mb-2 text-xl font-bold text-black dark:text-white">
              تأكيد إرسال الإشعار لجميع المستخدمين
            </h3>

            <p className="mb-4 text-sm text-gray-600 dark:text-bodydark1">
              أنت على وشك إرسال هذا الإشعار إلى ما يقارب{" "}
              <strong className="text-primary font-bold">
                {stats?.usersWithFcmCount?.toLocaleString() || "جميع"}
              </strong>{" "}
              مستخدم مسجل في النظام. هل أنت متأكد من المتابعة؟
            </p>

            <div className="rounded-lg bg-gray-50 p-3 mb-5 text-right text-xs text-gray-700 dark:bg-meta-4/20 dark:text-bodydark1">
              <p><strong>العنوان:</strong> {title}</p>
              <p className="truncate"><strong>الرسالة:</strong> {body}</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSendBroadcast}
                className="flex w-full justify-center rounded-lg bg-primary py-2.5 font-medium text-white transition hover:bg-opacity-90"
              >
                تأكيد وبدء الإرسال
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex w-full justify-center rounded-lg bg-slate-300 py-2.5 font-medium text-gray-700 transition hover:bg-opacity-90 dark:bg-meta-4 dark:text-white"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
