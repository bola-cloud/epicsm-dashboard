"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Job } from "../../types/jobs";
import { getJwtFromLocalStorage } from "@/utils/localStorage";
import API from "@/utils/API";

const headers = {
  Authorization: `JWT ${getJwtFromLocalStorage()}`,
  "Content-Type": "application/json",
};

const JobsTable = () => {
  const [Jobs, setJobs] = useState<Job[] | undefined>();
  const [filteredJobs, setFilteredJobs] = useState<Job[] | undefined>();
  const [ShowModal, setShowModal] = useState(false);
  const [JobId, setJobId] = useState("");
  const [loading, setloading] = useState(false);
  const [refrech, setrefrech] = useState(false);

  // Filter states
  const [platformFilter, setPlatformFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [publishDate, setPublishDate] = useState("");
  const [minLikes, setMinLikes] = useState("");
  const [jobIdFilter, setJobIdFilter] = useState("");
  const [isLive, setIsLive] = useState(false);

  async function getJobs() {
    try {
      const res = await API.get("/api/v3/jobs", {
        headers,
      });

      if (res.status === 200) {
        setJobs(res.data);
      } else {
        console.error("No Jobs found");
        toast.error("No Jobs found");
      }
    } catch (error) {
      console.error("Failed to fetch Jobs", error);
      toast.error("Failed to fetch Jobs");
    }
  }

  async function deleteJob(id: string) {
    try {
      setloading(true);
      const res = await API.delete(`/api/v3/jobs/${id}`, {
        headers,
      });
      if (res.status === 200) {
        toast.success("Job has been deleted.");
        setrefrech(!refrech);
        setShowModal(false);
      }
    } catch (error) {
      console.error("Failed to delete job", error);
      toast.error("Failed to delete job");
    } finally {
      setloading(false);
    }
  }

  useEffect(() => {
    getJobs();
  }, [refrech]);

  useEffect(() => {
    if (!Jobs) return;

    let filtered = [...Jobs];

    if (platformFilter) {
      filtered = filtered.filter((job) =>
        job.platform.toLowerCase().includes(platformFilter.toLowerCase()),
      );
    }

    if (statusFilter) {
      filtered = filtered.filter((job) => job.status === statusFilter);
    }

    if (publishDate) {
      const selectedDate = new Date(publishDate);
      filtered = filtered.filter(
        (job) =>
          new Date(job.datePublished).toDateString() ===
          selectedDate.toDateString(),
      );
    }

    if (minLikes) {
      filtered = filtered.filter((job) => job.likeCount >= parseInt(minLikes));
    }

    if (jobIdFilter) {
      filtered = filtered.filter((job) =>
        job.jobId.toLowerCase().includes(jobIdFilter.toLowerCase()),
      );
    }

    if (isLive) {
      filtered = filtered.filter((job) => job.status === "Active");
    }

    setFilteredJobs(filtered);
  }, [
    Jobs,
    platformFilter,
    statusFilter,
    publishDate,
    minLikes,
    jobIdFilter,
    isLive,
  ]);

  const clearFilters = () => {
    setPlatformFilter("");
    setStatusFilter("");
    setPublishDate("");
    setMinLikes("");
    setJobIdFilter("");
    setIsLive(false);
  };

  return (
    <>
      <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Platform</label>
            <input
              type="text"
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="rounded-lg border border-stroke px-3 py-2 text-black"
              placeholder="Filter by platform"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-stroke px-3 py-2 text-black"
            >
              <option value="">All</option>
              <option value="Active">Active</option>
              <option value="Deleted">Deleted</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Job ID</label>
            <input
              type="text"
              value={jobIdFilter}
              onChange={(e) => setJobIdFilter(e.target.value)}
              className="rounded-lg border border-stroke px-3 py-2 text-black"
              placeholder="Filter by Job ID"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Publish Date</label>
            <input
              type="date"
              value={publishDate}
              onChange={(e) => setPublishDate(e.target.value)}
              className="rounded-lg border border-stroke px-3 py-2 text-black"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Minimum Likes</label>
            <input
              type="number"
              value={minLikes}
              onChange={(e) => setMinLikes(e.target.value)}
              className="rounded-lg border border-stroke px-3 py-2 text-black"
              placeholder="Min likes"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Live Jobs</label>
            <div className="flex items-center">
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={isLive}
                  onChange={(e) => setIsLive(e.target.checked)}
                />
                <div className="bg-gray after:border-gray peer h-6 w-11 rounded-full after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
              </label>
            </div>
          </div>
        </div>

        <div className="mb-6 flex justify-between">
          <button
            onClick={clearFilters}
            className="bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-lg px-4 py-2 text-sm font-medium"
          >
            Clear Filters
          </button>

          <Link
            href="/jobs/create"
            className="inline-flex items-center rounded-full bg-primary px-10 py-3 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
          >
            Add new job
          </Link>
        </div>

        <div className="max-w-full overflow-x-auto">
          <div className="flex flex-col">
            <div className="grid grid-cols-3 rounded-sm bg-gray-2 dark:bg-meta-4 sm:grid-cols-6">
              <div className="p-2.5 xl:p-5">
                <h5 className="text-sm font-medium uppercase xsm:text-base">
                  Platform
                </h5>
              </div>
              <div className="hidden p-2.5 text-center sm:block xl:p-5">
                <h5 className="text-sm font-medium uppercase xsm:text-base">
                  Date Published
                </h5>
              </div>

              <div className="p-2.5 text-center xl:p-5">
                <h5 className="text-sm font-medium uppercase xsm:text-base">
                  Status
                </h5>
              </div>

              <div className="hidden p-2.5 text-center sm:block xl:p-5">
                <h5 className="text-sm font-medium uppercase xsm:text-base">
                  Job ID
                </h5>
              </div>

              <div className="hidden p-2.5 text-center sm:block xl:p-5">
                <h5 className="text-sm font-medium uppercase xsm:text-base">
                  Likes
                </h5>
              </div>

              <div className="block p-2.5 text-center xl:p-5">
                <h5 className="text-sm font-medium uppercase xsm:text-base">
                  Actions
                </h5>
              </div>
            </div>

            {filteredJobs &&
              filteredJobs.map((link, key) => (
                <div
                  className={`grid grid-cols-3 hover:bg-slate-100/50 sm:grid-cols-6 ${
                    key === filteredJobs.length - 1
                      ? ""
                      : "border-b border-stroke dark:border-strokedark"
                  }`}
                  key={key}
                >
                  <div className="flex items-center gap-3 p-2.5 xl:p-5">
                    <div className="flex-shrink-0">
                      <Image
                        src={"/images/brand/brand-05.svg"}
                        alt="link"
                        width={48}
                        height={48}
                      />
                    </div>
                    <p className="hidden truncate text-black dark:text-white sm:block">
                      {link.platform}
                    </p>
                  </div>

                  <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
                    <p className="text-black dark:text-white">
                      {" "}
                      {new Date(link.datePublished).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center justify-center p-2.5 xl:p-5">
                    <p
                      className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium ${
                        link.status === "Active"
                          ? "bg-success text-success"
                          : "bg-danger text-danger"
                      }`}
                    >
                      {link.status}
                    </p>
                  </div>

                  <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
                    <p className="truncate text-black dark:text-white">
                      {link.jobId}
                    </p>
                  </div>

                  <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
                    <p className="text-meta-5">{link.likeCount}</p>
                  </div>

                  <div className="flex items-center justify-center space-x-3.5">
                    <Link
                      href={`/jobs/${link._id}`}
                      className="hover:text-primary"
                    >
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
                          fill=""
                        />
                        <path
                          d="M9 11.3906C7.67812 11.3906 6.60938 10.3219 6.60938 9C6.60938 7.67813 7.67812 6.60938 9 6.60938C10.3219 6.60938 11.3906 7.67813 11.3906 9C11.3906 10.3219 10.3219 11.3906 9 11.3906ZM9 7.875C8.38125 7.875 7.875 8.38125 7.875 9C7.875 9.61875 8.38125 10.125 9 10.125C9.61875 10.125 10.125 9.61875 10.125 9C10.125 8.38125 9.61875 7.875 9 7.875Z"
                          fill=""
                        />
                      </svg>
                    </Link>
                    <button
                      className="hover:text-red"
                      onClick={() => {
                        setShowModal(true);
                        setJobId(link._id);
                      }}
                    >
                      <svg
                        className="fill-current"
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M13.7535 2.47502H11.5879V1.9969C11.5879 1.15315 10.9129 0.478149 10.0691 0.478149H7.90352C7.05977 0.478149 6.38477 1.15315 6.38477 1.9969V2.47502H4.21914C3.40352 2.47502 2.72852 3.15002 2.72852 3.96565V4.8094C2.72852 5.42815 3.09414 5.9344 3.62852 6.1594L4.07852 15.4688C4.13477 16.6219 5.09102 17.5219 6.24414 17.5219H11.7004C12.8535 17.5219 13.8098 16.6219 13.866 15.4688L14.3441 6.13127C14.8785 5.90627 15.2441 5.3719 15.2441 4.78127V3.93752C15.2441 3.15002 14.5691 2.47502 13.7535 2.47502ZM7.67852 1.9969C7.67852 1.85627 7.79102 1.74377 7.93164 1.74377H10.0973C10.2379 1.74377 10.3504 1.85627 10.3504 1.9969V2.47502H7.70664V1.9969H7.67852ZM4.02227 3.96565C4.02227 3.85315 4.10664 3.74065 4.24727 3.74065H13.7535C13.866 3.74065 13.9785 3.82502 13.9785 3.96565V4.8094C13.9785 4.9219 13.8941 5.0344 13.7535 5.0344H4.24727C4.13477 5.0344 4.02227 4.95002 4.02227 4.8094V3.96565ZM11.7285 16.2563H6.27227C5.79414 16.2563 5.40039 15.8906 5.37227 15.3844L4.95039 6.2719H13.0785L12.6566 15.3844C12.6004 15.8625 12.2066 16.2563 11.7285 16.2563Z"
                          fill=""
                        />
                        <path
                          d="M9.00039 9.11255C8.66289 9.11255 8.35352 9.3938 8.35352 9.75942V13.3313C8.35352 13.6688 8.63477 13.9782 9.00039 13.9782C9.33789 13.9782 9.64727 13.6969 9.64727 13.3313V9.75942C9.64727 9.3938 9.33789 9.11255 9.00039 9.11255Z"
                          fill=""
                        />
                        <path
                          d="M11.2502 9.67504C10.8846 9.64692 10.6033 9.90004 10.5752 10.2657L10.4064 12.7407C10.3783 13.0782 10.6314 13.3875 10.9971 13.4157C11.0252 13.4157 11.0252 13.4157 11.0533 13.4157C11.3908 13.4157 11.6721 13.1625 11.6721 12.825L11.8408 10.35C11.8408 9.98442 11.5877 9.70317 11.2502 9.67504Z"
                          fill=""
                        />
                        <path
                          d="M6.72245 9.67504C6.38495 9.70317 6.1037 10.0125 6.13182 10.35L6.3287 12.825C6.35683 13.1625 6.63808 13.4157 6.94745 13.4157C6.97558 13.4157 6.97558 13.4157 7.0037 13.4157C7.3412 13.3875 7.62245 13.0782 7.59433 12.7407L7.39745 10.2657C7.39745 9.90004 7.08808 9.64692 6.72245 9.67504Z"
                          fill=""
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {ShowModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-700 bg-opacity-50">
          <div className="rounded-lg bg-white p-6 text-center shadow-lg">
            <p className="mb-4 text-lg font-semibold">Confirm deletion ?</p>
            <div className="flex w-full items-center space-x-4">
              <button
                disabled={loading}
                className="flex w-full justify-center rounded bg-red p-3 font-medium text-gray hover:bg-opacity-90 disabled:opacity-50"
                onClick={() => deleteJob(JobId)}
              >
                Delete
              </button>
              <button
                disabled={loading}
                className="flex w-full justify-center rounded bg-slate-400 p-3 font-medium text-gray hover:bg-opacity-90 disabled:opacity-50"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default JobsTable;
