"use client";

import axios from "axios";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import MultiSelect from "../FormElements/MultiSelect";

function JobCreate() {
  const [loading, setloading] = useState(false);
  const [formData, setFormData] = useState({
    link: "",
    platform: "Facebook",
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

          <div className="mb-4.5">
            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
              Platform
            </label>

            <select
              name="platform"
              id="platform"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              onChange={handleChange}
              value={formData.platform}
              required
            >
              <option value="">Select platform</option>
              <option value="Facebook">Facebook</option>
            </select>
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
