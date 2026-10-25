"use client";

import { useState, useEffect } from "react";
import { Clock, Info, Globe, BadgePercent, Plus, Trash2, CheckCircle, AlertCircle } from "lucide-react";
import API from "@/utils/API";
import toast from "react-hot-toast";

interface Promotion {
  _id?: string;
  title?: string;
  start: string;
  end: string;
  timezone: string;
  active: boolean;
  rewardValue?: number;
  promotion_settings?: string;
  createdAt?: string;
}

export function PromotionPage() {
  const [promotionsList, setPromotionsList] = useState<Promotion[]>([]);
  const [promotionId, setPromotionId] = useState<string | null>(null);
  const [title, setTitle] = useState<string>("Happy Hour");
  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  const [startTime, setStartTime] = useState<string>("16:00");
  const [endTime, setEndTime] = useState<string>("19:00");
  const [timezone, setTimezone] = useState<string>("Africa/Cairo");
  const [dailyReward, setDailyReward] = useState<number>(100);
  const [currentTime, setCurrentTime] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const REWARD_PRESETS = [50, 100, 150, 200, 300, 500];

  const fetchPromotions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await API.get("/api/v3/promotions");
      if (res.data) {
        let list: Promotion[] = [];
        if (Array.isArray(res.data.promotions)) {
          list = res.data.promotions;
        } else if (Array.isArray(res.data)) {
          list = res.data;
        } else if (res.data.data) {
          list = Array.isArray(res.data.data) ? res.data.data : [res.data.data];
        }

        setPromotionsList(list);

        // Select the active or first promotion into form
        const current = list.find((p) => p.active) || list[0];
        if (current) {
          setPromotionId(current._id || null);
          setTitle(current.title || "Happy Hour");
          setIsEnabled(Boolean(current.active));
          setStartTime(current.start || "16:00");
          setEndTime(current.end || "19:00");
          setTimezone(current.timezone || "Africa/Cairo");
          setDailyReward(current.rewardValue || Number(current.promotion_settings) || 100);
        }
      }
    } catch (err: any) {
      console.error("Error fetching promotions:", err);
      setError("Failed to load promotions");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  // Update clock every second
  useEffect(() => {
    const updateTime = () => {
      try {
        setCurrentTime(
          new Date().toLocaleTimeString("ar-EG", {
            timeZone: timezone,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
          })
        );
      } catch (err) {
        setCurrentTime(new Date().toLocaleTimeString());
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [timezone]);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const payload = {
        id: promotionId,
        title,
        start: startTime,
        end: endTime,
        timezone,
        active: isEnabled,
        rewardValue: Number(dailyReward) || 100,
        promotion_settings: String(dailyReward || 100),
      };

      let res;
      if (promotionId) {
        res = await API.put("/api/v3/promotions", payload);
      } else {
        res = await API.post("/api/v3/promotions", payload);
      }

      if (res.data && res.data.success) {
        toast.success("تم حفظ إعدادات البروموشن بنجاح!");
        await fetchPromotions();
      } else {
        toast.error("حدث خطأ أثناء الحفظ");
      }
    } catch (err: any) {
      console.error("Error saving promotion:", err);
      setError("فشل في حفظ البروموشن");
      toast.error("فشل في حفظ البروموشن");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddNew = () => {
    setPromotionId(null);
    setTitle("New Happy Hour");
    setStartTime("20:00");
    setEndTime("22:00");
    setTimezone("Africa/Cairo");
    setIsEnabled(true);
    setDailyReward(150);
  };

  const handleDeletePromotion = async (id?: string) => {
    if (!id) return;
    if (!confirm("هل أنت متأكد من حذف هذا البروموشن؟")) return;

    try {
      await API.delete(`/api/v3/promotions/${id}`);
      toast.success("تم حذف البروموشن بنجاح");
      await fetchPromotions();
    } catch (err) {
      console.error("Error deleting promotion:", err);
      toast.error("فشل حذف البروموشن");
    }
  };

  const handleSelectPromotion = (promo: Promotion) => {
    setPromotionId(promo._id || null);
    setTitle(promo.title || "Happy Hour");
    setIsEnabled(Boolean(promo.active));
    setStartTime(promo.start || "16:00");
    setEndTime(promo.end || "19:00");
    setTimezone(promo.timezone || "Africa/Cairo");
    setDailyReward(promo.rewardValue || Number(promo.promotion_settings) || 100);
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-black dark:text-white sm:text-3xl">
              إدارة العروض والمكافآت (Happy Hour & Promotions)
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              تحكم في أوقات مضاعفة النقاط وقيمة المكافأة اليومية للمستخدمين والتنبيهات المسبقة
            </p>
          </div>

          <button
            onClick={handleAddNew}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-opacity-90"
          >
            <Plus className="h-4 w-4" />
            <span>إضافة بروموشن جديد</span>
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Main Settings Card */}
        <div className="rounded-xl border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-stroke pb-6 dark:border-strokedark">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-primary dark:bg-blue-900/20">
                <BadgePercent className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-black dark:text-white">
                  {promotionId ? `تعديل: ${title}` : "إنشاء بروموشن جديد"}
                </h3>
                <span className="text-xs text-gray-500 font-mono">
                  {promotionId ? `ID: ${promotionId}` : "بروموشن جديد سيتم إضافته للنظام"}
                </span>
              </div>
            </div>

            {/* Enable / Disable Switch */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-black dark:text-white">
                {isEnabled ? "مفعل (Active)" : "معطل (Disabled)"}
              </span>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={isEnabled}
                  onChange={() => setIsEnabled(!isEnabled)}
                />
                <div className="h-6 w-12 rounded-full bg-slate-300 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-success peer-checked:after:translate-x-6"></div>
              </label>
            </div>
          </div>

          <div className="space-y-6">
            {/* Title & Daily Reward row */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                  اسم العرض (Title)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: Happy Hour الجمعة"
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2.5 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                />
              </div>

              {/* Dynamic Daily Reward Amount Input */}
              <div>
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                  قيمة المكافأة في البروموشن (نقطة)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="10"
                    step="10"
                    value={dailyReward}
                    onChange={(e) => setDailyReward(Number(e.target.value))}
                    className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2.5 font-bold text-primary outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input text-lg"
                  />
                  <span className="text-sm font-bold text-gray-500 whitespace-nowrap">🪙 نقطة</span>
                </div>

                {/* Quick Presets */}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="text-xs text-gray-400 self-center ml-1">سريع:</span>
                  {REWARD_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setDailyReward(preset)}
                      className={`rounded px-2.5 py-1 text-xs font-semibold transition ${
                        dailyReward === preset
                          ? "bg-primary text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-meta-4 dark:text-gray-300"
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Time Schedule (Start / End) */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-black dark:text-white">
                  <Clock className="h-4 w-4 text-primary" />
                  وقت البدء (Starting Time)
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2.5 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white font-mono text-base"
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-black dark:text-white">
                  <Clock className="h-4 w-4 text-primary" />
                  وقت الانتهاء (Ending Time)
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2.5 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white font-mono text-base"
                />
              </div>
            </div>

            {/* Timezone Selection */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-black dark:text-white">
                <Globe className="h-4 w-4 text-primary" />
                المنطقة الزمنية (Timezone)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="sm:col-span-2 rounded-lg border border-stroke bg-transparent px-4 py-2.5 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                >
                  <option value="Africa/Cairo">مصر (Africa/Cairo) - الافتراضي والموصى به</option>
                  <option value="Asia/Riyadh">السعودية (Asia/Riyadh)</option>
                  <option value="Asia/Dubai">الإمارات (Asia/Dubai)</option>
                  <option value="UTC">توقيت غرينتش العالمي (UTC)</option>
                  <option value="Africa/Casablanca">المغرب (Africa/Casablanca)</option>
                  <option value="Europe/London">لندن (Europe/London)</option>
                  <option value="America/New_York">نيويورك (America/New_York)</option>
                </select>

                <div className="flex items-center justify-center rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600 dark:bg-meta-4 dark:text-gray-300 font-mono">
                  الوقت الآن: <span className="font-bold text-primary mr-1">{currentTime}</span>
                </div>
              </div>
            </div>

            {/* Information Notice */}
            <div className="rounded-lg border border-blue-100 bg-blue-50/70 p-4 text-xs text-blue-800 dark:bg-blue-900/20 dark:border-blue-900/50 dark:text-blue-300 flex items-start gap-3">
              <Info className="h-5 w-5 flex-shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="font-semibold mb-1">تنبيه تلقائي لمستخدمي الموبايل (Upcoming Promotion):</p>
                <p>
                  يقوم النظام تلقائياً بإرسال كائن <code>upcomingPromotion</code> لتطبيق الموبايل قبل بدء العرض مع توقيت البداية والانتهاء ليعرض للمستخدم تنبيهاً بمضاعفة المكافأة، وعند بدء وقت العرض يتم تحديث المكافأة فورياً دون أي تأخير.
                </p>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4 border-t border-stroke dark:border-strokedark">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 text-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
              >
                {isSaving ? "جاري الحفظ..." : "حفظ التغييرات (Save Changes)"}
              </button>
            </div>
          </div>
        </div>

        {/* Existing Promotions List */}
        <div className="rounded-xl border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <h3 className="mb-4 text-lg font-bold text-black dark:text-white">
            قائمة العروض المحفوظة ({promotionsList.length})
          </h3>

          {promotionsList.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center">لا توجد عروض محفوظة حالياً</p>
          ) : (
            <div className="divide-y divide-stroke dark:divide-strokedark">
              {promotionsList.map((promo) => (
                <div
                  key={promo._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-4"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-3 w-3 rounded-full ${
                        promo.active ? "bg-success" : "bg-gray-300"
                      }`}
                    ></span>
                    <div>
                      <h4 className="font-semibold text-black dark:text-white">
                        {promo.title || "Happy Hour"}
                      </h4>
                      <p className="text-xs text-gray-500 font-mono mt-0.5">
                        {promo.start} إلى {promo.end} ({promo.timezone || "Africa/Cairo"})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold text-primary bg-primary/10 px-3 py-1 rounded-full text-xs">
                      🪙 {promo.rewardValue || promo.promotion_settings || 100} نقطة
                    </span>
                    <button
                      onClick={() => handleSelectPromotion(promo)}
                      className="text-xs rounded border border-stroke px-3 py-1.5 font-medium hover:bg-gray-100 dark:border-strokedark dark:hover:bg-meta-4"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => handleDeletePromotion(promo._id)}
                      className="text-xs text-danger hover:opacity-80 p-1.5"
                      title="حذف"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default PromotionPage;
