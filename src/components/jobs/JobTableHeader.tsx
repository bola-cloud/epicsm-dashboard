import { JobTableHeaderProps } from "@/types/jobs";
import React from "react";

export const JobTableHeader: React.FC<JobTableHeaderProps> = ({
  onSelectAll,
  isAllSelected,
}) => (
  <div className="grid grid-cols-3 rounded-sm bg-gray-2 dark:bg-meta-4 sm:grid-cols-8">
    <div className="p-2.5 xl:p-5">
      <h5 className="text-sm font-medium uppercase xsm:text-base">Platform</h5>
    </div>
    <div className="hidden p-2.5 text-center sm:block xl:p-5">
      <h5 className="text-sm font-medium uppercase xsm:text-base">
        Date Published
      </h5>
    </div>

    <div className="p-2.5 text-center xl:p-5">
      <h5 className="text-sm font-medium uppercase xsm:text-base">Status</h5>
    </div>

    <div className="hidden p-2.5 text-center sm:block xl:p-5">
      <h5 className="text-sm font-medium uppercase xsm:text-base">Job ID</h5>
    </div>

    <div className="hidden p-2.5 text-center sm:block xl:p-5">
      <h5 className="text-sm font-medium uppercase xsm:text-base">Objectif</h5>
    </div>

    <div className="hidden p-2.5 text-center sm:block xl:p-5">
      <h5 className="text-sm font-medium uppercase xsm:text-base">Likes</h5>
    </div>

    <div className="hidden p-2.5 text-center sm:block xl:p-5">
      <h5 className="text-sm font-medium uppercase xsm:text-base">Max count</h5>
    </div>

    <div className="flex items-center gap-2 p-2.5 xl:p-5">
      <h5 className="text-sm font-medium uppercase xsm:text-base">
        select all
      </h5>
      <input
        type="checkbox"
        className="h-5 w-5 rounded border-gray"
        checked={isAllSelected}
        onChange={(e) => onSelectAll(e.target.checked)}
      />
    </div>
  </div>
);
