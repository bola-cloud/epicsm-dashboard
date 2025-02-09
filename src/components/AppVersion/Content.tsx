"use client";

import React, {
  useState,
  useEffect,
  ChangeEvent,
  FormEvent,
  useRef,
} from "react";
import axios, { AxiosError } from "axios";
import { Upload, CheckCircle } from "lucide-react";
import { getJwtFromLocalStorage } from "@/utils/localStorage";

interface VersionInfo {
  version: string;
  releaseDate: string;
  releaseNotes: string;
}

interface FormData {
  version: string;
  releaseNotes: string;
  apk: File | null;
}

interface UploadStatus {
  type: "success" | "error";
  message: string;
}

const headers = {
  Authorization: `JWT ${getJwtFromLocalStorage()}`,
  "Content-Type": "application/json",
};

const APKManagement: React.FC = () => {
  const [currentVersion, setCurrentVersion] = useState<VersionInfo | null>(
    null,
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus | null>(null);
  const [formData, setFormData] = useState<FormData>({
    version: "",
    releaseNotes: "",
    apk: null,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchCurrentVersion();
  }, []);

  const fetchCurrentVersion = async (): Promise<void> => {
    try {
      const response = await axios.get<VersionInfo>(
        "https://api.epicsm.goviral.ma/api/v2/check-update",
        { headers },
      );
      setCurrentVersion(response.data);
    } catch (error) {
      console.error("Error fetching version:", error);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setUploadStatus(null);

    const submitData = new FormData();
    submitData.append("version", formData.version);
    submitData.append("releaseNotes", formData.releaseNotes);
    if (formData.apk) {
      submitData.append("apk", formData.apk);
    }

    try {
      await axios.post(
        "https://api.epicsm.goviral.ma/api/v2/upload-apk",
        submitData,
        {
          headers: {
            ...headers,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      setUploadStatus({
        type: "success",
        message: "APK uploaded successfully!",
      });
      fetchCurrentVersion();
      setFormData({ version: "", releaseNotes: "", apk: null });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      setUploadStatus({
        type: "error",
        message: axiosError.response?.data?.message || "Error uploading APK",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, apk: file }));
    setFile(file);
  };

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="space-y-6">
        {/* Current Version Card */}
        <div className="overflow-hidden rounded-lg bg-white shadow-md">
          <div className="border-b border-slate-300 p-4">
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Current Version Info
            </h2>
          </div>
          <div className="p-6">
            {currentVersion ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500 text-sm">Version</p>
                    <p className="text-lg font-semibold">
                      {currentVersion.version}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Release Date</p>
                    <p className="text-lg">
                      {new Date(
                        currentVersion.releaseDate,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Release Notes</p>
                  <p className="text-gray-700 mt-1 whitespace-pre-wrap">
                    {currentVersion.releaseNotes}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No version information available</p>
            )}
          </div>
        </div>

        {/* Upload Form Card */}
        <div className="overflow-hidden rounded-lg bg-white shadow-md">
          <div className="border-b border-slate-300 p-4">
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <Upload className="h-5 w-5 text-blue-500" />
              Upload New Version
            </h2>
          </div>
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-gray-700 mb-1 block text-sm font-medium">
                  Version Number
                </label>
                <input
                  type="text"
                  value={formData.version}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev) => ({
                      ...prev,
                      version: e.target.value,
                    }))
                  }
                  placeholder="e.g., 1.0.0"
                  required
                  className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-gray-700 mb-1 block text-sm font-medium">
                  Release Notes
                </label>
                <textarea
                  value={formData.releaseNotes}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                    setFormData((prev) => ({
                      ...prev,
                      releaseNotes: e.target.value,
                    }))
                  }
                  placeholder="What's new in this version?"
                  required
                  className="min-h-32 w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-gray-700 mb-1 block text-sm font-medium">
                  APK File
                </label>
                <div className="mt-1 flex items-center gap-4">
                  <label className="group relative flex-1 cursor-pointer">
                    <div className="flex min-h-[42px] items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-2 hover:bg-slate-50">
                      <div className="flex items-center gap-2">
                        <Upload className="h-5 w-5 text-slate-400 group-hover:text-slate-500" />
                        <span className="text-sm text-slate-600 group-hover:text-slate-700">
                          {file ? file.name : "Choose APK file"}
                        </span>
                      </div>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileChange}
                      accept=".apk"
                      required
                      className="absolute inset-0 cursor-pointer opacity-0"
                    />
                  </label>
                  {file && (
                    <button
                      type="button"
                      onClick={() => {
                        setFile(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                        setFormData((prev) => ({ ...prev, apk: null }));
                      }}
                      className="flex h-[42px] items-center rounded-md border border-slate-300 px-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-700"
                    >
                      Clear
                    </button>
                  )}
                </div>
                {file && (
                  <p className="mt-2 text-sm text-slate-500">
                    Selected: {file.name} (
                    {(file.size / (1024 * 1024)).toFixed(2)} MB)
                  </p>
                )}
              </div>

              {uploadStatus && (
                <div
                  className={`rounded-md p-4 ${
                    uploadStatus.type === "error"
                      ? "bg-red-50 text-red-700 border-red-200 border"
                      : "border border-green-200 bg-green-50 text-green-700"
                  }`}
                >
                  <p>{uploadStatus.message}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full rounded-md px-4 py-2 font-medium text-white ${
                  loading
                    ? "cursor-not-allowed bg-blue-400"
                    : "bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                }`}
              >
                {loading ? "Uploading..." : "Upload New Version"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APKManagement;
