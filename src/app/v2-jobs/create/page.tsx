"use client";

import { useState, useEffect } from "react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

const PLATFORM_OPTIONS = ["Facebook", "Instagram"] as const;
const FACEBOOK_TYPES = ["post", "page/profile", "group"] as const;

const FACEBOOK_POST_OBJECTIVES = [
  "Like",
  "Love",
  "Care",
  "Haha",
  "Wow",
  "Sad",
  "Angry"
] as const;

const FACEBOOK_PROFILE_OBJECTIVES = [
  "AddFriend",
  "FollowAccount",
  "LikePage",
] as const;

const FACEBOOK_GROUP_OBJECTIVES = ["JoinGroup"] as const;
const INSTAGRAM_OBJECTIVES = ["InstaLike", "InstaFollowAccount"];

type PlatformOption = (typeof PLATFORM_OPTIONS)[number];
type FacebookType = (typeof FACEBOOK_TYPES)[number] | "";

const CreateJobV2 = () => {
  const [targetLink, setTargetLink] = useState("");
  const [platform, setPlatform] = useState<PlatformOption>("Facebook");
  const [type, setType] = useState<FacebookType>("post");
  const [linkTypeName, setLinkTypeName] = useState<string>("Like");
  const [maxCount, setMaxCount] = useState(100);
  const [isVip, setIsVip] = useState(false);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [availableObjectives, setAvailableObjectives] = useState<readonly string[]>(FACEBOOK_POST_OBJECTIVES);

  useEffect(() => {
    if (platform === "Facebook") {
      let objectives: readonly string[] = FACEBOOK_POST_OBJECTIVES;
      if (type === "post") objectives = FACEBOOK_POST_OBJECTIVES;
      else if (type === "page/profile") objectives = FACEBOOK_PROFILE_OBJECTIVES;
      else if (type === "group") objectives = FACEBOOK_GROUP_OBJECTIVES;

      setAvailableObjectives(objectives);
      if (!objectives.includes(linkTypeName as any)) {
        setLinkTypeName(objectives[0]);
      }
    } else {
      setAvailableObjectives(INSTAGRAM_OBJECTIVES);
      if (!INSTAGRAM_OBJECTIVES.includes(linkTypeName as any)) {
        setLinkTypeName(INSTAGRAM_OBJECTIVES[0]);
      }
    }
  }, [platform, type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus("");

    // Derive internal actionType based on the selected objective
    let actionType = "like";
    const lowerType = linkTypeName.toLowerCase();
    
    if (lowerType.includes("follow") || lowerType.includes("friend")) actionType = "follow";
    else if (lowerType.includes("comment")) actionType = "comment";
    else if (lowerType.includes("view")) actionType = "view";
    else if (lowerType.includes("share")) actionType = "share";

    const comments: string[] = [];

    try {
      const res = await fetch("https://api.epicsm.goviral.ma/api/v4/admin/v2/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          targetLink, 
          platform: platform.toLowerCase(), 
          actionType, 
          type: platform === "Facebook" ? type : "post",
          linkTypeName,
          maxCount, 
          isVip,
          comments: []
        }),
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
                onChange={(e) => setPlatform(e.target.value as PlatformOption)}
                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              >
                {PLATFORM_OPTIONS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {platform === "Facebook" && (
              <div className="mb-4.5">
                <label className="mb-2.5 block text-black dark:text-white">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as FacebookType)}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                >
                  {FACEBOOK_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="mb-4.5">
              <label className="mb-2.5 block text-black dark:text-white">Objective / Action</label>
              <select
                value={linkTypeName}
                onChange={(e) => setLinkTypeName(e.target.value)}
                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              >
                {availableObjectives.map((obj) => (
                  <option key={obj} value={obj}>{obj}</option>
                ))}
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
              <label className="mb-2.5 block text-black dark:text-white">Max Count (Target Number)</label>
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
