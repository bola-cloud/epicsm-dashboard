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
  const [isFiltering, setIsFiltering] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [isSelectAllPages, setIsSelectAllPages] = useState(false);

  const getJobs = async (page: number) => {
    try {
      setIsLoading(true);
      const res = await API.get(
        `/api/v3/jobs?page=${page}&limit=${itemsPerPage}`,
        { headers },
      );
      if (res.status === 200) {
        setJobs(res.data.jobs);
        setTotalItems(res.data.pagination.total);
        setTotalPages(res.data.pagination.totalPages);
      } else {
        console.error("No Jobs found");
        toast.error("No Jobs found");
      }
    } catch (error) {
      console.error("Failed to fetch Jobs", error);
      toast.error("Failed to fetch Jobs");
    } finally {
      setIsLoading(false);
    }
  };

  const checkIfFiltersApplied = (): boolean => {
    return Object.entries(filters).some(([key, value]) => {
      const typedKey = key as keyof FilterState;

      if (typedKey === "liveFilter" && value === "all") return false;
      if (typedKey === "isVipFilter" && value === "all") return false;

      return (
        value !== initialFilterState[typedKey] &&
        value !== "" &&
        value !== "all"
      );
    });
  };

  const fetchFilteredJobs = async (page: number) => {
    setIsFiltering(true);
    setIsLoading(true);

    try {
      const queryParams = new URLSearchParams();

      queryParams.append("page", page.toString());
      queryParams.append("limit", itemsPerPage.toString());

      if (filters.platformFilter)
        queryParams.append("platformFilter", filters.platformFilter);
      if (filters.statusFilter)
        queryParams.append("statusFilter", filters.statusFilter);
      if (filters.startDate) queryParams.append("startDate", filters.startDate);
      if (filters.endDate) queryParams.append("endDate", filters.endDate);
      if (filters.minLikes) queryParams.append("minLikes", filters.minLikes);
      if (filters.jobIdFilter)
        queryParams.append("jobIdFilter", filters.jobIdFilter);
      if (filters.linkTypeNameFilter)
        queryParams.append("linkTypeNameFilter", filters.linkTypeNameFilter);
      if (filters.minMaxCount)
        queryParams.append("minMaxCount", filters.minMaxCount);
      if (filters.uidFilter) queryParams.append("uidFilter", filters.uidFilter);

      if (filters.liveFilter !== "all")
        queryParams.append("liveFilter", String(filters.liveFilter));
      if (filters.isVipFilter !== "all")
        queryParams.append("isVipFilter", String(filters.isVipFilter));

      const res = await API.get(
        `/api/v3/jobs/filter/filter?${queryParams.toString()}`,
        { headers },
      );

      if (res.status === 200) {
        if (Array.isArray(res.data)) {
          setJobs(res.data);
          setTotalItems(res.data.length);
          setTotalPages(Math.ceil(res.data.length / itemsPerPage) || 1);
        } else if (res.data.jobs) {
          setJobs(res.data.jobs);
          setTotalItems(res.data.pagination?.total || 0);
          setTotalPages(res.data.pagination?.totalPages || 1);
        } else {
          setJobs([]);
          setTotalItems(0);
          setTotalPages(1);
          toast.error("No jobs found matching your filters");
        }
      } else {
        console.error("Failed to get filtered jobs");
        toast.error("Failed to filter jobs");
      }
    } catch (error) {
      console.error("Error fetching filtered jobs", error);
      toast.error("Failed to filter jobs");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim() === "") {
      setIsSearching(false);
      setCurrentPage(1);
      getJobs(1);
    } else {
      setIsSearching(true);
      setCurrentPage(1);
      searchJobs(1);
    }
  };

  const searchJobs = async (page: number) => {
    try {
      setIsLoading(true);
      const res = await API.get(
        `/api/v3/jobs/search/search?q=${encodeURIComponent(searchQuery)}&page=${page}&limit=${itemsPerPage}`,
        { headers },
      );

      if (res.status === 200) {
        setJobs(res.data.jobs);
        setTotalItems(res.data.pagination.total);
        setTotalPages(res.data.pagination.totalPages);
      } else {
        console.error("Search failed");
        toast.error("Search failed");
      }
    } catch (error) {
      console.error("Failed to search jobs", error);
      toast.error("Failed to search jobs");
    } finally {
      setIsLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setIsSearching(false);
    setCurrentPage(1);
    getJobs(1);
  };

  const applyFilters = () => {
    if (checkIfFiltersApplied()) {
      setCurrentPage(1);
      fetchFilteredJobs(1);
    } else {
      setIsFiltering(false);
      setCurrentPage(1);
      getJobs(1);
    }
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

        // Reset select all state
        setIsSelectAllPages(false);

        if (isSearching) {
          searchJobs(1);
        } else if (isFiltering) {
          fetchFilteredJobs(1);
        } else {
          getJobs(1);
        }

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

  const handleSelectJob = (jobId: string, checked: boolean) => {
    // When manually selecting/deselecting a job, we're no longer in "select all pages" mode
    if (isSelectAllPages) {
      setIsSelectAllPages(false);
    }

    if (checked) {
      setSelectedJobs([...selectedJobs, jobId]);
    } else {
      setSelectedJobs(selectedJobs.filter((id) => id !== jobId));
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);

    if (isSearching) {
      searchJobs(page);
    } else if (isFiltering) {
      fetchFilteredJobs(page);
    } else {
      getJobs(page);
    }
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    // Note: We don't apply filters immediately anymore,
    // user needs to click "Apply Filters" button
  };

  const handleClearFilters = () => {
    setFilters(initialFilterState);
    setIsFiltering(false);
    setCurrentPage(1);
    getJobs(1);
  };

  const getAllJobIds = async (): Promise<string[]> => {
    try {
      setIsLoading(true);

      let endpoint = "/api/v3/jobs/all-ids/all-ids";

      if (isSearching && searchQuery.trim() !== "") {
        endpoint = `/api/v3/jobs/search/all-ids/all-ids?q=${encodeURIComponent(searchQuery)}`;
      } else if (isFiltering && checkIfFiltersApplied()) {
        const queryParams = new URLSearchParams();

        if (filters.platformFilter)
          queryParams.append("platformFilter", filters.platformFilter);
        if (filters.statusFilter)
          queryParams.append("statusFilter", filters.statusFilter);
        if (filters.startDate)
          queryParams.append("startDate", filters.startDate);
        if (filters.endDate) queryParams.append("endDate", filters.endDate);
        if (filters.minLikes) queryParams.append("minLikes", filters.minLikes);
        if (filters.jobIdFilter)
          queryParams.append("jobIdFilter", filters.jobIdFilter);
        if (filters.linkTypeNameFilter)
          queryParams.append("linkTypeNameFilter", filters.linkTypeNameFilter);
        if (filters.minMaxCount)
          queryParams.append("minMaxCount", filters.minMaxCount);
        if (filters.uidFilter)
          queryParams.append("uidFilter", filters.uidFilter);
        if (filters.liveFilter !== "all")
          queryParams.append("liveFilter", String(filters.liveFilter));
        if (filters.isVipFilter !== "all")
          queryParams.append("isVipFilter", String(filters.isVipFilter));

        endpoint = `/api/v3/jobs/filtered/all-ids/all-ids?${queryParams.toString()}`;
      }

      const res = await API.get(endpoint, { headers });

      if (res.status === 200) {
        return res.data.jobIds || [];
      } else {
        console.error("Failed to fetch all job IDs");
        toast.error("Failed to fetch all job IDs");
        return [];
      }
    } catch (error) {
      console.error("Error fetching all job IDs", error);
      toast.error("Failed to fetch all job IDs");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAll = async (checked: boolean) => {
    if (checked) {
      // Show toast to indicate loading
      const loadingToast = toast.loading("Selecting all jobs...");

      // Get all job IDs
      const allJobIds = await getAllJobIds();

      // Update state
      setIsSelectAllPages(true);
      setSelectedJobs(allJobIds);

      // Dismiss loading toast and show success toast
      toast.dismiss(loadingToast);
      toast.success(`Selected all ${allJobIds.length} jobs across all pages`);
    } else {
      // Clear selection
      setIsSelectAllPages(false);
      setSelectedJobs([]);
      toast.success("Cleared job selection");
    }
  };

  // Initial data load
  useEffect(() => {
    getJobs(1);
  }, []);

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onSearch={handleSearch}
          placeholder="Search across all fields..."
        />
        {searchQuery && (
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
          setFilters={handleFilterChange}
          isExpanded={isFiltersExpanded}
          onToggle={() => setIsFiltersExpanded(!isFiltersExpanded)}
          onClear={handleClearFilters}
          onApply={applyFilters} // New prop for applying filters
        />
      </div>

      <div className="mb-6 flex justify-between">
        <div className="flex gap-4">
          {selectedJobs.length > 0 && (
            <>
              <button
                onClick={() => {
                  setSelectedJobs([]);
                  setIsSelectAllPages(false);
                }}
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

      {jobs && (
        <div className="mb-2 flex w-full items-center justify-center">
          <h2 className="font-semibold sm:text-lg">
            {isLoading
              ? "Loading..."
              : `${totalItems} ${isSearching ? "Search Results" : "Results"}`}
            {isSelectAllPages &&
              selectedJobs.length > 0 &&
              ` (${selectedJobs.length} selected across all pages)`}
          </h2>
        </div>
      )}

      <div className="max-w-full overflow-x-auto">
        <div className="flex flex-col">
          <JobTableHeader
            onSelectAll={handleSelectAll}
            isAllSelected={
              isSelectAllPages ||
              (jobs?.length > 0 && jobs?.length === selectedJobs.length)
            }
          />

          {isLoading ? (
            <div className="text-gray-500 py-4 text-center">
              Loading jobs...
            </div>
          ) : jobs?.length > 0 ? (
            jobs.map((job) => (
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
            ))
          ) : (
            <div className="text-gray-500 py-4 text-center">
              No jobs found matching your criteria.
            </div>
          )}
        </div>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
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
