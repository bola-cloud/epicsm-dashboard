import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, Trash2 } from "lucide-react";
import { JobTableRowProps } from "@/types/jobs";

export const JobTableRow: React.FC<JobTableRowProps> = ({
  job,
  isSelected,
  onSelect,
  onDelete,
}) => (
  <div className="grid grid-cols-3 border-b border-stroke hover:bg-slate-100/50 dark:border-strokedark sm:grid-cols-7">
    <div className="flex items-center gap-3 p-2.5 xl:p-5">
      <input
        type="checkbox"
        className="border-gray-300 h-5 w-5 rounded"
        checked={isSelected}
        onChange={(e) => onSelect(job._id, e.target.checked)}
      />

      <div className="flex-shrink-0">
        <Image
          src="/images/brand/brand-05.svg"
          alt="job"
          width={48}
          height={48}
        />
      </div>
      <p className="hidden truncate text-black dark:text-white sm:block">
        {job.platform}
      </p>
    </div>

    <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
      <p className="text-black dark:text-white">
        {new Date(job.datePublished).toLocaleDateString()}
      </p>
    </div>

    <div className="flex items-center justify-center p-2.5 xl:p-5">
      <p
        className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium ${
          job.status === "Active"
            ? "bg-success text-success"
            : "bg-danger text-danger"
        }`}
      >
        {job.status}
      </p>
    </div>

    <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
      <p className="truncate text-black dark:text-white">{job.jobId}</p>
    </div>

    <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
      <p className="text-meta-5">{job.likeCount}</p>
    </div>

    <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
      <p className="text-meta-5">{job.maxCount}</p>
    </div>

    <div className="flex items-center justify-center space-x-3.5">
      <Link href={`/jobs/${job._id}`} className="hover:text-primary">
      <Eye />
      </Link>
      <button className="hover:text-red" onClick={() => onDelete(job._id)}>
      <Trash2 />
      </button>
    </div>
  </div>
);
