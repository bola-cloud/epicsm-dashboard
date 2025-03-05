"use client";

import React from "react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { User } from "../../types/user";
import { useParams } from "next/navigation";
import { getJwtFromLocalStorage } from "@/utils/localStorage";
import API from "@/utils/API";

const headers = {
  Authorization: `JWT ${getJwtFromLocalStorage()}`,
  "Content-Type": "application/json",
};

function UserProfile() {
  const { id } = useParams();
  const [User, setUser] = useState<User | undefined>();
  const [ShowModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"dailyReward">("dailyReward");
  const [dailyRewards, setdailyRewards] = useState<number | null>(null);
  const [loading, setloading] = useState(false);
  const [refrech, setrefrech] = useState(false);
  const [isVipToggling, setIsVipToggling] = useState(false);

  async function getUser() {
    try {
      const res = await API.get(`/api/v3/users/firestore/${id}`, { headers });

      if (res.status === 200) {
        setUser(res.data);
      } else {
        console.error("No user found");
        toast.error("No user found");
      }
    } catch (error) {
      console.error("Failed to fetch user", error);
      toast.error("Failed to fetch user");
    }
  }

  useEffect(() => {
    getUser();
  }, [refrech]);

  const createdDate = User?.created
    ? new Date(
        User.created._seconds * 1000 +
          Math.floor(User.created._nanoseconds / 1000000),
      )
    : null;

  const LastSignin = User?.lastSignIn
    ? new Date(
        User.lastSignIn._seconds * 1000 +
          Math.floor(User.lastSignIn._nanoseconds / 1000000),
      )
    : null;

  async function UpdateDailyReward() {
    if (dailyRewards) {
      try {
        setloading(true);
        const res = await API.put(
          `/api/v3/users/firestore/updateReward/${User?.id}`,
          { dailyRewards },
          { headers },
        );
        if (res.status === 200) {
          toast.success(`Daily Reward updated`);
          setShowModal(false);
          setdailyRewards(null);
          setrefrech(!refrech);
        }
      } catch (error) {
        console.error("Failed to update daily Reward", error);
        toast.error("Failed to update daily Reward");
      } finally {
        setloading(false);
      }
    } else {
      toast.error("Please enter a valid value");
    }
  }

  async function toggleVipStatus(newStatus: boolean) {
    if (isVipToggling) return;
    
    try {
      setIsVipToggling(true);
      
      const res = await API.put(
        `/api/v3/users/firestore/updateVipStatus/${User?.id}`,
        { isVip: newStatus },
        { headers },
      );

      if (res.status === 200) {
        toast.success(`VIP status ${newStatus ? "enabled" : "disabled"}`);
        setrefrech(!refrech);
      }
    } catch (error) {
      console.error("Failed to update VIP status", error);
      toast.error("Failed to update VIP status");
    } finally {
      setIsVipToggling(false);
    }
  }

  const openModal = (type: "dailyReward") => {
    setModalType(type);
    setShowModal(true);
  };

  const handleVipToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStatus = e.target.checked;
    toggleVipStatus(newStatus);
  };

  return (
    <div className="overflow-hidden rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <style jsx>{`
        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 60px;
          height: 34px;
        }

        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: .4s;
          border-radius: 34px;
        }

        .slider:before {
          position: absolute;
          content: "";
          height: 26px;
          width: 26px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }

        input:checked + .slider {
          background-color: #3C50E0;
        }

        input:focus + .slider {
          box-shadow: 0 0 1px #3C50E0;
        }

        input:checked + .slider:before {
          transform: translateX(26px);
        }

        input:disabled + .slider {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
      
      <div className="relative z-20 h-35 md:h-65">
        <Image
          src={User?.photo || ""}
          alt="profile cover"
          className="h-full w-full rounded-tl-sm rounded-tr-sm object-cover object-center"
          width={970}
          height={260}
        />
      </div>

      <div className="px-4 pb-6 text-center lg:pb-8 xl:pb-11.5">
        <div className="relative z-30 mx-auto -mt-22 h-30 w-full max-w-30 rounded-full bg-white/20 p-1 backdrop-blur sm:h-44 sm:max-w-44 sm:p-3">
          <div className="relative h-full w-full drop-shadow-2">
            <Image
              src={User?.photo || ""}
              width={160}
              height={160}
              alt="profile"
              className="h-full w-full rounded-full object-cover"
            />
          </div>
        </div>
        <div className="mt-4">
          <h3 className="mb-1.5 text-2xl font-semibold text-black dark:text-white">
            {User?.name}
            {User?.isVip && (
              <span className="ml-2 inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                VIP
              </span>
            )}
          </h3>

          <table className="mt-5 w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="min-w-[150px] px-4 py-4 text-center font-medium text-black dark:text-white">
                  Field
                </th>
                <th className="min-w-[150px] px-4 py-4 text-center font-medium text-black dark:text-white">
                  Value
                </th>
                <th className="px-4 py-4 text-center font-medium text-black dark:text-white">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td className="px-4 py-4 font-medium text-black dark:text-white">
                  Coins
                </td>
                <td className="px-4 py-4 text-black dark:text-white">
                  {User?.coins}
                </td>
                <td className="px-4 py-4"></td>
              </tr>{" "}
              <tr>
                <td className="px-4 py-4 font-medium text-black dark:text-white">
                  UserID
                </td>
                <td className="truncate px-4 py-4 text-black dark:text-white">
                  {User?.id}
                </td>
                <td className="px-4 py-4"></td>
              </tr>
              <tr>
                <td className="px-4 py-4 font-medium text-black dark:text-white">
                  Balance
                </td>
                <td className="px-4 py-4 text-black dark:text-white">
                  {User?.dollars} $
                </td>
                <td className="px-4 py-4"></td>
              </tr>
              <tr>
                <td className="px-4 py-4 font-medium text-black dark:text-white">
                  Daily Reward
                </td>
                <td className="px-4 py-4 text-black dark:text-white">
                  {User?.dailyRewards}
                </td>
                <td className="px-4 py-4">
                  <button
                    className="rounded bg-primary px-3 py-1 font-medium text-gray hover:bg-opacity-90 disabled:opacity-50"
                    onClick={() => openModal("dailyReward")}
                  >
                    Update daily reward
                  </button>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-4 font-medium text-black dark:text-white">
                  VIP Status
                </td>
                <td className="px-4 py-4 text-black dark:text-white text-center">
                  <div>
                    {User?.isVip ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        Enabled
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-800 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
                        Disabled
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4 flex items-center justify-center">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={User?.isVip || false}
                      onChange={handleVipToggleChange}
                      disabled={isVipToggling}
                    />
                    <span className="slider"></span>
                  </label>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-4 font-medium text-black dark:text-white">
                  Email
                </td>
                <td className="px-4 py-4 text-black dark:text-white">
                  {User?.email}
                </td>
                <td className="px-4 py-4"></td>
              </tr>
              <tr>
                <td className="px-4 py-4 font-medium text-black dark:text-white">
                  Provider
                </td>
                <td className="px-4 py-4 text-black dark:text-white">
                  {User?.provider}
                </td>
                <td className="px-4 py-4"></td>
              </tr>
              <tr>
                <td className="px-4 py-4 font-medium text-black dark:text-white">
                  Created
                </td>
                <td className="px-4 py-4 text-black dark:text-white">
                  {createdDate ? createdDate.toLocaleString() : "N/A"}
                </td>
                <td className="px-4 py-4"></td>
              </tr>
              <tr>
                <td className="px-4 py-4 font-medium text-black dark:text-white">
                  Last Sign In
                </td>
                <td className="px-4 py-4 text-black dark:text-white">
                  {LastSignin ? LastSignin.toLocaleString() : "N/A"}
                </td>
                <td className="px-4 py-4"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {ShowModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-700 bg-opacity-50">
          <div className="rounded-lg bg-white p-6 text-center shadow-lg">
            <p className="mb-4 text-lg font-semibold">Update daily reward</p>

            <input
              type="number"
              name="maxCount"
              value={dailyRewards || ""}
              onChange={(e) => setdailyRewards(Number(e.target.value))}
              placeholder="0 $"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              min={0}
              onWheel={(e) => e.currentTarget.blur()}
            />

            <div className="mt-4 flex w-full items-center space-x-4">
              <button
                disabled={loading}
                className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90 disabled:opacity-50"
                onClick={UpdateDailyReward}
              >
                Update
              </button>
              <button
                disabled={loading}
                className="flex w-full justify-center rounded bg-slate-400 p-3 font-medium text-gray hover:bg-opacity-90 disabled:opacity-50"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserProfile;