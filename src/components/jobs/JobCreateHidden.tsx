"use client";

import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import Select from "../common/Select";
import { getJwtFromLocalStorage } from "@/utils/localStorage";
import API from "@/utils/API";
import countryCodes from "@/utils/countryCodes";

const headers = {
  Authorization: `JWT ${getJwtFromLocalStorage()}`,
  "Content-Type": "application/json",
};

const PLATFORM_OPTIONS = ["Facebook", "Instagram"];
const FACEBOOK_TYPES = ["post", "page/profile", "group"];
const FACEBOOK_POST_OBJECTIVES = [
  "Comment",
  "Like",
  "Love",
  "Care",
  "Haha",
  "Wow",
  "Sad",
  "Angry",
];
const FACEBOOK_PROFILE_OBJECTIVES = ["AddFriend", "FollowAccount", "LikePage"];
const FACEBOOK_GROUP_OBJECTIVES = ["JoinGroup"];
const INSTAGRAM_OBJECTIVES = [
  "InstaLike",
  "InstaFollowAccount",
  "InstaComment",
];

type FormData = {
  link: string;
  platform: string;
  type: string;
  linkTypeName: string;
  maxCount: number;
  country: string;
  isVip: boolean;
};

const initialFormData: FormData = {
  link: "",
  platform: "Facebook",
  type: "",
  linkTypeName: "",
  maxCount: 0,
  country: "all",
  isVip: false,
};

const isCommentObjective = (objective: string) =>
  typeof objective === "string" &&
  objective.trim().toLowerCase().includes("comment");

