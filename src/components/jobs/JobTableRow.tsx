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
}) => {
  const isCompleted =
    (typeof job.maxCount === "number" &&
      typeof job.likeCount === "number" &&
      job.maxCount > 0 &&
      job.likeCount >= job.maxCount) ||
    job.status === "Completed" ||
    job.status === "completed" ||
    job.status === "مكتمل";

  return (
    <div className="grid grid-cols-3 border-b border-stroke hover:bg-slate-100/50 dark:border-strokedark sm:grid-cols-8">
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
        <div className="hidden sm:flex items-center gap-1.5 truncate">
          <p className="text-black dark:text-white capitalize">
            {job.platform}
          </p>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
            job.isV2 || (job.version && job.version.toUpperCase() === 'V2') || job.targetLink
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
              : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
          }`}>
            {job.isV2 || (job.version && job.version.toUpperCase() === 'V2') || job.targetLink ? 'V2' : (job.version || 'V1')}
          </span>
        </div>
      </div>

      <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
        <p className="text-black dark:text-white">
          {new Date(job.datePublished).toLocaleDateString()}
        </p>
      </div>

      <div className="flex items-center justify-center gap-1.5 p-2.5 xl:p-5">
        <p
          className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium ${
            isCompleted
              ? "bg-meta-5/10 text-meta-5 dark:bg-meta-5/20"
              : job.status === "Active"
              ? "bg-success text-success"
              : "bg-danger text-danger"
          }`}
        >
          {isCompleted ? "Completed" : job.status}
        </p>
        {job.isVip && (
          <span className="inline-flex items-center rounded-full bg-orange-200 px-2.5 py-0.5 text-xs font-medium text-orange-800">
            VIP
          </span>
        )}
        {(job.resolutionStatus === 'fallback' || job.isFallback) && (
          <div
            title={job.resolutionError || "تحذير: تعذر استخراج المعرف آلياً بواسطة الكوكيز/السكربت وتم تحويل الأوردر لرابط مباشر (Fallback)"}
            className="text-amber-500 hover:text-amber-600 flex items-center justify-center cursor-help"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
          </div>
        )}
      </div>

    <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
      <p className="truncate text-black dark:text-white">{job.jobId}</p>
    </div>

    <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
      <p className="truncate text-black dark:text-white">{job.linkTypeName}</p>
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
};
