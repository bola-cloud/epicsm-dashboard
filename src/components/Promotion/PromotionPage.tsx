"use client";

import { useState, useEffect } from "react";
import { Clock, Info, Globe } from "lucide-react";
import { fetchTimezones } from "@/utils/timezoneService";
import API from "@/utils/API";
import toast from "react-hot-toast";

interface TimezoneOption {
  id: string;
  label: string;
}

interface GroupedTimezones {
  [region: string]: TimezoneOption[];
}

interface Promotion {
  _id?: string;
  start: string;
  end: string;
  timezone: string;
  active: boolean;
  __v?: number;
}

export function PromotionPage() {
  const [promotionId, setPromotionId] = useState<string | null>(null);
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<string>("16:00");
  const [endTime, setEndTime] = useState<string>("19:00");
  const [timezone, setTimezone] = useState<string>("America/New_York");
  const [timezones, setTimezones] = useState<TimezoneOption[]>([]);
  const [groupedTimezones, setGroupedTimezones] = useState<GroupedTimezones>(
    {},
  );
  const [currentTime, setCurrentTime] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDataFetched, setIsDataFetched] = useState<boolean>(false);

  const calculateMinEndTime = () => {
    const [hours, minutes] = startTime.split(":").map(Number);
    let minEndHours = hours + 1;

    // Handle day overflow
    if (minEndHours >= 24) {
      minEndHours = 23;
      return "23:59";
    }

    return `${String(minEndHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  };

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartTime = e.target.value;
    setStartTime(newStartTime);

    const [startHours, startMinutes] = newStartTime.split(":").map(Number);
    let newEndHours = startHours + 1;

    if (newEndHours >= 24) {
      newEndHours = 23;
      const newEndTime = `${String(newEndHours).padStart(2, "0")}:${String(startMinutes).padStart(2, "0")}`;
      setEndTime(newEndTime);
      return;
    }

    const [endHours, endMinutes] = endTime.split(":").map(Number);
    const startTimeInMinutes = startHours * 60 + startMinutes;
    const endTimeInMinutes = endHours * 60 + endMinutes;

    if (endTimeInMinutes - startTimeInMinutes < 60) {
      const newEndTime = `${String(newEndHours).padStart(2, "0")}:${String(startMinutes).padStart(2, "0")}`;
      setEndTime(newEndTime);
    }
  };

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndTime = e.target.value;
    const [endHours, endMinutes] = newEndTime.split(":").map(Number);
    const [startHours, startMinutes] = startTime.split(":").map(Number);

    const startTimeInMinutes = startHours * 60 + startMinutes;
    const endTimeInMinutes = endHours * 60 + endMinutes;

    if (endTimeInMinutes - startTimeInMinutes >= 60) {
      setEndTime(newEndTime);
    } else {
      const minEndHours = startHours + 1;
      const minEndTime = `${String(minEndHours).padStart(2, "0")}:${String(startMinutes).padStart(2, "0")}`;
      setEndTime(minEndTime);
    }
  };

  const api = {
    async getPromotions(): Promise<Promotion[]> {
      try {
        const response = await API.get(`/api/v3/promotions`);

        if (response.data) {
          if (Array.isArray(response.data)) {
            return response.data;
          } else if (response.data.data && Array.isArray(response.data.data)) {
            return response.data.data;
          } else if (response.data.data) {
            return [response.data.data];
          } else {
            return [response.data];
          }
        }
        return [];
      } catch (error) {
        console.log("Error fetching promotions:", error);
        setError("Failed to fetch promotions");
        return [];
      }
    },

    async createPromotion(promotionData: Promotion): Promise<Promotion | null> {
      try {
        const response = await API.post(`/api/v3/promotions`, promotionData);
        return response.data.data || response.data;
      } catch (error) {
        console.error("Error creating promotion:", error);
        setError("Failed to create promotion");
        return null;
      }
    },

    async updatePromotion(
      id: string,
      promotionData: Partial<Promotion>,
    ): Promise<Promotion | null> {
      try {
        const response = await API.put(`/api/v3/promotions`, promotionData);
        return response.data.data || response.data;
      } catch (error) {
        console.error(`Error updating promotion ${id}:`, error);
        setError(`Failed to update promotion ${id}`);
        return null;
      }
    },
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const promotions = await api.getPromotions();

        if (promotions && promotions.length > 0) {
          const promotion = promotions[0];

          if (promotion._id) {
            setPromotionId(promotion._id);
          }

          setIsEnabled(promotion.active);
          setStartTime(promotion.start);
          setEndTime(promotion.end);
          setTimezone(promotion.timezone);

          setIsDataFetched(true);
        } else {
          console.log("No promotions found in the response");
        }
      } catch (error) {
        console.log("Error loading promotion data:", error);
        setError("Failed to load promotion data");
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    const getTimezones = async () => {
      setIsLoading(true);
      try {
        const fetchedTimezones: string[] = await fetchTimezones();

        const formattedTimezones: TimezoneOption[] = fetchedTimezones.map(
          (tz) => {
            let label = tz.replace(/_/g, " ");

            if (label.includes("/")) {
              const parts = label.split("/");
              label = `${parts[parts.length - 1]} (${parts[0]})`;
            }

            return { id: tz, label: label };
          },
        );

        const sortedTimezones = formattedTimezones.sort((a, b) =>
          a.label.localeCompare(b.label),
        );

        setTimezones(sortedTimezones);

        const grouped: GroupedTimezones = sortedTimezones.reduce(
          (acc: GroupedTimezones, tz) => {
            const region = tz.id.split("/")[0];
            if (!acc[region]) {
              acc[region] = [];
            }
            acc[region].push(tz);
            return acc;
          },
          {},
        );

        setGroupedTimezones(grouped);
      } catch (error) {
        console.log("Failed to fetch timezones:", error);
        setError("Failed to fetch timezones");

        const fallbackTimezones: TimezoneOption[] = [
          { id: "America/New_York", label: "New York (America)" },
          { id: "America/Chicago", label: "Chicago (America)" },
          { id: "America/Denver", label: "Denver (America)" },
          { id: "America/Los_Angeles", label: "Los Angeles (America)" },
          { id: "UTC", label: "UTC" },
          { id: "Europe/London", label: "London (Europe)" },
          { id: "Europe/Paris", label: "Paris (Europe)" },
          { id: "Asia/Tokyo", label: "Tokyo (Asia)" },
          { id: "Africa/Casablanca", label: "Casablanca (Africa)" },
        ];

        setTimezones(fallbackTimezones);

        const grouped: GroupedTimezones = fallbackTimezones.reduce(
          (acc: GroupedTimezones, tz) => {
            const region = tz.id.split("/")[0];
            if (!acc[region]) {
              acc[region] = [];
            }
            acc[region].push(tz);
            return acc;
          },
          {},
        );

        setGroupedTimezones(grouped);
      } finally {
        setIsLoading(false);
      }
    };

    getTimezones();
  }, []);

  useEffect(() => {
    const updateTime = () => {
      try {
        setCurrentTime(
          new Date().toLocaleTimeString("en-US", {
            timeZone: timezone,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
          }),
        );
      } catch (error) {
        setCurrentTime("Invalid timezone");
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
      const promotionData: Partial<Promotion> = {
        start: startTime,
        end: endTime,
        timezone: timezone,
        active: isEnabled,
      };

      if (isDataFetched || promotionId) {
        if (!promotionId) {
          setError("No promotion ID available for update");
          return;
        }

        const updatedPromotion = await api.updatePromotion(
          promotionId,
          promotionData,
        );
        if (updatedPromotion) {
          toast.success("Promotion updated successfully");
        }
      } else {
        const newPromotion = await api.createPromotion(
          promotionData as Promotion,
        );
        if (newPromotion && newPromotion._id) {
          setPromotionId(newPromotion._id);
          setIsDataFetched(true);
          toast.success("Promotion created successfully");
        }
      }
    } catch (error) {
      console.error("Error saving promotion:", error);
      setError("Failed to save promotion");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-gray-50 flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {error && (
          <div className="bg-red-100 border-red-400 text-red-700 relative mb-4 rounded border px-4 py-3">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {isDataFetched && (
          <div className="relative mb-4 rounded border border-green-400 bg-green-100 px-4 py-3 text-green-700">
            <span className="block sm:inline">
              Promotion data loaded successfully: {startTime} - {endTime} (
              {timezone})
            </span>
          </div>
        )}

        <div className="w-full rounded-xl bg-white p-8 shadow-lg">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-gray-800 text-2xl font-bold">Happy Hour</h2>
              <div className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                {isEnabled ? "Active" : "Inactive"}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600 text-sm font-medium">
                {isEnabled ? "Enabled" : "Disabled"}
              </span>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={isEnabled}
                  onChange={() => setIsEnabled(!isEnabled)}
                />
                <div className="h-6 w-12 rounded-full bg-graydark after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:border-gray-2 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-6"></div>
              </label>
            </div>
          </div>

          <div className="mb-8 rounded-lg border border-blue-100 bg-blue-50 p-4">
            <div className="flex items-start gap-3">
              <Info className="mt-0.5 h-5 w-5 text-blue-500" />
              <p className="text-sm text-blue-700">
                Set up happy hour promotion schedule.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="border-gray-100 border-b pb-6">
              <h3 className="text-gray-700 mb-4 flex items-center gap-2 font-semibold">
                <Clock className="h-5 w-5 text-blue-500" />
                Time Schedule
              </h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="flex flex-col">
                  <label className="text-gray-600 mb-2 text-sm font-medium">
                    Starting Time
                  </label>
                  <input
                    type="time"
                    className="border-gray-200 disabled:bg-gray-100 disabled:text-gray-400 rounded-lg border px-4 py-3 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    disabled={!isEnabled}
                    value={startTime}
                    onChange={handleStartTimeChange}
                    max="23:00" // Maximum start time is 23:00 to allow for 1 hour difference
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-gray-600 mb-2 text-sm font-medium">
                    Ending Time
                  </label>
                  <input
                    type="time"
                    className="border-gray-200 disabled:bg-gray-100 disabled:text-gray-400 rounded-lg border px-4 py-3 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    disabled={!isEnabled}
                    value={endTime}
                    onChange={handleEndTimeChange}
                    min={calculateMinEndTime()}
                  />
                  <small className="text-gray-500 mt-1">
                    Must be at least 1 hour after start time
                  </small>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-gray-700 mb-4 flex items-center gap-2 font-semibold">
                <Globe className="h-5 w-5 text-blue-500" />
                Timezone Settings
              </h3>
              <div className="flex flex-col">
                <label className="text-gray-600 mb-2 text-sm font-medium">
                  Select Timezone
                </label>
                {isLoading ? (
                  <div className="text-gray-500 py-3">Loading timezones...</div>
                ) : (
                  <select
                    className="border-gray-200 disabled:bg-gray-100 disabled:text-gray-400 rounded-lg border px-4 py-3 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    disabled={!isEnabled || isLoading}
                  >
                    {Object.keys(groupedTimezones)
                      .sort()
                      .map((region) => (
                        <optgroup key={region} label={region}>
                          {groupedTimezones[region].map((tz) => (
                            <option key={tz.id} value={tz.id}>
                              {tz.label}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                  </select>
                )}
                <p className="text-gray-500 mt-2 text-sm">
                  Current local time:{" "}
                  <span className="font-medium">{currentTime}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSave}
              className={`rounded-lg px-5 py-2.5 text-sm font-medium transition-colors ${
                !isLoading && !isSaving
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
              disabled={isLoading || isSaving}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PromotionPage;