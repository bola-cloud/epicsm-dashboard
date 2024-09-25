"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { User } from "../../types/user";
import { format } from 'date-fns';


const UsersList = () => {
  const [Users, setUsers] = useState<User[] | undefined>();

  async function getUsers() {
    try {
      const res = await axios.get("http://localhost:3001/api/users");

      if (res.status === 200) {
        setUsers(res.data);
      } else {
        console.error("No users found");
        toast.error("No users found");
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
      toast.error("Failed to fetch users");
    }
  }

  useEffect(() => {
    getUsers();
  }, []);

  return (
    (<div className="col-span-12 rounded-sm border border-stroke bg-white py-6 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
      <h4 className="mb-6 px-7.5 text-xl font-semibold text-black dark:text-white">
        Users
      </h4>
      <div>
        {Users &&
          Users.map((user) => (
            <Link
              href={`/users/${user._id}`}
              className="flex items-center gap-5 px-7.5 py-3 hover:bg-gray-3 dark:hover:bg-meta-4"
              key={user._id}
            >
              <div className="relative h-14 w-14 rounded-full">
                <Image
                  width={56}
                  height={56}
                  src={user.photo || ""}
                  alt="User"
                  className="rounded-full w-full h-full object-cover"
                />
              </div>

              <div className="flex flex-1 items-center justify-between">
                <div>
                  <h5 className="font-medium text-black dark:text-white">
                    {user.prenom} {user.nom}
                  </h5>
                  <p>
                    <span className="text-xs">Member since {format(user.created, 'd MMMM yyyy')}</span>
                  </p>
                </div>
              </div>
            </Link>
          ))}
      </div>
    </div>)
  );
};

export default UsersList;
