import { DeleteModalProps } from '@/types/jobs';
import React from 'react';

export const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  onDelete,
  selectedCount,
  isLoading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-700 bg-opacity-50">
      <div className="rounded-lg bg-white p-6 text-center shadow-lg">
        <p className="mb-4 text-lg font-semibold">
          {selectedCount > 1
            ? `Are you sure you want to delete ${selectedCount} jobs?`
            : "Are you sure you want to delete this job?"}
        </p>
        <div className="flex w-full items-center space-x-4">
          <button
            disabled={isLoading}
            className="flex w-full justify-center rounded bg-red p-3 font-medium text-gray hover:bg-opacity-90 disabled:opacity-50"
            onClick={onDelete}
          >
            {isLoading ? "Deleting..." : "Delete"}
          </button>
          <button
            disabled={isLoading}
            className="flex w-full justify-center rounded bg-slate-400 p-3 font-medium text-gray hover:bg-opacity-90 disabled:opacity-50"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;