function JobCreateHidden() {
  const [isOptionSelected, setIsOptionSelected] = useState<boolean>(false);
  const [linkTypeNameData, setLinkTypeNameData] = useState<string[]>([""]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [commentsInput, setCommentsInput] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const inputValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "maxCount" ? Number(inputValue) : (inputValue as string | any),
    }));
  };

  const commentList = useMemo(() => {
    if (!isCommentObjective(formData.linkTypeName)) {
      return [];
    }

    return commentsInput
      .split("\n")
      .map((comment) => comment.trim())
      .filter((comment) => comment.length > 0);
  }, [commentsInput, formData.linkTypeName]);

  useEffect(() => {
    if (formData.platform === "Facebook") {
      let objectives: string[] = [];

      if (formData.type === "post") {
        objectives = FACEBOOK_POST_OBJECTIVES;
      } else if (formData.type === "page/profile") {
        objectives = FACEBOOK_PROFILE_OBJECTIVES;
      } else if (formData.type === "group") {
        objectives = FACEBOOK_GROUP_OBJECTIVES;
      }

      setLinkTypeNameData(objectives);

      if (!objectives.includes(formData.linkTypeName)) {
        const nextObjective = objectives.length > 0 ? objectives[0] : "";
        if (formData.linkTypeName !== nextObjective) {
          setFormData((prev) => ({
            ...prev,
            linkTypeName: nextObjective,
          }));
        }
      }
    } else if (formData.platform === "Instagram") {
      setLinkTypeNameData(INSTAGRAM_OBJECTIVES);

      if (!INSTAGRAM_OBJECTIVES.includes(formData.linkTypeName)) {
        setFormData((prev) => ({
          ...prev,
          linkTypeName: INSTAGRAM_OBJECTIVES[0],
          type: "post",
        }));
      } else if (formData.type !== "post") {
        setFormData((prev) => ({
          ...prev,
          type: "post",
        }));
      }
    }
  }, [formData.platform, formData.type, formData.linkTypeName]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { link, platform, linkTypeName } = formData;

    if (!link || !platform || !linkTypeName) {
      toast.error("Please fill all the required fields.");
      return;
    }

    if (isCommentObjective(linkTypeName) && commentList.length === 0) {
      toast.error("Please provide at least one comment.");
      return;
    }

    const urlPattern =
      /^(https?:\/\/)?([\w-]+(\.[\w-]+)+\/?)([\w\-./?%&=]*)?$/i;
    const isValidLink = urlPattern.test(link);

    if (!isValidLink) {
      toast.error("Invalid job link. Please enter a valid URL.");
      return;
    }

    const payload = {
      ...formData,
      maxCount: Number(formData.maxCount) || 0,
      comments: isCommentObjective(linkTypeName) ? commentList : [],
    };

    try {
      setLoading(true);
      const response = await API.post("/api/v3/jobs", payload, { headers });

      if (response.status === 201) {
        toast.success("Job added");
        setFormData(initialFormData);
        setCommentsInput("");
      }
    } catch (error: any) {
      console.error("Error adding job:", error?.response?.data || error);
      toast.error("Failed to add job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
        <h3 className="font-medium text-black dark:text-white">
          Hidden Job Creation
        </h3>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="p-6.5">
          <div className="mb-4.5">
            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
              Link
            </label>
            <input
              type="text"
              name="link"
              value={formData.link}
              onChange={handleChange}
              placeholder="Enter the job link"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              required
            />
          </div>

          <Select
            label="Platform"
            data={PLATFORM_OPTIONS}
            selectedOption={formData.platform}
          setSelectedOption={(value: string) =>
              setFormData((prev) => ({
                ...prev,
                platform: value,
                type: value === "Facebook" ? "" : "post",
                linkTypeName: "",
              }))
            }
            isOptionSelected={isOptionSelected}
            setIsOptionSelected={setIsOptionSelected}
            required
          />

          {formData.platform === "Facebook" && (
            <Select
              label="Type"
              data={FACEBOOK_TYPES}
              selectedOption={formData.type}
              setSelectedOption={(value: string) =>
                setFormData((prev) => ({
                  ...prev,
                  type: value,
                  linkTypeName: "",
                }))
              }
              isOptionSelected={isOptionSelected}
              setIsOptionSelected={setIsOptionSelected}
              required
            />
          )}

          <Select
            label="Objective"
            data={linkTypeNameData}
            selectedOption={formData.linkTypeName}
            setSelectedOption={(value: string) =>
              setFormData((prev) => ({
                ...prev,
                linkTypeName: value,
              }))
            }
            isOptionSelected={isOptionSelected}
            setIsOptionSelected={setIsOptionSelected}
            required
          />

          {isCommentObjective(formData.linkTypeName) && (
            <div className="mb-4.5">
              <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                Comments (one per line)
              </label>
              <textarea
                name="comments"
                value={commentsInput}
                onChange={(e) => setCommentsInput(e.target.value)}
                placeholder="Enter one comment per line"
                className="min-h-[120px] w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
            </div>
          )}

          <Select
            label="Country"
            data={countryCodes}
            selectedOption={formData.country}
            setSelectedOption={(value: string) =>
              setFormData((prev) => ({ ...prev, country: value }))
            }
            isOptionSelected={isOptionSelected}
            setIsOptionSelected={setIsOptionSelected}
            required
          />

          <div className="mb-4.5">
            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
              Max count
            </label>
            <input
              type="number"
              name="maxCount"
              value={formData.maxCount}
              onChange={handleChange}
              placeholder="Enter the max count"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              required
              min={0}
              onWheel={(e) => e.currentTarget.blur()}
            />
          </div>

          <div className="mb-4.5 flex items-center">
            <label className="flex cursor-pointer select-none items-center">
              <div className="relative">
                <input
                  type="checkbox"
                  name="isVip"
                  checked={formData.isVip}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className="block h-8 w-14 rounded-full bg-[#E5E7EB] dark:bg-form-strokedark"></div>
                <div
                  className={`absolute left-1 top-1 h-6 w-6 rounded-full bg-white transition ${
                    formData.isVip && "!right-1 !translate-x-full !bg-primary"
                  }`}
                ></div>
              </div>
              <span className="ml-3 text-sm font-medium text-black dark:text-white">
                VIP
              </span>
            </label>
          </div>

          <button
            disabled={loading}
            className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90 disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add Job"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default JobCreateHidden;
