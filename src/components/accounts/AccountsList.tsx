"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Account } from "../../types/account";
import { format } from "date-fns";
import API from "@/utils/API";

const AccountsList = () => {
  const [Accounts, setAccounts] = useState<Account[] | undefined>();

  async function getAccounts() {
    try {
      const res = await API.get("/api/v2/accounts");

      if (res.status === 200) {
        setAccounts(res.data);
      } else {
        console.error("No accounts found");
        toast.error("No accounts found");
      }
    } catch (error) {
      console.error("Failed to fetch accounts", error);
      toast.error("Failed to fetch accounts");
    }
  }

  useEffect(() => {
    getAccounts();
  }, []);

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white py-6 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
      <h4 className="mb-6 px-7.5 text-xl font-semibold text-black dark:text-white">
        Social media accounts
      </h4>
      <div>
        {Accounts &&
          Accounts.map((user) => (
            <Link
              href={`/users/${user._id}`}
              className="flex items-center gap-5 px-7.5 py-3 hover:bg-gray-3 dark:hover:bg-meta-4"
              key={user._id}
            >
              <div className="relative text-xl font-semibold">
                <h1>{user.company}</h1>
              </div>

              <div className="flex flex-1 items-center justify-between">
                <div>
                  <p>
                    <span className="text-xs">
                      Member since {format(user.created, "d MMMM yyyy")}
                    </span>
                  </p>
                </div>
              </div>
            </Link>
          ))}
      </div>
    </div>
  );
};

export default AccountsList;
