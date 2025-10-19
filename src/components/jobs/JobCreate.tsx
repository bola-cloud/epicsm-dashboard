"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import Select from "../common/Select";
import { getJwtFromLocalStorage } from "@/utils/localStorage";
import countryCodes from "@/utils/countryCodes";
import API from "@/utils/API";

const headers = {
  Authorization: `JWT ${getJwtFromLocalStorage()}`,
  "Content-Type": "application/json",
};

const PLATFORM_OPTIONS = ["Facebook", "Instagram"] as const;
const FACEBOOK_TYPES = ["post", "page/profile", "group"] as const;
const FACEBOOK_POST_OBJECTIVES = [
  "Like",
  "Love",
  "Care",
  "Haha",
  "Wow",
  "Sad",
  "Angry",
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

function JobCreate() {
  const [isOptionSelected, setIsOptionSelected] = useState<boolean>(false);
  const [linkTypeNameData, setLinkTypeNameData] = useState<string[]>([""]);

  const [loading, setloading] = useState(false);
  const [formData, setFormData] = useState({
    link: "",
    platform: "Facebook" as PlatformOption,
    type: "" as FacebookType,
    linkTypeName: "",
    maxCount: 0,
    finishDate: "",
    country: "all",
    isVip: false,
  });

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    const inputValue = type === "checkbox" ? checked : value;
    setFormData({
      ...formData,
      [name]: inputValue,
    });
  };

  const isValidLink = (link: string): boolean => {
    const urlPattern = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+\/?)([\w-./?%&=]*)?$/;
    return urlPattern.test(link);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const { link, platform } = formData;

    if (!link || !platform) {
      toast.error("Please fill all the required fields.");
      return;
    }

    if (isValidLink(link)) {
      try {
        setloading(true);
        const response = await API.post("/api/v3/jobs", formData, { headers });

        if (response.status === 201) {
          toast.success("Job added");
          console.log("Job added:", response.data);
          setFormData({
            link: "",
            platform: "Facebook",
            finishDate: "",
            linkTypeName: "",
            maxCount: 0,
            type: "",
            country: "all",
            isVip: false,
          });
        }
      } catch (error: any) {
        console.error("Error adding job:", error.response.data);
      } finally {
        setloading(false);
      }
    } else {
      toast.error("Invalid job link. Please enter a valid URL.");
    }
  };

  useEffect(() => {
    if (formData.platform === "Facebook") {
      let objectives: readonly string[] = [""];

      if (formData.type === "post") {
        objectives = FACEBOOK_POST_OBJECTIVES;
      } else if (formData.type === "page/profile") {
        objectives = FACEBOOK_PROFILE_OBJECTIVES;
      } else if (formData.type === "group") {
        objectives = FACEBOOK_GROUP_OBJECTIVES;
      }

      setLinkTypeNameData(objectives.slice());

      if (!objectives.includes(formData.linkTypeName)) {
        setFormData((prev) => ({
          ...prev,
          linkTypeName: objectives.length ? objectives[0] : "",
        }));
      }
    } else if (formData.platform === "Instagram") {
      setLinkTypeNameData(INSTAGRAM_OBJECTIVES.slice());

      if (!INSTAGRAM_OBJECTIVES.includes(formData.linkTypeName)) {
        setFormData((prev) => ({
          ...prev,
          type: "post",
          linkTypeName: INSTAGRAM_OBJECTIVES[0],
        }));
      }
    }
  }, [formData.platform, formData.type, formData.linkTypeName]);

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
        <h3 className="font-medium text-black dark:text-white">Add Job Form</h3>
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
            data={Array.from(PLATFORM_OPTIONS)}
            selectedOption={formData.platform}
            setSelectedOption={(value: string) =>
              setFormData((prevData) => ({
                ...prevData,
                platform: value as PlatformOption,
                type:
                  value === "Facebook"
                    ? prevData.type
                    : ("post" as FacebookType),
                linkTypeName:
                  value === "Facebook"
                    ? ""
                    : INSTAGRAM_OBJECTIVES[0],
              }))
            }
            isOptionSelected={isOptionSelected}
            setIsOptionSelected={setIsOptionSelected}
            required
          />

          {formData.platform === "Facebook" && (
            <Select
              label="Type"
              data={Array.from(FACEBOOK_TYPES)}
              selectedOption={formData.type}
              setSelectedOption={(value: string) =>
                setFormData((prevData) => ({
                  ...prevData,
                  type: value as FacebookType,
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
              setFormData((prevData) => ({
                ...prevData,
                linkTypeName: value,
              }))
            }
            isOptionSelected={isOptionSelected}
            setIsOptionSelected={setIsOptionSelected}
            required
          />

          <Select
            label="Country"
            data={countryCodes}
            selectedOption={formData.country}
            setSelectedOption={(value: any) =>
              setFormData((prevData) => ({ ...prevData, country: value }))
            }
            isOptionSelected={isOptionSelected}
            setIsOptionSelected={setIsOptionSelected}
            required
          />

          <div className="mb-4.5">
            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
              Reaction count
            </label>
            <input
              type="number"
              name="maxCount"
              value={formData.maxCount}
              onChange={handleChange}
              placeholder="Enter the reaction count"
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

          {/* <div className="mb-4.5">
            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
              Finish Date
            </label>
            <input
              type="datetime-local"
              name="finishDate"
              value={formData.finishDate}
              onChange={handleChange}
              className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              required
              min={new Date().toISOString().slice(0, 16)}
            />
          </div> */}

          <button
            disabled={loading}
            className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90 disabled:opacity-50"
          >
            Add Job
          </button>
        </div>
      </form>
    </div>
  );
}

export default JobCreate;
