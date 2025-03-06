import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { FilterProps, FilterState } from "@/types/jobs";

const JobFilters: React.FC<FilterProps> = ({
  filters,
  setFilters,
  isExpanded,
  onToggle,
  onClear,
  onApply,
}) => {
  const handleClearFilters = () => {
    onClear();
  };

  const updateFilter = (
    key: keyof FilterState,
    value: string | boolean | "all",
  ) => {
    setFilters({ ...filters, [key]: value });
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === "liveFilter" || key === "isVipFilter") return value !== "all";
    if (typeof value === "boolean") return value;
    return value !== "";
  }).length;

  return (
    <div className="mb-4">
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={onToggle}
          className="text-gray-700 flex items-center gap-2 rounded-full px-2 py-1 text-sm font-medium transition-all duration-300 hover:bg-gray"
        >
          <span>Filters</span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        <div className="text-gray-500 text-sm">
          {activeFiltersCount} active filters
        </div>
      </div>

      <div
        className={`transition-all duration-300 ease-in-out ${
          isExpanded ? "mb-6 opacity-100" : "max-h-0 overflow-hidden opacity-0"
        }`}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <FilterInput
            label="Platform"
            value={filters.platformFilter}
            onChange={(value) => updateFilter("platformFilter", value)}
            placeholder="Filter by platform"
          />

          <FilterSelect
            label="Status"
            value={filters.statusFilter}
            onChange={(value) => updateFilter("statusFilter", value)}
            options={[
              { value: "", label: "All" },
              { value: "Active", label: "Active" },
              { value: "Deleted", label: "Deleted" },
            ]}
          />

          <FilterInput
            label="Job ID"
            value={filters.jobIdFilter}
            onChange={(value) => updateFilter("jobIdFilter", value)}
            placeholder="Filter by Job ID"
          />

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Date Range</label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => updateFilter("startDate", e.target.value)}
                className="w-full rounded-lg border border-stroke px-3 py-2 text-black"
              />
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => updateFilter("endDate", e.target.value)}
                className="w-full rounded-lg border border-stroke px-3 py-2 text-black"
              />
            </div>
          </div>

          <FilterInput
            label="Minimum Likes"
            value={filters.minLikes}
            onChange={(value) => updateFilter("minLikes", value)}
            type="number"
            placeholder="Min likes"
          />

          <FilterInput
            label="Link Type"
            value={filters.linkTypeNameFilter}
            onChange={(value) => updateFilter("linkTypeNameFilter", value)}
            placeholder="Filter by link type"
          />

          <FilterInput
            label="UID"
            value={filters.uidFilter}
            onChange={(value) => updateFilter("uidFilter", value)}
            placeholder="Filter by UID"
          />

          <FilterInput
            label="Minimum Max Count"
            value={filters.minMaxCount}
            onChange={(value) => updateFilter("minMaxCount", value)}
            type="number"
            placeholder="Min max count"
          />

          <LiveJobsFilter
            value={filters.liveFilter}
            onChange={(value) => updateFilter("liveFilter", value)}
          />

          <VipJobsFilter
            value={filters.isVipFilter}
            onChange={(value) => updateFilter("isVipFilter", value)}
          />
        </div>

        {/* New Apply button row */}
        <div className="mt-4 flex justify-end gap-3">
          {activeFiltersCount > 0 && (
            <button
              onClick={handleClearFilters}
              className="text-gray-700 rounded-lg border border-stroke px-4 py-2 text-sm font-medium transition-all duration-300 hover:bg-gray"
            >
              Clear all filters
            </button>
          )}

          <button
            onClick={onApply}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:bg-opacity-90"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Remove the clear filters button from outside if we have it inside the filter panel */}
      {isExpanded === false && activeFiltersCount > 0 && (
        <div className="flex items-center justify-between">
          <button
            onClick={handleClearFilters}
            className="rounded-full px-2 py-1 transition-all duration-300 hover:bg-gray"
          >
            Clear all filters
          </button>

          <button
            onClick={onApply}
            className="rounded-lg bg-primary px-3 py-1 text-sm font-medium text-white transition-all duration-300 hover:bg-opacity-90"
          >
            Apply Filters
          </button>
        </div>
      )}
    </div>
  );
};

interface FilterInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}

const FilterInput: React.FC<FilterInputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}) => (
  <div className="flex flex-col gap-2">
    <label className="text-sm font-medium">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-stroke px-3 py-2 text-black"
      placeholder={placeholder}
    />
  </div>
);

interface FilterSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}

const FilterSelect: React.FC<FilterSelectProps> = ({
  label,
  value,
  onChange,
  options,
}) => (
  <div className="flex flex-col gap-2">
    <label className="text-sm font-medium">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-stroke px-3 py-2 text-black"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

interface LiveJobsFilterProps {
  value: "all" | boolean;
  onChange: (value: "all" | boolean) => void;
}

const LiveJobsFilter: React.FC<LiveJobsFilterProps> = ({ value, onChange }) => (
  <div className="flex flex-col gap-2">
    <label className="text-sm font-medium">Live Jobs</label>
    <div className="flex items-center gap-2">
      <label className="flex items-center gap-2">
        <input
          type="radio"
          name="liveJobs"
          checked={value === true}
          onChange={() => onChange(true)}
          className="h-4 w-4 rounded-full border-gray text-primary"
        />
        <span className="text-gray-700 text-sm">Live</span>
      </label>

      <label className="flex items-center gap-2">
        <input
          type="radio"
          name="liveJobs"
          checked={value === false}
          onChange={() => onChange(false)}
          className="h-4 w-4 rounded-full border-gray text-primary"
        />
        <span className="text-gray-700 text-sm">Not Live</span>
      </label>
    </div>
  </div>
);

interface VipJobsFilterProps {
  value: "all" | boolean;
  onChange: (value: "all" | boolean) => void;
}

const VipJobsFilter: React.FC<VipJobsFilterProps> = ({ value, onChange }) => (
  <div className="flex flex-col gap-2">
    <label className="text-sm font-medium">VIP Status</label>
    <div className="flex items-center gap-4">
      <label className="flex items-center gap-2">
        <input
          type="radio"
          name="vipStatus"
          checked={value === "all"}
          onChange={() => onChange("all")}
          className="h-4 w-4 rounded-full border-gray text-primary"
        />
        <span className="text-gray-700 text-sm">All</span>
      </label>

      <label className="flex items-center gap-2">
        <input
          type="radio"
          name="vipStatus"
          checked={value === true}
          onChange={() => onChange(true)}
          className="h-4 w-4 rounded-full border-gray text-primary"
        />
        <span className="text-gray-700 text-sm">VIP</span>
      </label>

      <label className="flex items-center gap-2">
        <input
          type="radio"
          name="vipStatus"
          checked={value === false}
          onChange={() => onChange(false)}
          className="h-4 w-4 rounded-full border-gray text-primary"
        />
        <span className="text-gray-700 text-sm">Non-VIP</span>
      </label>
    </div>
  </div>
);

export default JobFilters;
