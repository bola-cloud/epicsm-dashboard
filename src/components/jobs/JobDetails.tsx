"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { useParams } from "next/navigation";
import { Job } from "@/types/jobs";
import Breadcrumb from "../Breadcrumbs/Breadcrumb";
import Image from "next/image";
import { getJwtFromLocalStorage } from "@/utils/localStorage";
import API from "@/utils/API";
import { User } from "@/types/user";
import UserAvatar from "@/components/common/UserAvatar";

const headers = {
  Authorization: `JWT ${getJwtFromLocalStorage()}`,
  "Content-Type": "application/json",
};

interface JobActionItem {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhoto?: string;
  status: string;
  reason: string;
  executionMethod: string;
  createdAt: string;
}

function JobDetails() {
  const { id } = useParams();
  const [Job, setJob] = useState<any | undefined>();
  const [enabled, setEnabled] = useState(false);
  const [User, setUser] = useState<User | undefined>();

  async function getJob() {
    try {
      const res = await API.get(`/api/v3/jobs/user/${id}`);

      if (res.status === 200) {
        setJob(res.data);
      } else {
        console.error("No Job found");
        toast.error("No Job found");
      }
    } catch (error) {
      try {
        const resV2 = await API.get(`/api/v4/admin/v2/jobs/${id}`);
        if (resV2.status === 200) {
          setJob({ ...resV2.data, isV2: true });
        } else {
          console.error("No Job found in V2 either");
          toast.error("No Job found");
        }
      } catch (err2) {
        console.error("Failed to fetch Job", err2);
        toast.error("Failed to fetch Job");
      }
    }
  }

  async function getUser() {
    const userIdToFetch = Job?.uid || Job?.creatorId;
    if (!userIdToFetch || userIdToFetch === "----admin----") return;

    try {
      const res = await API.get(`/api/v3/users/firestore/${userIdToFetch}`, {
        headers,
      });

      if (res.status === 200) {
        setUser(res.data);
      }
    } catch (error) {
      // User might be in Mongo
    }
  }

  useEffect(() => {
    getJob();
  }, [id]);

  useEffect(() => {
    const isCompleted =
      (typeof Job?.maxCount === "number" &&
        typeof Job?.likeCount === "number" &&
        Job.maxCount > 0 &&
        Job.likeCount >= Job.maxCount) ||
      Job?.status === "Completed" ||
      Job?.status === "completed" ||
      Job?.status === "مكتمل";

    if (isCompleted) {
      setEnabled(false);
    } else if (Job?.isV2) {
      setEnabled(Job?.status === "Active" || Job?.status === "active");
    } else {
      Job?.isLive ? setEnabled(true) : setEnabled(false);
    }

    getUser();
  }, [Job]);

  async function UpdateJob() {
    try {
      if (Job?.isV2) {
        const newStatus = enabled ? "Paused" : "Active";
        const res = await API.put(
          `/api/v4/admin/v2/jobs/${Job._id || id}/status`,
          { status: newStatus },
          { headers }
        );
        if (res.status === 200) {
          setEnabled(!enabled);
          setJob((prev: any) => ({ ...prev, status: newStatus }));
          toast.success(`Job marked as ${newStatus}`);
        }
      } else {
        const response = await API.put(
          `/api/v3/jobs/${id}`,
          { isLive: !enabled },
          { headers }
        );
        if (response.status === 200) {
          setEnabled(!enabled);
          toast.success("Job updated successfully");
        }
      }
    } catch (error) {
      console.error("Failed to update Job", error);
      toast.error("Failed to update Job");
    }
  }

  const isCompleted =
    (typeof Job?.maxCount === "number" &&
      typeof Job?.likeCount === "number" &&
      Job.maxCount > 0 &&
      Job.likeCount >= Job.maxCount) ||
    Job?.status === "Completed" ||
    Job?.status === "completed" ||
    Job?.status === "مكتمل";

  const resolvedId = Job?.resolvedId || Job?.target_id || Job?.mediaId || Job?.userPk;
  const isFallback = Job?.resolutionStatus === "fallback";

  return (
    <section>
      <div className="mx-auto max-w-270">
        <Breadcrumb pageName="Job Details" />

        <div className="overflow-hidden rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          {/* Header Cover */}
          <div className="relative z-20 h-28 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 md:h-36"></div>

          <div className="px-4 pb-6 text-center lg:pb-8 xl:pb-11.5">
            <div className="relative z-30 mx-auto -mt-14 h-24 w-24 rounded-full bg-white p-2 shadow-lg dark:bg-boxdark sm:h-28 sm:w-28">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
                <span className="text-3xl font-bold uppercase text-primary">
                  {Job?.platform?.charAt(0) || "J"}
                </span>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex flex-wrap items-center justify-center gap-2">
                <h3 className="text-xl font-bold text-black dark:text-white sm:text-2xl">
                  {Job?.jobId || Job?._id}
                </h3>
                {Job?.isVip && (
                  <span className="rounded-full bg-amber-100 px-3 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                    ⭐ VIP
                  </span>
                )}
                {Job?.isV2 && (
                  <span className="rounded-full bg-blue-100 px-3 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    V2 System
                  </span>
                )}
              </div>

              {/* Execution Method Pill */}
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                <div
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-medium ${
                    isFallback
                      ? "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800"
                  }`}
                >
                  <span className="h-2 w-2 rounded-full bg-current"></span>
                  <span>طريقة التنفيذ: {isFallback ? "رابط مباشر (Fallback)" : "سكربت آلي (Script Resolved)"}</span>
                </div>

                {resolvedId && (
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 dark:bg-meta-4 dark:text-gray-300 font-mono">
                    <span>Target ID: {resolvedId}</span>
                  </div>
                )}
              </div>

              {/* Job Info Grid */}
              <div className="mt-6 grid grid-cols-1 gap-4 text-left sm:grid-cols-2 lg:grid-cols-3 bg-gray-50 p-5 rounded-lg dark:bg-meta-4/30">
                <div>
                  <p className="text-xs text-gray-500">Order ID / MongoDB ID</p>
                  <p className="font-mono text-sm font-semibold text-black dark:text-white break-all">{Job?._id}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Created By</p>
                  <p className="text-sm font-semibold text-black dark:text-white">
                    {Job?.creatorId === "----admin----" ? "لوحة التحكم (Admin)" : (User?.name || Job?.uid || Job?.creatorId || "N/A")}
                  </p>
                  {User?.email && <p className="text-xs text-gray-500">{User.email}</p>}
                </div>

                <div>
                  <p className="text-xs text-gray-500">Platform & Objective</p>
                  <p className="text-sm font-semibold text-black dark:text-white capitalize">
                    {Job?.platform} - {Job?.linkTypeName || Job?.actionType || "Like"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Progress / Counter</p>
                  <p className="text-sm font-bold text-primary">
                    {(Job?.likeCount || 0).toLocaleString()} / {(Job?.maxCount || 0).toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      isCompleted
                        ? "bg-meta-5/10 text-meta-5"
                        : Job?.status === "Active" || Job?.status === "active"
                        ? "bg-success/10 text-success"
                        : "bg-danger/10 text-danger"
                    }`}
                  >
                    {isCompleted ? "Completed (مكتمل)" : (Job?.status || "Off")}
                  </span>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Published Date</p>
                  <p className="text-sm text-black dark:text-white">
                    {Job?.createdAt || Job?.datePublished
                      ? format(new Date(Job?.createdAt || Job?.datePublished), "dd/MM/yyyy, hh:mm a")
                      : "N/A"}
                  </p>
                </div>

                <div className="sm:col-span-2 lg:col-span-3">
                  <p className="text-xs text-gray-500">Target Link</p>
                  <a
                    href={Job?.targetLink || Job?.link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium text-blue-600 hover:underline break-all"
                  >
                    {Job?.targetLink || Job?.link}
                  </a>
                </div>
              </div>

              {/* Status Toggle Control */}
              <div className="mt-5 flex items-center justify-center gap-3">
                <span className="text-sm font-medium text-black dark:text-white">
                  Active in Queue:
                </span>
                <button
                  onClick={UpdateJob}
                  disabled={isCompleted}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                    isCompleted
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : enabled
                      ? "bg-success text-white hover:bg-success/90"
                      : "bg-warning text-white hover:bg-warning/90"
                  }`}
                >
                  {isCompleted ? "Completed" : enabled ? "Pause Job (إيقاف)" : "Activate Job (تشغيل)"}
                </button>
              </div>

              {/* Workers Execution Table (من قام بالتنفيذ وكيف) */}
              <div className="mt-8 text-left">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-base font-bold text-black dark:text-white">
                    سجل المنفذين للأوردر (Execution History)
                  </h4>
                  <span className="text-xs text-gray-500">
                    إجمالي المنفذين: {Job?.actions?.length || Job?.likeCount || 0}
                  </span>
                </div>

                {Job?.actions && Job.actions.length > 0 ? (
                  <div className="overflow-x-auto rounded border border-stroke dark:border-strokedark">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-100 text-gray-700 dark:bg-meta-4 dark:text-gray-300">
                        <tr>
                          <th className="p-3">المنفذ (Worker)</th>
                          <th className="p-3">طريقة التنفيذ (Method)</th>
                          <th className="p-3 text-center">الحالة (Status)</th>
                          <th className="p-3 text-right">وقت التنفيذ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stroke dark:divide-strokedark">
                        {Job.actions.map((act: JobActionItem) => (
                          <tr key={act._id} className="hover:bg-gray-50 dark:hover:bg-meta-4/40">
                            <td className="p-3">
                              <div className="flex items-center gap-2.5">
                                <UserAvatar
                                  photo={act.userPhoto}
                                  name={act.userName}
                                  email={act.userEmail}
                                  sizeClasses="h-8 w-8"
                                  textClasses="text-xs font-bold"
                                />
                                <div>
                                  <p className="font-semibold text-black dark:text-white">{act.userName}</p>
                                  <p className="text-[11px] text-gray-500 truncate max-w-[200px]" title={act.userEmail}>
                                    {act.userEmail}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="p-3">
                              <span className="font-medium text-slate-700 dark:text-slate-300">
                                {act.executionMethod}
                              </span>
                              {act.reason && act.reason !== "Normal interaction" && (
                                <p className="text-[10px] text-gray-400">{act.reason}</p>
                              )}
                            </td>
                            <td className="p-3 text-center">
                              <span
                                className={`inline-block rounded px-2 py-0.5 text-[11px] font-semibold ${
                                  act.status === "completed"
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                                    : act.status === "completed_externally"
                                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                    : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
                                }`}
                              >
                                {act.status}
                              </span>
                            </td>
                            <td className="p-3 text-right text-gray-500 font-mono text-[11px]">
                              {act.createdAt ? format(new Date(act.createdAt), "dd/MM/yyyy HH:mm:ss") : "N/A"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="rounded border border-dashed border-stroke p-6 text-center text-xs text-gray-500 dark:border-strokedark">
                    لم يتم تسجيل تفاعلات فردية محفوظة بعد لهذا الطلب، أو أن التفاعل مسجل بشكل تراكمي.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default JobDetails;
