"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { User } from "../../types/user";
import { getJwtFromLocalStorage } from "@/utils/localStorage";
import { debounce } from "lodash";

const headers = {
  Authorization: `JWT ${getJwtFromLocalStorage()}`,
  "Content-Type": "application/json",
};

const UsersList = () => {
  const [Users, setUsers] = useState<User[] | undefined>();
  const [ShowModal, setShowModal] = useState(false);
  const [BanShowModal, setBanShowModal] = useState(false);
  const [BalanceShowModal, setBalanceShowModal] = useState(false);
  const [UserId, setUserId] = useState("");
  const [loading, setloading] = useState(false);
  const [refrech, setrefrech] = useState(false);
  const [Balance, setBalance] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [Unban, setUnban] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const usersPerPage = 10;

  async function deleteUser(id: string) {
    try {
      setloading(true);
      const res = await axios.delete(
        `https://api.epicsm.goviral.ma/api/v2/users/firestore/${id}`,
        { headers },
      );
      if (res.status === 200) {
        toast.success("User has been deleted.");
        setrefrech(!refrech);
        setShowModal(false);
      }
    } catch (error) {
      console.error("Failed to delete user", error);
      toast.error("Failed to delete user");
    } finally {
      setloading(false);
    }
  }

  async function BanUser(id: string) {
    try {
      setloading(true);
      const res = await axios.put(
        `https://api.epicsm.goviral.ma/api/v2/users/firestore/ban/${id}`,
        {},
        { headers },
      );
      if (res.status === 200) {
        toast.success("User has been banned.");
        setrefrech(!refrech);
        setBanShowModal(false);
      }
    } catch (error) {
      console.error("Failed to ban user", error);
      toast.error("Failed to ban user");
    } finally {
      setloading(false);
    }
  }

  async function UnBanUser(id: string) {
    try {
      setloading(true);
      const res = await axios.put(
        `https://api.epicsm.goviral.ma/api/v2/users/firestore/unban/${id}`,
        {},
        { headers },
      );
      if (res.status === 200) {
        toast.success("User has been unbanned.");
        setrefrech(!refrech);
        setBanShowModal(false);
      }
    } catch (error) {
      console.error("Failed to unban user", error);
      toast.error("Failed to unban user");
    } finally {
      setloading(false);
    }
  }

  async function AddBalancetoUser(id: string) {
    if (Balance) {
      try {
        setloading(true);
        const res = await axios.put(
          `https://api.epicsm.goviral.ma/api/v2/users/firestore/addbalance/${id}`,
          { Balance },
          { headers },
        );
        if (res.status === 200) {
          toast.success(`User's balance updated`);
          setBalanceShowModal(false);
          setBalance(null);
        }
      } catch (error) {
        console.error("Failed to update balance", error);
        toast.error("Failed to update balance");
      } finally {
        setloading(false);
      }
    } else {
      toast.error("Please enter a valid balance");
    }
  }

  function HandleClick() {
    if (Unban) {
      UnBanUser(UserId);
    } else {
      BanUser(UserId);
    }
  }

  // Regular users fetch
  const fetchUsers = async (page: number) => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        "https://api.epicsm.goviral.ma/api/v2/users/firestore",
        {
          headers,
          params: {
            page,
            limit: usersPerPage,
          },
        },
      );

      console.log(response);

      if (response.status === 200) {
        setUsers(response.data.users);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  };

  // Search users
  const searchUsers = async (query: string, page: number) => {
    if (!query.trim()) {
      return fetchUsers(page);
    }

    setIsLoading(true);
    try {
      const response = await axios.get(
        "https://api.epicsm.goviral.ma/api/v2/users/firestore/search",
        {
          headers,
          params: {
            query,
            page,
            limit: usersPerPage,
          },
        },
      );

      if (response.status === 200) {
        setUsers(response.data.users);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      console.error("Error searching users:", error);
      toast.error("Failed to search users");
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setCurrentPage(1); // Reset to first page when searching
      searchUsers(query, 1);
    }, 500),
    [],
  );

  // Effect for initial load and page changes
  useEffect(() => {
    if (searchQuery.trim()) {
      searchUsers(searchQuery, currentPage);
    } else {
      fetchUsers(currentPage);
    }
  }, [currentPage,refrech]);

  // Handle search input
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  // Pagination handlers
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  return (
    <section>
      <input
        type="text"
        placeholder="Filter by id or name or email"
        className="mb-4 w-full rounded border-[1.5px] border-stroke bg-transparent bg-white px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
        value={searchQuery}
        onChange={handleSearchChange}
      />

      <div className="col-span-12 rounded-sm border border-stroke bg-white py-6 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
        <h4 className="mb-6 px-7.5 text-xl font-semibold text-black dark:text-white">
          Users
        </h4>

        <div>
          {isLoading ? (
            <h1 className="px-7.5 py-3 text-lg font-semibold">
              Loading users...
            </h1>
          ) : (
            <>
              {Users &&
                Users.map((user) => (
                  <div
                    className="relative flex items-center justify-between px-7.5 py-3"
                    key={user.id}
                  >
                    <Link
                      href={`/users/${user.id}`}
                      className="flex flex-1 items-center  gap-5 hover:bg-gray-3 dark:hover:bg-meta-4"
                      key={user.id}
                    >
                      <div className="relative h-14 w-14 rounded-full">
                        <Image
                          width={56}
                          height={56}
                          src={user.photo || ""}
                          alt="User"
                          className="h-full w-full rounded-full object-cover"
                        />
                      </div>

                      <div className="flex flex-1 items-center justify-between">
                        <div>
                          <h5 className="font-medium text-black dark:text-white">
                            {user.name || "User"}
                          </h5>
                          <p className="max-w-20 truncate sm:max-w-fit">
                            {user.banned ? "Banned" : user.email}
                          </p>
                        </div>
                      </div>
                    </Link>

                    <div className="flex items-center gap-2">
                      <button
                        className="hover:text-red"
                        onClick={() => {
                          setShowModal(true);
                          setUserId(user.id);
                        }}
                      >
                        <svg
                          className="fill-current"
                          width="18"
                          height="18"
                          viewBox="0 0 18 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M13.7535 2.47502H11.5879V1.9969C11.5879 1.15315 10.9129 0.478149 10.0691 0.478149H7.90352C7.05977 0.478149 6.38477 1.15315 6.38477 1.9969V2.47502H4.21914C3.40352 2.47502 2.72852 3.15002 2.72852 3.96565V4.8094C2.72852 5.42815 3.09414 5.9344 3.62852 6.1594L4.07852 15.4688C4.13477 16.6219 5.09102 17.5219 6.24414 17.5219H11.7004C12.8535 17.5219 13.8098 16.6219 13.866 15.4688L14.3441 6.13127C14.8785 5.90627 15.2441 5.3719 15.2441 4.78127V3.93752C15.2441 3.15002 14.5691 2.47502 13.7535 2.47502ZM7.67852 1.9969C7.67852 1.85627 7.79102 1.74377 7.93164 1.74377H10.0973C10.2379 1.74377 10.3504 1.85627 10.3504 1.9969V2.47502H7.70664V1.9969H7.67852ZM4.02227 3.96565C4.02227 3.85315 4.10664 3.74065 4.24727 3.74065H13.7535C13.866 3.74065 13.9785 3.82502 13.9785 3.96565V4.8094C13.9785 4.9219 13.8941 5.0344 13.7535 5.0344H4.24727C4.13477 5.0344 4.02227 4.95002 4.02227 4.8094V3.96565ZM11.7285 16.2563H6.27227C5.79414 16.2563 5.40039 15.8906 5.37227 15.3844L4.95039 6.2719H13.0785L12.6566 15.3844C12.6004 15.8625 12.2066 16.2563 11.7285 16.2563Z"
                            fill=""
                          />
                          <path
                            d="M9.00039 9.11255C8.66289 9.11255 8.35352 9.3938 8.35352 9.75942V13.3313C8.35352 13.6688 8.63477 13.9782 9.00039 13.9782C9.33789 13.9782 9.64727 13.6969 9.64727 13.3313V9.75942C9.64727 9.3938 9.33789 9.11255 9.00039 9.11255Z"
                            fill=""
                          />
                          <path
                            d="M11.2502 9.67504C10.8846 9.64692 10.6033 9.90004 10.5752 10.2657L10.4064 12.7407C10.3783 13.0782 10.6314 13.3875 10.9971 13.4157C11.0252 13.4157 11.0252 13.4157 11.0533 13.4157C11.3908 13.4157 11.6721 13.1625 11.6721 12.825L11.8408 10.35C11.8408 9.98442 11.5877 9.70317 11.2502 9.67504Z"
                            fill=""
                          />
                          <path
                            d="M6.72245 9.67504C6.38495 9.70317 6.1037 10.0125 6.13182 10.35L6.3287 12.825C6.35683 13.1625 6.63808 13.4157 6.94745 13.4157C6.97558 13.4157 6.97558 13.4157 7.0037 13.4157C7.3412 13.3875 7.62245 13.0782 7.59433 12.7407L7.39745 10.2657C7.39745 9.90004 7.08808 9.64692 6.72245 9.67504Z"
                            fill=""
                          />
                        </svg>
                      </button>

                      <button className="hover:text-red">
                        {user.banned ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="size-5"
                            onClick={() => {
                              setBanShowModal(true);
                              setUserId(user.id);
                              setUnban(true);
                            }}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                            />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="size-5"
                            onClick={() => {
                              setBanShowModal(true);
                              setUserId(user.id);
                              setUnban(false);
                            }}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636"
                            />
                          </svg>
                        )}
                      </button>

                      {!user.banned && (
                        <button
                          className="flex w-full justify-center rounded bg-primary px-3 py-1 font-medium text-gray hover:bg-opacity-90 disabled:opacity-50"
                          onClick={() => {
                            setBalanceShowModal(true);
                            setUserId(user.id);
                          }}
                        >
                          Add balance
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </>
          )}
        </div>

        {ShowModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-700 bg-opacity-50">
            <div className="rounded-lg bg-white p-6 text-center shadow-lg">
              <p className="mb-4 text-lg font-semibold">Confirm deletion ?</p>
              <div className="flex w-full items-center space-x-4">
                <button
                  disabled={loading}
                  className="flex w-full justify-center rounded bg-red p-3 font-medium text-gray hover:bg-opacity-90 disabled:opacity-50"
                  onClick={() => deleteUser(UserId)}
                >
                  Delete
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

        {BanShowModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-700 bg-opacity-50">
            <div className="rounded-lg bg-white p-6 text-center shadow-lg">
              <p className="mb-4 text-lg font-semibold">
                {Unban ? "Confirm unban ?" : "Confirm ban ?"}
              </p>
              <div className="flex w-full items-center space-x-4">
                <button
                  disabled={loading}
                  className="flex w-full justify-center rounded bg-red p-3 font-medium text-gray hover:bg-opacity-90 disabled:opacity-50"
                  onClick={HandleClick}
                >
                  {Unban ? "Unban" : "Ban"}
                </button>
                <button
                  disabled={loading}
                  className="flex w-full justify-center rounded bg-slate-400 p-3 font-medium text-gray hover:bg-opacity-90 disabled:opacity-50"
                  onClick={() => setBanShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {BalanceShowModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-700 bg-opacity-50">
            <div className="rounded-lg bg-white p-6 text-center shadow-lg">
              <p className="mb-4 text-lg font-semibold">Add balance</p>

              <input
                type="number"
                name="maxCount"
                value={Balance || ""}
                onChange={(e) => setBalance(Number(e.target.value))}
                placeholder="0 $"
                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                min={0}
                onWheel={(e) => e.currentTarget.blur()}
              />

              <div className="mt-4 flex w-full items-center space-x-4">
                <button
                  disabled={loading}
                  className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90 disabled:opacity-50"
                  onClick={() => AddBalancetoUser(UserId)}
                >
                  Add
                </button>
                <button
                  disabled={loading}
                  className="flex w-full justify-center rounded bg-slate-400 p-3 font-medium text-gray hover:bg-opacity-90 disabled:opacity-50"
                  onClick={() => setBalanceShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="mx-auto mt-6 flex max-w-2xl items-center justify-between">
        <button
          className="rounded bg-primary px-3 py-1 font-medium text-gray hover:bg-opacity-90 disabled:opacity-50"
          onClick={handlePrevPage}
          disabled={currentPage === 1 || isLoading}
        >
          Previous
        </button>

        <p>
          Page {currentPage} of {totalPages}
        </p>

        <button
          className="rounded bg-primary px-3 py-1 font-medium text-gray hover:bg-opacity-90 disabled:opacity-50"
          onClick={handleNextPage}
          disabled={currentPage === totalPages || isLoading}
        >
          Next
        </button>
      </div>
    </section>
  );
};

export default UsersList;
