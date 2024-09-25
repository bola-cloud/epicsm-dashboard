"use client";

import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import MultiSelect from "../FormElements/MultiSelect";
import SelectGroupOne from "../SelectGroup/SelectGroupOne";
import Select from "../common/Select";

function JobCreate() {
  const [isOptionSelected, setIsOptionSelected] = useState<boolean>(false);
  const [linkTypeNameData, setLinkTypeNameData] = useState<string[]>([""]);

  const [loading, setloading] = useState(false);
  const [formData, setFormData] = useState({
    link: "",
    platform: "Facebook",
    type: "",
    linkTypeName: "",
    maxCount: 0,
    finishDate: "",
  });

  const handleChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const isValidLink = (link: string): boolean => {
    const urlPattern = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+\/?)([\w-./?%&=]*)?$/;
    return urlPattern.test(link);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const { link, platform, finishDate } = formData;

    if (!link || !platform || !finishDate) {
      toast.error("Please fill all the required fields.");
      return;
    }

    if (isValidLink(link)) {
      try {
        setloading(true);
        const response = await axios.post(
          "http://localhost:3001/api/jobs",
          formData,
        );

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
    if (formData.type === "post") {
      setLinkTypeNameData(["Like", "Love", "Haha", "Wow", "Sad", "Angry"]);
    } else if (formData.type === "page/profile") {
      setLinkTypeNameData(["AddFriend", "FollowAccount"]);
    } else if (formData.type === "group") {
      setLinkTypeNameData(["JoinGroup"]);
    } else {
      setLinkTypeNameData([""]);
    }
  }, [formData.type]);

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
            data={["Facebook"]}
            selectedOption={formData.platform}
            setSelectedOption={(value: any) =>
              setFormData((prevData) => ({ ...prevData, platform: value }))
            }
            isOptionSelected={isOptionSelected}
            setIsOptionSelected={setIsOptionSelected}
            required
          />

          <Select
            label="Type"
            data={["post", "page/profile", "group"]}
            selectedOption={formData.type}
            setSelectedOption={(value: any) =>
              setFormData((prevData) => ({ ...prevData, type: value }))
            }
            isOptionSelected={isOptionSelected}
            setIsOptionSelected={setIsOptionSelected}
            required
          />

          <Select
            label="Objective"
            data={linkTypeNameData}
            selectedOption={formData.linkTypeName}
            setSelectedOption={(value: any) =>
              setFormData((prevData) => ({ ...prevData, linkTypeName: value }))
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

          <div className="mb-4.5">
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
          </div>

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
