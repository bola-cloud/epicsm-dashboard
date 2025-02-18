export interface Job {
  _id: string;
  createdAt: Date;
  datePublished: Date;
  finishDate?: Date | null;
  isLive: boolean;
  jobId: string;
  likeCount: number;
  link: string;
  linkTypeId: number;
  linkTypeName: string;
  maxCount: number;
  platform: string;
  country: string;
  status: string;
  type?: string | null;
  uid: string;
}

export interface FilterState {
  platformFilter: string;
  statusFilter: string;
  startDate: string;
  endDate: string;
  minLikes: string;
  jobIdFilter: string;
  liveFilter: "all" | true | false;
  linkTypeNameFilter: string;
  minMaxCount: string;
  uidFilter: string;
}

export interface FilterProps {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  isExpanded: boolean;
  onToggle: () => void;
  onClear: () => void;
}

export interface JobTableHeaderProps {
  onSelectAll: (checked: boolean) => void;
  isAllSelected: boolean;
}

export interface JobTableRowProps {
  job: Job;
  isSelected: boolean;
  onSelect: (id: string, checked: boolean) => void;
  onDelete: (id: string) => void;
}

export interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  selectedCount: number;
  isLoading: boolean;
}
