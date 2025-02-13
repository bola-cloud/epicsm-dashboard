"use client";

import API from "@/utils/API";
import { getJwtFromLocalStorage } from "@/utils/localStorage";
import { AxiosError } from "axios";
import React, { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, PencilLine, Save, X, Loader } from "lucide-react";

interface ExecutionMethod {
  _id: string;
  name: string;
}

interface ApiResponse {
  executionMethods: ExecutionMethod[];
}

interface Message {
  type: "error" | "success";
  text: string;
}

interface EditingMethod {
  id: string;
  name: string;
}

const headers = {
  Authorization: `JWT ${getJwtFromLocalStorage()}`,
  "Content-Type": "application/json",
};

const ExecutionMethodsManager: React.FC = () => {
  const [methods, setMethods] = useState<ExecutionMethod[]>([]);
  const [newMethod, setNewMethod] = useState("");
  const [editingMethod, setEditingMethod] = useState<EditingMethod | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);
  const [methodToDelete, setMethodToDelete] = useState<string | null>(null);
  const [refrech, setrefrech] = useState(false);

  useEffect(() => {
    fetchMethods();
  }, [refrech]);

  const handleError = (error: unknown) => {
    const errorMessage =
      error instanceof AxiosError
        ? error.response?.data?.message || error.message
        : "An unexpected error occurred";
    setMessage({ type: "error", text: errorMessage });
  };

  const fetchMethods = async () => {
    try {
      const res = await API.get<ApiResponse>("/api/v3/settings/methods", {
        headers,
      });
      setMethods(res.data.executionMethods);
    } catch (error) {
      handleError(error);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMethod.trim() || loading) return;

    setLoading(true);
    try {
      const res = await API.post<ExecutionMethod>(
        "/api/v3/settings/methods",
        { name: newMethod.trim() },
        { headers },
      );
      setMethods([...methods, res.data]);
      setNewMethod("");
      setMessage({ type: "success", text: "Method added successfully" });
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id: string) => {
    if (!editingMethod?.name.trim() || loading) return;

    setLoading(true);
    try {
      const res = await API.put<ExecutionMethod>(
        `/api/v3/settings/methods/${id}`,
        { name: editingMethod.name.trim() },
        { headers },
      );
      setrefrech(!refrech);
      setEditingMethod(null);
      setMessage({ type: "success", text: "Method updated successfully" });
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      await API.delete(`/api/v3/settings/methods/${id}`, { headers });
      setrefrech(!refrech);
      setMessage({ type: "success", text: "Method deleted successfully" });
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
      setMethodToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader className="text-gray-500 h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  return (
    <div className="mx-auto space-y-8 p-8">
      <div className="flex items-center flex-col sm:flex-row justify-between">
        <h2 className="text-gray-900 text-2xl font-semibold">
          Execution Methods
        </h2>
        <form onSubmit={handleAdd} className="flex gap-3">
          <input
            type="text"
            value={newMethod}
            onChange={(e) => setNewMethod(e.target.value)}
            placeholder="Enter new method name"
            className="border-gray-300 w-64 rounded-lg border px-4 py-2 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !newMethod.trim()}
            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add Method
          </button>
        </form>
      </div>

      {message && (
        <div
          className={`mb-4 rounded-lg p-4 font-medium ${
            message.type === "error"
              ? "border border-[#FF0000] bg-[#ff00002c] text-[#FF0000]"
              : "border border-green-200 bg-green-50 text-green-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="divide-gray-200 border-gray-200 divide-y rounded-lg border bg-white shadow">
        {methods.map((method) => (
          <div
            key={method._id}
            className="hover:bg-gray-50 flex items-center justify-between p-4 transition-colors"
          >
            {editingMethod?.id === method._id ? (
              <input
                type="text"
                value={editingMethod.name}
                onChange={(e) =>
                  setEditingMethod({
                    id: method._id,
                    name: e.target.value,
                  })
                }
                className="border-gray-300 w-full rounded-lg border px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={loading}
              />
            ) : (
              <span className="text-gray-900 text-sm font-medium">
                {method.name}
              </span>
            )}

            <div className="flex items-center gap-2">
              {editingMethod?.id === method._id ? (
                <>
                  <button
                    onClick={() => handleEdit(method._id)}
                    disabled={loading}
                    className="ml-2 inline-flex items-center rounded-lg bg-blue-600 p-2 text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Save className="size-4" />
                  </button>
                  <button
                    onClick={() => setEditingMethod(null)}
                    disabled={loading}
                    className="hover:bg-gray-700 focus:ring-gray-500 inline-flex items-center rounded-lg bg-gray p-2 text-white shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <X className="size-4" color="red" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() =>
                      setEditingMethod({ id: method._id, name: method.name })
                    }
                    disabled={loading}
                    className="bg-gray-100 text-gray-600 hover:bg-gray-200 focus:ring-gray-500 inline-flex items-center rounded-lg p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <PencilLine className="size-4" />
                  </button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        disabled={loading}
                        className="bg-red-100 text-red-600 hover:bg-red-200 focus:ring-red-500 inline-flex items-center rounded-lg p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-white text-black">
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Delete Execution Method
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this execution method?
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="flex items-center gap-2">
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(method._id)}
                          className="text-red"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExecutionMethodsManager;
