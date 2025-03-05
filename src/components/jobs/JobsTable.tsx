"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { Job, FilterState } from "@/types/jobs";
import { JobTableHeader } from "./JobTableHeader";
import { JobTableRow } from "./JobTableRow";
import DeleteModal from "./DeleteModal";
import API from "@/utils/API";
import { getJwtFromLocalStorage } from "@/utils/localStorage";
import JobFilters from "./Filter";
import Pagination from "./Pagination";
import SearchBar from "./SearchBar";

const initialFilterState: FilterState = {
  platformFilter: "",
  statusFilter: "",
  startDate: "",
  endDate: "",
  minLikes: "",
  jobIdFilter: "",
  liveFilter: "all",
  linkTypeNameFilter: "",
  minMaxCount: "",
  uidFilter: "",
  isVipFilter: "all",
};

const headers = {
  Authorization: `JWT ${getJwtFromLocalStorage()}`,
  "Content-Type": "application/json",
};

const JobsTable: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const [filters, setFilters] = useState<FilterState>(initialFilterState);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const getJobs = async (page: number) => {
    try {
      const res = await API.get(
        `/api/v3/jobs?page=${page}&limit=${itemsPerPage}`,
        { headers },
      );
      if (res.status === 200) {
        setJobs(res.data.jobs);
        setTotalItems(res.data.pagination.total);
      } else {
        console.error("No Jobs found");
        toast.error("No Jobs found");
      }
    } catch (error) {
      console.error("Failed to fetch Jobs", error);
      toast.error("Failed to fetch Jobs");
    }
  };

  const handleSearch = () => {
    searchJobs();
  };

  const searchJobs = async () => {
    try {
      setIsSearching(true);
      const res = await API.get(
        `/api/v3/jobs/search/search?q=${encodeURIComponent(searchQuery)}&page=${currentPage}&limit=${itemsPerPage}`,
        { headers },
      );
      if (res.status === 200) {
        setJobs(res.data.jobs);
        setTotalItems(res.data.pagination.total);
      } else {
        console.error("Search failed");
        toast.error("Search failed");
      }
    } catch (error) {
      console.error("Failed to search jobs", error);
      toast.error("Failed to search jobs");
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setIsSearching(false);
    getJobs(1);
  };

  const deleteJobs = async (ids: string[]) => {
    try {
      setIsLoading(true);
      const res = await API.delete("/api/v3/jobs", {
        headers,
        data: { jobIds: ids },
      });

      if (res.status === 200) {
        toast.success(`Successfully deleted ${res.data.deletedCount} jobs`);
        await getJobs(1);
        setIsDeleteModalOpen(false);
        setSelectedJobs([]);
      } else {
        toast.error("Failed to delete jobs");
      }
    } catch (error) {
      console.error("Failed to delete jobs", error);
      toast.error("Failed to delete jobs");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked && filteredJobs) {
      setSelectedJobs(filteredJobs.map((job) => job._id));
    } else {
      setSelectedJobs([]);
    }
  };

  const handleSelectJob = (jobId: string, checked: boolean) => {
    if (checked) {
      setSelectedJobs([...selectedJobs, jobId]);
    } else {
      setSelectedJobs(selectedJobs.filter((id) => id !== jobId));
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    getJobs(page);
  };

  const filterJobs = () => {
    if (!jobs) return;

    let filtered = [...jobs];

    if (filters.platformFilter) {
      filtered = filtered.filter((job) =>
        job.platform
          .toLowerCase()
          .includes(filters.platformFilter.toLowerCase()),
      );
    }

    if (filters.statusFilter) {
      filtered = filtered.filter((job) => job.status === filters.statusFilter);
    }

    if (filters.jobIdFilter) {
      filtered = filtered.filter((job) =>
        job.jobId.toLowerCase().includes(filters.jobIdFilter.toLowerCase()),
      );
    }

    if (filters.startDate || filters.endDate) {
      filtered = filtered.filter((job) => {
        const jobDate = new Date(job.datePublished);
        const start = filters.startDate ? new Date(filters.startDate) : null;
        const end = filters.endDate ? new Date(filters.endDate) : null;

        if (start) start.setHours(0, 0, 0, 0);
        if (end) end.setHours(23, 59, 59, 999);
        jobDate.setHours(0, 0, 0, 0);

        if (start && end) {
          return jobDate >= start && jobDate <= end;
        } else if (start) {
          return jobDate >= start;
        } else if (end) {
          return jobDate <= end;
        }
        return true;
      });
    }

    if (filters.minLikes) {
      filtered = filtered.filter(
        (job) => job.likeCount >= parseInt(filters.minLikes),
      );
    }

    if (filters.liveFilter !== "all") {
      filtered = filtered.filter((job) => job.isLive === filters.liveFilter);
    }

    if (filters.isVipFilter !== "all") {
      filtered = filtered.filter(
        (job) => (job.isVip ?? false) === filters.isVipFilter,
      );
    }

    if (filters.linkTypeNameFilter) {
      filtered = filtered.filter((job) =>
        job.linkTypeName
          .toLowerCase()
          .includes(filters.linkTypeNameFilter.toLowerCase()),
      );
    }

    if (filters.minMaxCount) {
      filtered = filtered.filter(
        (job) => job.maxCount >= parseInt(filters.minMaxCount),
      );
    }

    if (filters.uidFilter) {
      filtered = filtered.filter((job) =>
        job.uid.toLowerCase().includes(filters.uidFilter.toLowerCase()),
      );
    }

    const filteredJobIds = new Set(filtered.map((job) => job._id));
    setSelectedJobs((prev) => prev.filter((id) => filteredJobIds.has(id)));

    setFilteredJobs(filtered);
  };

  useEffect(() => {
    if (!isSearching) {
      getJobs(currentPage);
    } else {
      searchJobs();
    }
  }, [currentPage]);

  useEffect(() => {
    filterJobs();
  }, [jobs, filters]);
  

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onSearch={handleSearch}
          placeholder="Search across all fields..."
        />
        {!isSearching && (
          <button
            onClick={clearSearch}
            className="text-gray-500 text-sm hover:text-primary"
          >
            Clear search
          </button>
        )}
      </div>

      <div className="mb-4">
        <JobFilters
          filters={filters}
          setFilters={setFilters}
          isExpanded={isFiltersExpanded}
          onToggle={() => setIsFiltersExpanded(!isFiltersExpanded)}
          onClear={() => {
            setFilters(initialFilterState);
          }}
        />
      </div>

      <div className="mb-6 flex justify-between">
        <div className="flex gap-4">
          {selectedJobs.length > 0 && (
            <>
              <button
                onClick={() => setSelectedJobs([])}
                className="text-gray-700 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 hover:bg-gray"
              >
                Unselect all
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="rounded-lg bg-red px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90"
              >
                Delete Selected ({selectedJobs.length})
              </button>
            </>
          )}
        </div>

        <Link
          href="/jobs/create"
          className="inline-flex items-center rounded-full bg-primary px-10 py-3 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
        >
          Add new job
        </Link>
      </div>

      {filteredJobs && (
        <div className="mb-2 flex w-full items-center justify-center">
          <h2 className="font-semibold sm:text-lg">{totalItems} Results</h2>
        </div>
      )}

      <div className="max-w-full overflow-x-auto">
        <div className="flex flex-col">
          <JobTableHeader
            onSelectAll={handleSelectAll}
            isAllSelected={
              filteredJobs?.length > 0 &&
              filteredJobs?.length === selectedJobs.length
            }
          />

          {filteredJobs?.map((job) => (
            <JobTableRow
              key={job._id}
              job={job}
              isSelected={selectedJobs.includes(job._id)}
              onSelect={handleSelectJob}
              onDelete={() => {
                setSelectedJobs([job._id]);
                setIsDeleteModalOpen(true);
              }}
            />
          ))}
        </div>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(totalItems / itemsPerPage)}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        className="mx-4 my-4"
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={() => deleteJobs(selectedJobs)}
        selectedCount={selectedJobs.length}
        isLoading={isLoading}
      />
    </div>
  );
};

export default JobsTable;
