"use client";

import { useEffect, useState } from "react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

const JobsListV2 = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Selection
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [errorFilter, setErrorFilter] = useState("All");
  const [vipFilter, setVipFilter] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  const fetchJobs = async () => {
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/api/v4/admin/v2/jobs");
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
    const interval = setInterval(fetchJobs, 5000);
    return () => clearInterval(interval);
  }, []);

  const activeFiltersCount = [platformFilter !== "All", statusFilter !== "All", errorFilter !== "All", vipFilter !== "All", startDate !== "", endDate !== ""].filter(Boolean).length;

  const toggleSelection = (id: string) => {
    setSelectedJobs(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const getFilteredJobs = () => {
    return jobs.filter((job) => {
      const normalizeLink = (link: string) => 
        (link || "").toLowerCase().replace(/^(https?:\/\/)?(www\.|m\.)?/g, "");

      const normalizedQuery = normalizeLink(searchQuery);

      const matchesSearch =
        !searchQuery ||
        normalizeLink(job.targetLink).includes(normalizedQuery) ||
        (job.target_id || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (job.mediaId || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (job.userPk || "").toLowerCase().includes(searchQuery.toLowerCase());
  
      const matchesPlatform = platformFilter === "All" || job.platform === platformFilter.toLowerCase();
      const matchesStatus = statusFilter === "All" || job.status?.toLowerCase() === statusFilter.toLowerCase();
      const matchesError = errorFilter === "All" || 
        (errorFilter === "Errors" && job.resolutionStatus === "fallback") || 
        (errorFilter === "No Errors" && job.resolutionStatus !== "fallback");
      const matchesVip =
        vipFilter === "All" ||
        (vipFilter === "VIP" && job.isVip) ||
        (vipFilter === "Normal" && !job.isVip);

      let matchesDate = true;
      if (job.createdAt && (startDate || endDate)) {
        const jobDate = new Date(job.createdAt);
        if (startDate) matchesDate = matchesDate && jobDate >= new Date(startDate);
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            matchesDate = matchesDate && jobDate <= end;
        }
      }
  
      return matchesSearch && matchesPlatform && matchesStatus && matchesError && matchesVip && matchesDate;
    });
  };

  const filteredJobs = getFilteredJobs();

  const toggleAll = () => {
    if (selectedJobs.length === filteredJobs.length && filteredJobs.length > 0) {
      setSelectedJobs([]);
    } else {
      setSelectedJobs(filteredJobs.map(job => job._id));
    }
  };

  const handleDeleteSelected = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedJobs.length} jobs?`)) return;
    setIsDeleting(true);
    try {
      await fetch(process.env.NEXT_PUBLIC_API_URL + "/api/v4/admin/v2/jobs/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobIds: selectedJobs }),
      });
      setSelectedJobs([]);
      fetchJobs();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteSingle = async (id: string) => {
    if (!confirm("Are you sure you want to delete this job?")) return;
    try {
      await fetch(process.env.NEXT_PUBLIC_API_URL + `/api/v4/admin/v2/jobs/${id}`, {
        method: "DELETE",
      });
      fetchJobs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "Active" || currentStatus === "active" ? "Paused" : "Active";
    try {
      await fetch(process.env.NEXT_PUBLIC_API_URL + `/api/v4/admin/v2/jobs/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchJobs();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DefaultLayout>
      <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        
        {/* --- HEADER CONTROLS --- */}
        <div className="mb-4 flex justify-between items-center relative">
          <div className="w-1/2 relative">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 fill-body hover:fill-primary dark:fill-bodydark dark:hover:fill-primary"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M9.16666 3.33332C5.945 3.33332 3.33332 5.945 3.33332 9.16666C3.33332 12.3883 5.945 15 9.16666 15C12.3883 15 15 12.3883 15 9.16666C15 5.945 12.3883 3.33332 9.16666 3.33332ZM1.66666 9.16666C1.66666 5.02452 5.02452 1.66666 9.16666 1.66666C13.3088 1.66666 16.6667 5.02452 16.6667 9.16666C16.6667 11.1466 15.8977 12.9473 14.6465 14.281L18.0893 17.7237C18.4147 18.0492 18.4147 18.5768 18.0893 18.9023C17.7638 19.2277 17.2362 19.2277 16.9107 18.9023L13.468 15.4596C12.1343 16.7107 10.3335 17.5 8.33332 17.5C4.19118 17.5 0.833328 14.1421 0.833328 10C0.833328 5.85786 4.19118 2.5 8.33332 2.5Z"
                fill=""
              />
            </svg>
            <input
              type="text"
              placeholder="Search across all fields..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-stroke bg-transparent py-3 pl-12 pr-4 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>
          
          <div className="flex items-center gap-4">
             {selectedJobs.length > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  disabled={isDeleting}
                  className="rounded bg-danger px-4 py-2 font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
                >
                  {isDeleting ? "Deleting..." : `Delete Selected (${selectedJobs.length})`}
                </button>
              )}
          </div>
        </div>

        {/* --- FILTERS TOGGLE --- */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
              className="text-gray-700 flex items-center gap-2 rounded-full px-2 py-1 text-sm font-medium transition-all duration-300 hover:bg-gray dark:text-white dark:hover:bg-meta-4"
            >
              <span>Filters</span>
              <svg className={`h-4 w-4 transition-transform ${isFiltersExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            <div className="text-gray-500 text-sm">
              {activeFiltersCount} active filters
            </div>
          </div>

          {/* --- EXPANDABLE FILTERS PANEL --- */}
          <div className={`transition-all duration-300 ease-in-out ${isFiltersExpanded ? "mt-4 opacity-100" : "max-h-0 overflow-hidden opacity-0"}`}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Platform</label>
                <select
                  value={platformFilter}
                  onChange={(e) => setPlatformFilter(e.target.value)}
                  className="rounded-lg border border-stroke px-3 py-2 text-black dark:border-form-strokedark dark:bg-form-input dark:text-white"
                >
                  <option value="All">All Platforms</option>
                  <option value="facebook">Facebook</option>
                  <option value="instagram">Instagram</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-lg border border-stroke px-3 py-2 text-black dark:border-form-strokedark dark:bg-form-input dark:text-white"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Paused">Paused</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Errors (Fallback)</label>
                <select
                  value={errorFilter}
                  onChange={(e) => setErrorFilter(e.target.value)}
                  className="rounded-lg border border-stroke px-3 py-2 text-black dark:border-form-strokedark dark:bg-form-input dark:text-white"
                >
                  <option value="All">All Jobs</option>
                  <option value="Errors">Has Errors (Fallback)</option>
                  <option value="No Errors">No Errors</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">VIP Status</label>
                <select
                  value={vipFilter}
                  onChange={(e) => setVipFilter(e.target.value)}
                  className="rounded-lg border border-stroke px-3 py-2 text-black dark:border-form-strokedark dark:bg-form-input dark:text-white"
                >
                  <option value="All">All Users</option>
                  <option value="VIP">VIP Only</option>
                  <option value="Normal">Normal Only</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Date Range</label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-lg border border-stroke px-2 py-2 text-sm text-black dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-lg border border-stroke px-2 py-2 text-sm text-black dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              {activeFiltersCount > 0 && (
                <button
                  onClick={() => {
                    setPlatformFilter("All");
                    setStatusFilter("All");
                    setErrorFilter("All");
                    setVipFilter("All");
                    setStartDate("");
                    setEndDate("");
                  }}
                  className="text-gray-700 rounded-lg border border-stroke px-4 py-2 text-sm font-medium transition-all duration-300 hover:bg-gray dark:text-white dark:border-strokedark dark:hover:bg-meta-4"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>
        </div>


        <div className="flex flex-col">
          <div className="grid grid-cols-4 rounded-sm bg-gray-2 dark:bg-meta-4 sm:grid-cols-[auto_repeat(7,1fr)] items-center">
            <div className="p-2.5 xl:p-5 pr-0 flex items-center justify-center w-10">
                <input
                  type="checkbox"
                  className="w-4 h-4 cursor-pointer"
                  checked={selectedJobs.length === filteredJobs.length && filteredJobs.length > 0}
                  onChange={toggleAll}
                />
            </div>
            <div className="p-2.5 xl:p-5">
              <h5 className="text-sm font-medium uppercase xsm:text-base">Target Link</h5>
            </div>
            <div className="p-2.5 text-center xl:p-5">
              <h5 className="text-sm font-medium uppercase xsm:text-base">Platform</h5>
            </div>
            <div className="hidden p-2.5 text-center sm:block xl:p-5">
              <h5 className="text-sm font-medium uppercase xsm:text-base">Type</h5>
            </div>
            <div className="hidden p-2.5 text-center sm:block xl:p-5">
              <h5 className="text-sm font-medium uppercase xsm:text-base">Status</h5>
            </div>
            <div className="hidden p-2.5 text-center sm:block xl:p-5">
              <h5 className="text-sm font-medium uppercase xsm:text-base">Count</h5>
            </div>
            <div className="hidden p-2.5 text-center sm:block xl:p-5">
              <h5 className="text-sm font-medium uppercase xsm:text-base">VIP</h5>
            </div>
            <div className="p-2.5 text-center xl:p-5">
              <h5 className="text-sm font-medium uppercase xsm:text-base">Actions</h5>
            </div>
          </div>

          {(() => {
            if (loading) return <div className="p-5 text-center">Loading...</div>;
            if (filteredJobs.length === 0) return <div className="p-5 text-center">No V2 jobs match your filters.</div>;

            return filteredJobs.map((job, key) => (
              <div
                className={`grid grid-cols-4 sm:grid-cols-[auto_repeat(7,1fr)] items-center hover:bg-slate-100/50 ${
                  key === filteredJobs.length - 1 ? "" : "border-b border-stroke dark:border-strokedark"
                }`}
                key={job._id || key}
              >
                <div className="p-2.5 xl:p-5 pr-0 flex items-center justify-center w-10">
                  <input
                    type="checkbox"
                    className="w-4 h-4 cursor-pointer"
                    checked={selectedJobs.includes(job._id)}
                    onChange={() => toggleSelection(job._id)}
                  />
                </div>
                <div className="flex items-center p-2.5 xl:p-5">
                  <a href={job.targetLink} target="_blank" rel="noreferrer" className="text-primary truncate w-24 sm:w-40 hover:underline" title={job.targetLink}>
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
                  <p className="text-meta-3 capitalize font-medium">{job.linkTypeName || job.actionType || "Like"}</p>
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
                  {job.resolutionStatus === 'fallback' && (
                    <div title={job.resolutionError || "Failed to resolve ID. Using Fallback mode."} className="text-danger flex items-center justify-center cursor-help">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                        <path d="M12 9v4" />
                        <path d="M12 17h.01" />
                      </svg>
                    </div>
                  )}
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

                <div className="flex items-center justify-center p-2.5 xl:p-5 space-x-3.5">
                  <a href={`/jobs/${job._id}`} className="hover:text-primary" title="View Job">
                    <svg
                      className="fill-current"
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M8.99981 14.8219C3.43106 14.8219 0.674805 9.50624 0.562305 9.28124C0.47793 9.11249 0.47793 8.88749 0.562305 8.71874C0.674805 8.49374 3.43106 3.20624 8.99981 3.20624C14.5686 3.20624 17.3248 8.49374 17.4373 8.71874C17.5217 8.88749 17.5217 9.11249 17.4373 9.28124C17.3248 9.50624 14.5686 14.8219 8.99981 14.8219ZM1.85605 8.99999C2.4748 10.0406 4.89356 13.5562 8.99981 13.5562C13.1061 13.5562 15.5248 10.0406 16.1436 8.99999C15.5248 7.95936 13.1061 4.44374 8.99981 4.44374C4.89356 4.44374 2.4748 7.95936 1.85605 8.99999Z"
                      />
                      <path
                        d="M9 11.3906C7.67812 11.3906 6.60938 10.3219 6.60938 9C6.60938 7.67813 7.67812 6.60938 9 6.60938C10.3219 6.60938 11.3906 7.67813 11.3906 9C11.3906 10.3219 10.3219 11.3906 9 11.3906ZM9 7.875C8.38125 7.875 7.875 8.38125 7.875 9C7.875 9.61875 8.38125 10.125 9 10.125C9.61875 10.125 10.125 9.61875 10.125 9C10.125 8.38125 9.61875 7.875 9 7.875Z"
                      />
                    </svg>
                  </a>
                  <button onClick={() => handleToggleStatus(job._id, job.status)} className="hover:text-warning" title={job.status === "Active" || job.status === "active" ? "Pause Job" : "Resume Job"}>
                    <svg className="fill-current" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      {job.status === "Active" || job.status === "active" ? (
                        <path fillRule="evenodd" clipRule="evenodd" d="M6 5C5.44772 5 5 5.44772 5 6V18C5 18.5523 5.44772 19 6 19H9C9.55228 19 10 18.5523 10 18V6C10 5.44772 9.55228 5 9 5H6ZM14 5C13.4477 5 13 5.44772 13 6V18C13 18.5523 13.4477 19 14 19H17C17.5523 19 18 18.5523 18 18V6C18 5.44772 17.5523 5 17 5H14Z" fill="currentColor"/>
                      ) : (
                        <path fillRule="evenodd" clipRule="evenodd" d="M8 5C7.44772 5 7 5.44772 7 6V18C7 18.5523 7.44772 19 8 19C8.18843 19 8.36868 18.9482 8.52824 18.8553L17.5282 13.6277C17.8207 13.4578 18 13.1417 18 12.8029C18 12.4641 17.8207 12.148 17.5282 11.9781L8.52824 6.75053C8.36868 6.65766 8.18843 6.60583 8 6.60583V5Z" fill="currentColor"/>
                      )}
                    </svg>
                  </button>
                  <button onClick={() => handleDeleteSingle(job._id)} className="hover:text-danger" title="Delete Job">
                    <svg
                      className="fill-current"
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M13.7535 2.47502H11.5879V1.9969C11.5879 1.15315 10.9129 0.478149 10.0691 0.478149H7.90352C7.05977 0.478149 6.38477 1.15315 6.38477 1.9969V2.47502H4.21914C3.40352 2.47502 2.72852 3.15002 2.72852 3.96565V4.8094C2.72852 5.42815 3.09414 5.9344 3.62852 6.1594L4.07852 15.4688C4.13477 16.6219 5.09102 17.5219 6.24414 17.5219H11.7004C12.8535 17.5219 13.8098 16.6219 13.866 15.4688L14.3441 6.13127C14.8785 5.90627 15.2441 5.3719 15.2441 4.78127V3.93752C15.2441 3.15002 14.5691 2.47502 13.7535 2.47502ZM7.67852 1.9969C7.67852 1.85627 7.79102 1.74377 7.93164 1.74377H10.041C10.1816 1.74377 10.2941 1.85627 10.2941 1.9969V2.47502H7.67852V1.9969ZM12.6004 15.4125C12.5723 15.9188 12.1785 16.2563 11.7004 16.2563H6.24414C5.76602 16.2563 5.37227 15.9188 5.34414 15.4125L4.89414 6.2719H13.0785L12.6004 15.4125ZM13.9785 4.78127C13.9785 5.00627 13.7816 5.20315 13.5566 5.20315H4.41602C4.19102 5.20315 3.99414 5.00627 3.99414 4.78127V3.93752C3.99414 3.71252 4.19102 3.51565 4.41602 3.51565H13.5566C13.7816 3.51565 13.9785 3.71252 13.9785 3.93752Z"
                      />
                      <path d="M9.475 7.84683C9.1375 7.84683 8.85625 8.12808 8.85625 8.46558V14.0062C8.85625 14.3437 9.1375 14.625 9.475 14.625C9.8125 14.625 10.0937 14.3437 10.0937 14.0062V8.46558C10.0937 8.12808 9.8125 7.84683 9.475 7.84683Z" />
                      <path d="M7.14062 8.35308C6.775 8.35308 6.52188 8.63433 6.52188 9.02808V13.3875C6.52188 13.7812 6.80312 14.0343 7.19687 14.0343C7.53437 14.0343 7.7875 13.7531 7.7875 13.4156V9.02808C7.75937 8.66245 7.47813 8.35308 7.14062 8.35308Z" />
                      <path d="M11.7844 8.35308C11.4187 8.35308 11.1656 8.63433 11.1656 9.02808V13.3875C11.1656 13.7812 11.4469 14.0343 11.8406 14.0343C12.1781 14.0343 12.4313 13.7531 12.4313 13.4156V9.02808C12.4313 8.66245 12.15 8.35308 11.7844 8.35308Z" />
                    </svg>
                  </button>
                </div>
              </div>
            ));
          })()}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default JobsListV2;
