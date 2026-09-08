"use client";

import { useEffect, useState } from "react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

const JobsListV2 = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      const res = await fetch("https://api.epicsm.goviral.ma/api/v4/admin/v2/jobs");
      const data = await res.json();
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    // Poll every 5 seconds to see resolution updates
    const interval = setInterval(fetchJobs, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <DefaultLayout>
      <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
          V2 Jobs (Live)
        </h4>

        <div className="flex flex-col">
          <div className="grid grid-cols-3 rounded-sm bg-gray-2 dark:bg-meta-4 sm:grid-cols-8">
            <div className="p-2.5 xl:p-5">
              <h5 className="text-sm font-medium uppercase xsm:text-base">Target Link</h5>
            </div>
            <div className="p-2.5 text-center xl:p-5">
              <h5 className="text-sm font-medium uppercase xsm:text-base">Platform</h5>
            </div>
            <div className="hidden p-2.5 text-center sm:block xl:p-5">
              <h5 className="text-sm font-medium uppercase xsm:text-base">Type</h5>
            </div>
            <div className="p-2.5 text-center xl:p-5">
              <h5 className="text-sm font-medium uppercase xsm:text-base">Status</h5>
            </div>
            <div className="hidden p-2.5 text-center sm:block xl:p-5">
              <h5 className="text-sm font-medium uppercase xsm:text-base">Resolved ID</h5>
            </div>
            <div className="hidden p-2.5 text-center sm:block xl:p-5">
              <h5 className="text-sm font-medium uppercase xsm:text-base">Count</h5>
            </div>
            <div className="hidden p-2.5 text-center sm:block xl:p-5">
              <h5 className="text-sm font-medium uppercase xsm:text-base">VIP</h5>
            </div>
            <div className="hidden p-2.5 text-center sm:block xl:p-5">
              <h5 className="text-sm font-medium uppercase xsm:text-base">Resolution</h5>
            </div>
          </div>

          {loading ? (
            <div className="p-5 text-center">Loading...</div>
          ) : jobs.length === 0 ? (
            <div className="p-5 text-center">No V2 jobs found.</div>
          ) : (
            jobs.map((job, key) => (
              <div
                className={`grid grid-cols-3 sm:grid-cols-8 hover:bg-slate-100/50 ${
                  key === jobs.length - 1 ? "" : "border-b border-stroke dark:border-strokedark"
                }`}
                key={job._id || key}
              >
                <div className="flex items-center p-2.5 xl:p-5">
                  <a href={job.targetLink} target="_blank" rel="noreferrer" className="text-primary truncate w-32 sm:w-48 hover:underline" title={job.targetLink}>
                    {job.targetLink}
                  </a>
                </div>

                <div className="flex items-center justify-center p-2.5 xl:p-5">
                  <div className="flex items-center gap-2">
                    <img src="/images/brand/brand-05.svg" alt="brand" className="w-6 h-6 hidden sm:block" />
                    <p className="text-black dark:text-white capitalize">{job.platform}</p>
                  </div>
                </div>

                <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
                  <p className="text-meta-3 capitalize font-medium">{job.actionType || job.linkTypeName || "Like"}</p>
                </div>

                <div className="flex items-center justify-center gap-1 p-2.5 xl:p-5">
                  <p
                    className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium ${
                      job.status === "Active" || job.status === "active"
                        ? "bg-success text-success"
                        : "bg-danger text-danger"
                    }`}
                  >
                    {job.status || "Active"}
                  </p>
                </div>

                <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
                  <p className="text-black dark:text-white font-mono text-sm truncate w-24" title={job.target_id || job.mediaId || job.userPk || "-"}>
                    {job.target_id || job.mediaId || job.userPk || "-"}
                  </p>
                </div>

                <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
                  <p className="text-meta-5">{job.likeCount || 0} / {job.maxCount}</p>
                </div>

                <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
                  {job.isVip ? (
                    <span className="inline-flex items-center rounded-full bg-orange-200 px-2.5 py-0.5 text-xs font-medium text-orange-800">
                      VIP
                    </span>
                  ) : (
                    <span className="text-gray-400 text-sm">-</span>
                  )}
                </div>

                <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
                  {job.resolutionStatus === "pending" ? (
                    <span className="inline-flex rounded-full bg-warning bg-opacity-10 px-3 py-1 text-sm font-medium text-warning">
                      Resolving...
                    </span>
                  ) : job.resolutionStatus === "failed" ? (
                    <span className="inline-flex rounded-full bg-danger bg-opacity-10 px-3 py-1 text-sm font-medium text-danger" title={job.resolutionError}>
                      Failed
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full bg-success bg-opacity-10 px-3 py-1 text-sm font-medium text-success">
                      Live
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default JobsListV2;
