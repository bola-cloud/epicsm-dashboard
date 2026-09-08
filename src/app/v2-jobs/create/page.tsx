"use client";

import { useState } from "react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

const CreateJobV2 = () => {
  const [targetLink, setTargetLink] = useState("");
  const [platform, setPlatform] = useState("facebook");
  const [actionType, setActionType] = useState("follow");
  const [maxCount, setMaxCount] = useState(100);
  const [isVip, setIsVip] = useState(false);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus("");
    try {
      // In production, the API URL might be dynamic or configured via env
      const res = await fetch("https://api.epicsm.goviral.ma/api/v4/admin/v2/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetLink, platform, actionType, maxCount, isVip }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success: Job created and is Pending ID Resolution in the background.");
        setTargetLink("");
      } else {
        setStatus(`error: ${data.message || "Failed to create job"}`);
      }
    } catch (err: any) {
      setStatus(`error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DefaultLayout>
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">
            Create V2 Job (Auto Resolver)
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Jobs created here will automatically resolve the Target ID in the background using the saved Admin cookies.
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6.5">
            {status && (
              <div className={`mb-4 p-4 rounded ${status.startsWith("error") ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                {status.replace(/^(error|success): /, "")}
              </div>
            )}

            <div className="mb-4.5">
              <label className="mb-2.5 block text-black dark:text-white">Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              >
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
              </select>
            </div>

            <div className="mb-4.5">
              <label className="mb-2.5 block text-black dark:text-white">Action Type</label>
              <select
                value={actionType}
                onChange={(e) => setActionType(e.target.value)}
                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              >
                <option value="follow">Follow</option>
                <option value="like">Like</option>
                <option value="comment">Comment</option>
              </select>
            </div>

            <div className="mb-4.5">
              <label className="mb-2.5 block text-black dark:text-white">Target Link (URL)</label>
              <input
                type="url"
                required
                value={targetLink}
                onChange={(e) => setTargetLink(e.target.value)}
                placeholder="e.g. https://www.facebook.com/watch/?v=12345"
                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
            </div>

            <div className="mb-4.5">
              <label className="mb-2.5 block text-black dark:text-white">Max Count</label>
              <input
                type="number"
                min={1}
                required
                value={maxCount}
                onChange={(e) => setMaxCount(parseInt(e.target.value))}
                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
            </div>

            <div className="mb-5.5 flex items-center">
              <input
                type="checkbox"
                id="isVip"
                checked={isVip}
                onChange={(e) => setIsVip(e.target.checked)}
                className="mr-3 h-5 w-5 rounded border-stroke"
              />
              <label htmlFor="isVip" className="text-black dark:text-white">
                VIP Job (High Priority)
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90 disabled:opacity-50"
            >
              {isLoading ? "Creating & Resolving..." : "Create V2 Job"}
            </button>
          </div>
        </form>
      </div>
    </DefaultLayout>
  );
};

export default CreateJobV2;
