import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { User } from "@/types/user";
import { getJwtFromLocalStorage } from "@/utils/localStorage";

const headers = {
  Authorization: `JWT ${getJwtFromLocalStorage()}`,
  "Content-Type": "application/json",
};

const ChatCard = () => {
  const [Users, setUsers] = useState<User[] | undefined>();

  async function getUsers() {
    try {
      const res = await axios.get(
        `https://api.epicsm.goviral.ma/api/v2/users/firestore/lastSignIn`,
        {
          headers,
        },
      );

      if (res.status === 200) {
        setUsers(res.data);
      } else {
        console.error("No Users found");
        toast.error("No Users found");
      }
    } catch (error) {
      console.error("Failed to fetch Users", error);
      toast.error("Failed to fetch Users");
    }
  }

  useEffect(() => {
    getUsers();
  }, []);

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white py-6 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
      <h4 className="mb-6 px-7.5 text-xl font-semibold text-black dark:text-white">
        Users
      </h4>

      <div>
        {Users &&
          Users.map((user, key) => (
            <Link
              href={`/users/${user.id}`}
              className="flex items-center gap-5 px-7.5 py-3 hover:bg-gray-3 dark:hover:bg-meta-4"
              key={key}
            >
              <div className="relative h-14 w-14 rounded-full">
                <Image
                  width={56}
                  height={56}
                  src={user.photo || ""}
                  alt="User"
                  className="rounded-full object-cover min-h-14 min-w-14"
                />
              </div>

              <div className="flex flex-1 items-center justify-between truncate">
                <div>
                  <h5 className="font-medium text-black dark:text-white">
                    {user.name}
                  </h5>
                  <p>
                    <span className="text-sm text-black dark:text-white">
                      {user.email}
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

export default ChatCard;
