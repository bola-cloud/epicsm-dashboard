"use client";
import { Job } from "@/types/jobs";
import { getJwtFromLocalStorage } from "@/utils/localStorage";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const headers = {
  Authorization: `JWT ${getJwtFromLocalStorage()}`,
  "Content-Type": "application/json",
};

const TableOne = () => {
  const [Jobs, setJobs] = useState<Job[] | undefined>();
  const [loading, setloading] = useState(false);

  async function getJobs() {
    try {
      const res = await axios.get("https://api.epicsm.goviral.ma/api/jobs/latest", {
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

  useEffect(() => {
    getJobs();
  }, []);

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
        Last added links
      </h4>

      <div className="flex flex-col">
        <div className="grid grid-cols-3 rounded-sm bg-gray-2 dark:bg-meta-4 sm:grid-cols-5">
          <div className="p-2.5 xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Platform
            </h5>
          </div>
          <div className="p-2.5 text-center xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Type
            </h5>
          </div>
          <div className="p-2.5 text-center xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Objective
            </h5>
          </div>
          <div className="hidden p-2.5 text-center sm:block xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Reaction count
            </h5>
          </div>
          <div className="hidden p-2.5 text-center sm:block xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Reactions
            </h5>
          </div>
        </div>

        {Jobs &&
          Jobs.map((link, key) => (
            <Link
              href={`/jobs/${link._id}`}
              className={`grid grid-cols-3 hover:bg-slate-100/50 sm:grid-cols-5 ${
                key === Jobs.length - 1
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
                <p className="hidden text-black dark:text-white sm:block">
                  {link.platform}
                </p>
              </div>

              <div className="flex items-center justify-center p-2.5 xl:p-5">
                <p className="inline-flex rounded-full bg-success bg-opacity-10 px-3 py-1 text-sm font-medium text-success">
                  {link.type}
                </p>
              </div>

              <div className="flex items-center justify-center p-2.5 xl:p-5">
                <p className="text-black dark:text-white">
                  {link.linkTypeName}
                </p>
              </div>

              <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
                <p className="text-black dark:text-white">{link.maxCount}</p>
              </div>

              <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
                <p className="text-meta-5">{link.likeCount}</p>
              </div>
            </Link>
          ))}
      </div>
    </div>
  );
};

export default TableOne;
