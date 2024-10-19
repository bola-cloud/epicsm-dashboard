"use client";

import React from "react";
import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { useParams } from "next/navigation";
import { Job } from "@/types/jobs";
import DefaultLayout from "../Layouts/DefaultLayout";
import Breadcrumb from "../Breadcrumbs/Breadcrumb";
import Image from "next/image";
import { getJwtFromLocalStorage } from "@/utils/localStorage";

const headers = {
  Authorization: `JWT ${getJwtFromLocalStorage()}`,
  "Content-Type": "application/json",
};

function JobDetails() {
  const { id } = useParams();
  const [Job, setJob] = useState<Job | undefined>();
  const [enabled, setEnabled] = useState(false);

  async function getJob() {
    try {
      console.log("Fetching job with ID:", id); // Add this line
      const res = await axios.get(`https://api.epicsm.goviral.ma/api/jobs/user/${id}`);

      if (res.status === 200) {
        setJob(res.data);
        console.log(res);
      } else {
        console.error("No Job found");
        toast.error("No Job found");
      }
    } catch (error) {
      console.error("Failed to fetch Job", error);
      toast.error("Failed to fetch Job");
    }
  }

  useEffect(() => {
    getJob();
  }, [id]);

  useEffect(() => {
    Job?.isLive ? setEnabled(true) : setEnabled(false);
  }, [Job]);

  async function UpdateJob() {
    try {
      const res = await axios.put(`https://api.epicsm.goviral.ma/api/jobs/${id}`, {
        isLive: !enabled,
      }, {
        headers,
      });

      if (res.status === 201) {
        setEnabled(!enabled);
        toast.success("Job Updated");
        setJob(res.data);
      } else {
        console.error("No Job found");
        toast.error("No Job found");
      }
    } catch (error) {
      console.error("Error updating job", error);
      toast.error("Error updating job");
    }
  }

  return (
    <section className="w-full">
      <div className="mx-auto max-w-242.5">
        <Breadcrumb pageName="Job" />

        <div className="overflow-hidden rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="relative z-20 h-35 md:h-65">
            <Image
              src={"/images/cover/cover-01.png"}
              alt="profile cover"
              className="h-full w-full rounded-tl-sm rounded-tr-sm object-cover object-center"
              width={970}
              height={260}
              style={{
                width: "auto",
                height: "auto",
              }}
            />
          </div>
          <div className="px-4 pb-6 text-center lg:pb-8 xl:pb-11.5">
            <div className="relative z-30 mx-auto -mt-22 h-30 w-full max-w-30 rounded-full bg-white/20 p-1 backdrop-blur sm:h-44 sm:max-w-44 sm:p-3">
              <div className="relative drop-shadow-2">
                <Image
                  src={"/images/brand/brand-05.svg"}
                  width={160}
                  height={160}
                  alt="profile"
                />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="mb-1.5 text-2xl font-semibold text-black dark:text-white">
                {Job?._id}
              </h3>
              <p className="font-medium">Platform: {Job?.platform}</p>

              <ul className="mb-5 flex flex-col gap-2">
                <li>
                  <span>Status:</span> {Job?.status}
                </li>

                {Job?.datePublished && (
                  <li>
                    <span>Published On:</span>{" "}
                    {format(Job?.datePublished, "d MMMM yyyy")}
                  </li>
                )}

                {Job?.finishDate && (
                  <li>
                    <span>Finish Date:</span>{" "}
                    {new Date(Job?.finishDate).toLocaleString()}
                  </li>
                )}

                <li>
                  <span>Likes:</span> {Job?.likeCount}
                </li>

                {Job?.link && (
                  <li>
                    <span>Link:</span>{" "}
                    <a className="text-blue-500 underline" href={Job?.link}>
                      {Job?.link}
                    </a>
                  </li>
                )}

                <div className="flex items-center justify-center gap-2">
                  <li>
                    <span>Live:</span> {Job?.isLive ? "Yes" : "No"}
                  </li>

                  <label
                    htmlFor="toggle3"
                    className="flex cursor-pointer select-none items-center"
                  >
                    <div className="relative">
                      <input
                        type="checkbox"
                        id="toggle3"
                        className="sr-only"
                        onChange={UpdateJob}
                      />
                      <div className="block h-8 w-14 rounded-full bg-meta-9 dark:bg-[#5A616B]"></div>
                      <div
                        className={`dot absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white transition ${
                          enabled &&
                          "!right-1 !translate-x-full !bg-primary dark:!bg-white"
                        }`}
                      >
                        <span className={`hidden ${enabled && "!block"}`}>
                          <svg
                            className="fill-white dark:fill-black"
                            width="11"
                            height="8"
                            viewBox="0 0 11 8"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M10.0915 0.951972L10.0867 0.946075L10.0813 0.940568C9.90076 0.753564 9.61034 0.753146 9.42927 0.939309L4.16201 6.22962L1.58507 3.63469C1.40401 3.44841 1.11351 3.44879 0.932892 3.63584C0.755703 3.81933 0.755703 4.10875 0.932892 4.29224L0.932878 4.29225L0.934851 4.29424L3.58046 6.95832C3.73676 7.11955 3.94983 7.2 4.1473 7.2C4.36196 7.2 4.55963 7.11773 4.71406 6.9584L10.0468 1.60234C10.2436 1.4199 10.2421 1.1339 10.0915 0.951972ZM4.2327 6.30081L4.2317 6.2998C4.23206 6.30015 4.23237 6.30049 4.23269 6.30082L4.2327 6.30081Z"
                              fill=""
                              stroke=""
                              strokeWidth="0.4"
                            ></path>
                          </svg>
                        </span>
                        <span className={`${enabled && "hidden"}`}>
                          <svg
                            className="h-4 w-4 stroke-current"
                            fill="none"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            ></path>
                          </svg>
                        </span>
                      </div>
                    </div>
                  </label>
                </div>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default JobDetails;
