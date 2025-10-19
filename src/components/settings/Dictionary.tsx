"use client";

import API from "@/utils/API";
import { getJwtFromLocalStorage } from "@/utils/localStorage";
import { AxiosError } from "axios";
import React, { useState, useEffect } from "react";
import { Trash2, PencilLine } from "lucide-react";

interface DictionaryItem {
  key: string;
  values: string[];
}

interface ApiResponse {
  dictionary: Record<string, string[]>;
}

interface Message {
  type: "error" | "success";
  text: string;
}

interface TagsInputProps {
  tags: string[];
  setTags: (tags: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

const TagsInput: React.FC<TagsInputProps> = ({
  tags,
  setTags,
  placeholder,
  disabled,
}) => {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const addTag = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !tags.includes(trimmedValue)) {
      setTags([...tags, trimmedValue]);
      setInputValue("");
    }
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleBlur = () => {
    if (inputValue.trim()) {
      addTag();
    }
  };

  return (
    <div className="border-gray-300 flex flex-wrap items-center gap-2 rounded border bg-white p-2">
      {tags.map((tag, index) => (
        <div
          key={index}
          className="flex items-center rounded bg-blue-100 px-2 py-1 text-blue-800"
        >
          <span>{tag}</span>
          {!disabled && (
            <button
              type="button"
              className="ml-1 text-blue-600 hover:text-blue-800"
              onClick={() => removeTag(index)}
            >
              ×
            </button>
          )}
        </div>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={tags.length === 0 ? placeholder : ""}
        className="min-w-[120px] flex-1 border-none bg-transparent outline-none"
        disabled={disabled}
      />
    </div>
  );
};

const DictionaryManager = () => {
  const [dictionary, setDictionary] = useState<DictionaryItem[]>([]);
  const [newKey, setNewKey] = useState("");
  const [newValueTags, setNewValueTags] = useState<string[]>([]);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingValueTags, setEditingValueTags] = useState<string[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [keyToDelete, setKeyToDelete] = useState<string | null>(null);

  const headers = {
    Authorization: `JWT ${getJwtFromLocalStorage()}`,
    "Content-Type": "application/json",
  };

  useEffect(() => {
    fetchDictionary();
  }, []);

  const handleError = (error: unknown) => {
    const errorMessage =
      error instanceof AxiosError
        ? error.response?.data?.message || error.message
        : "An unexpected error occurred";
    setMessage({ type: "error", text: errorMessage });
    setTimeout(() => setMessage(null), 5000);
  };

  const fetchDictionary = async () => {
    setLoading(true);
    try {
      const res = await API.get<ApiResponse>("/api/v3/settings/dictionary", {
        headers,
      });

      const dictionaryArray: DictionaryItem[] = Object.entries(
        res.data.dictionary,
      ).map(([key, values]) => ({ key, values }));

      setDictionary(dictionaryArray);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim() || newValueTags.length === 0 || loading) return;

    setLoading(true);
    try {
      await API.post(
        "/api/v3/settings/dictionary",
        { key: newKey.trim(), values: newValueTags },
        { headers },
      );

      await fetchDictionary();
      setNewKey("");
      setNewValueTags([]);
      setMessage({
        type: "success",
        text: "Dictionary entry added successfully",
      });
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (key: string) => {
    if (editingValueTags.length === 0 || loading) return;

    setLoading(true);
    try {
      await API.put(
        "/api/v3/settings/dictionary",
        { key, values: editingValueTags },
        { headers },
      );

      await fetchDictionary();
      setEditingKey(null);
      setEditingValueTags([]);
      setMessage({
        type: "success",
        text: "Dictionary entry updated successfully",
      });
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!keyToDelete) return;

    setLoading(true);
    try {
      await API.delete(`/api/v3/settings/dictionary/${keyToDelete}`, {
        headers,
      });
      await fetchDictionary();
      setMessage({
        type: "success",
        text: "Dictionary entry deleted successfully",
      });
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setKeyToDelete(null);
    }
  };

  const startEdit = (item: DictionaryItem) => {
    setEditingKey(item.key);
    setEditingValueTags([...item.values]);
  };

  const cancelEdit = () => {
    setEditingKey(null);
    setEditingValueTags([]);
  };

  const toggleExpand = (key: string) => {
    const newExpandedKeys = new Set(expandedKeys);
    if (newExpandedKeys.has(key)) {
      newExpandedKeys.delete(key);
    } else {
      newExpandedKeys.add(key);
    }
    setExpandedKeys(newExpandedKeys);
  };

  const confirmDelete = (key: string) => {
    setKeyToDelete(key);
    setShowDeleteModal(true);
  };

  return (
    <div className="p-8">
      <h2 className="mb-6 text-2xl font-semibold">Dictionary</h2>

      {message && (
        <div
          className={`mb-6 rounded p-4 ${
            message.type === "error"
              ? "bg-red-100 text-red-700 border-red-300 border"
              : "border border-green-300 bg-green-100 text-green-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <form
        onSubmit={handleAdd}
        className="mb-8 flex flex-wrap items-center gap-3"
      >
        <div className="w-full sm:w-48">
          <input
            type="text"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            placeholder="Key"
            className="border-gray-300 w-full rounded border p-2"
            disabled={loading}
          />
        </div>
        <div className="w-full sm:flex-1">
          <TagsInput
            tags={newValueTags}
            setTags={setNewValueTags}
            placeholder="Add values and press Enter"
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !newKey.trim() || newValueTags.length === 0}
          className={`rounded p-2 text-white ${
            loading || !newKey.trim() || newValueTags.length === 0
              ? "cursor-not-allowed bg-blue-300"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          Add
        </button>
      </form>

      {loading && dictionary.length === 0 ? (
        <div className="flex h-32 items-center justify-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-t-4 border-blue-500"></div>
        </div>
      ) : (
        <div className="divide-y rounded bg-white shadow">
          {dictionary.length === 0 ? (
            <div className="text-gray-500 p-6 text-center">
              No dictionary entries found. Add a new entry to get started.
            </div>
          ) : (
            dictionary.map((item) => (
              <div key={item.key} className="hover:bg-gray-50 p-4">
                {editingKey === item.key ? (
                  <div className="space-y-3">
                    <div className="font-medium">{item.key}</div>
                    <TagsInput
                      tags={editingValueTags}
                      setTags={setEditingValueTags}
                      placeholder="Add values and press Enter"
                      disabled={loading}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdate(item.key)}
                        disabled={loading || editingValueTags.length === 0}
                        className={`rounded p-2 text-white ${
                          loading || editingValueTags.length === 0
                            ? "cursor-not-allowed bg-blue-300"
                            : "bg-blue-600 hover:bg-blue-700"
                        }`}
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        disabled={loading}
                        className="bg-gray-200 hover:bg-gray-300 rounded p-2"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between">
                      <div
                        className="flex cursor-pointer items-center"
                        onClick={() => toggleExpand(item.key)}
                      >
                        <span className="mr-2">
                          {expandedKeys.has(item.key) ? "▼" : "►"}
                        </span>
                        <span className="font-medium">{item.key}</span>
                        <span className="text-gray-500 ml-2 text-xs">
                          ({item.values.length} items)
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(item)}
                          disabled={loading}
                          className="bg-gray-100 hover:bg-gray-200 rounded p-1.5"
                          title="Edit"
                        >
                          <PencilLine className="size-4" />
                        </button>
                        <button
                          onClick={() => confirmDelete(item.key)}
                          disabled={loading}
                          className="bg-red-100 hover:bg-red-200 text-red-600 rounded p-1.5"
                          title="Delete"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>

                    {expandedKeys.has(item.key) && (
                      <div className="text-gray-600 ml-6 mt-2 text-sm">
                        <ul className="list-disc pl-5">
                          {item.values.map((value, idx) => (
                            <li key={idx}>{value}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">
              Delete Dictionary
            </h3>
            <p className="mb-6">
              Are you sure you want to delete the entry "{keyToDelete}"? This
              action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray hover:bg-gray-2 transition-all duration-300 rounded px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="bg-red hover:bg-red/80 transition-all duration-300 rounded px-4 py-2 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DictionaryManager;
