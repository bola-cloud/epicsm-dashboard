"use client";

import React from "react";
import Image from "next/image";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { User } from "../../types/user";
import { useParams } from "next/navigation";
import { Timestamp } from "firebase/firestore";

function UserProfile() {
  const { id } = useParams();
  const [User, setUser] = useState<User | undefined>();
  const [ShowModal, setShowModal] = useState(false);
  const [dailyRewards, setdailyRewards] = useState<number | null>(null);
  const [loading, setloading] = useState(false);
  const [refrech, setrefrech] = useState(false);

  async function getUser() {
    try {
      const res = await axios.get(
        `http://localhost:3001/api/users/firestore/${id}`,
      );

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
        const res = await axios.put(
          `http://localhost:3001/api/users/firestore/updateReward/${User?.id}`,
          { dailyRewards },
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

  return (
    <div className="overflow-hidden rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
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
          </h3>

          <div className="mx-auto mt-4 flex max-w-180 flex-col gap-2 text-xl font-medium text-black dark:text-white">
            <div>
              <span>Coins: </span>
              <span>{User?.coins}</span>
            </div>

            <div>
              <span>Balance: </span>
              <span>{User?.dollars}$</span>
            </div>

            <div className="flex items-center justify-center gap-3">
              <div>
                <span>Daily reward: </span>
                <span>{User?.dailyRewards}$</span>
              </div>

              <button
                className="rounded bg-primary px-3 py-1 font-medium text-gray hover:bg-opacity-90 disabled:opacity-50"
                onClick={() => setShowModal(true)}
              >
                Update daily reward
              </button>
            </div>

            <div>
              <span>Email: </span>
              <span>{User?.email}</span>
            </div>

            <div>
              <span>Provider: </span>
              <span>{User?.provider}</span>
            </div>

            <div>
              <span>Created: </span>
              <span>{createdDate ? createdDate.toLocaleString() : "N/A"}</span>
            </div>

            <div>
              <span>Last sign in: </span>
              <span>{LastSignin ? LastSignin.toLocaleString() : "N/A"}</span>
            </div>
          </div>
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
