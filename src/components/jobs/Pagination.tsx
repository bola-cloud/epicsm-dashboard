import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  showItemsPerPage?: boolean;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  showItemsPerPage = true,
  className = "",
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pageNumbers: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    pageNumbers.push(1);

    const leftBound = Math.max(2, currentPage - 1);
    const rightBound = Math.min(totalPages - 1, currentPage + 1);

    if (leftBound > 2) {
      pageNumbers.push("...");
    }

    for (let i = leftBound; i <= rightBound; i++) {
      pageNumbers.push(i);
    }

    if (rightBound < totalPages - 1) {
      pageNumbers.push("...");
    }

    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  return (
    <div
      className={`flex flex-col items-center gap-4 sm:flex-row sm:justify-between ${className}`}
    >
      {showItemsPerPage && (
        <div className="text-gray-700 dark:text-gray-400 text-sm">
          Showing <span className="font-medium">{startItem}</span> to{" "}
          <span className="font-medium">{endItem}</span> of{" "}
          <span className="font-medium">{totalItems}</span> results
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="border-gray-300 text-gray-500 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 inline-flex h-8 items-center justify-center rounded-lg border bg-white px-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>

        <div className="flex items-center gap-2">
          {getPageNumbers().map((pageNum, index) => (
            <React.Fragment key={index}>
              {pageNum === "..." ? (
                <span className="text-gray-500 dark:text-gray-400 px-2">
                  ...
                </span>
              ) : (
                <button
                  onClick={() => onPageChange(Number(pageNum))}
                  disabled={currentPage === pageNum}
                  className={`inline-flex h-8 min-w-[32px] items-center justify-center rounded-lg text-sm font-medium ${
                    currentPage === pageNum
                      ? "bg-primary text-white"
                      : "border-gray-300 text-gray-500 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 border bg-white"
                  }`}
                >
                  {pageNum}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="border-gray-300 text-gray-500 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 inline-flex h-8 items-center justify-center rounded-lg border bg-white px-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
