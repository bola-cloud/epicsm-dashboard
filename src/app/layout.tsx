"use client";

import "jsvectormap/dist/jsvectormap.css";
import "flatpickr/dist/flatpickr.min.css";
import "@/css/satoshi.css";
import "@/css/style.css";
import React, { useEffect, useState } from "react";
import Loader from "@/components/common/Loader";
import toast, { Toaster } from "react-hot-toast";
import {
  getJwtFromLocalStorage,
  removeAuthDataFromLocalStorage,
} from "@/utils/localStorage";
import { useRouter } from "next/navigation";
import axios from "axios";

const headers = {
  Authorization: `JWT ${getJwtFromLocalStorage()}`,
  "Content-Type": "application/json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  if (!getJwtFromLocalStorage()) {
    router.push("/login");
  }

  async function checkToken() {
    try {
      const response = await axios.get("https://api.epicsm.goviral.ma/api/checktoken", {
        headers,
      });

      console.log(response.data);
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        if (error.response.data.message === "Token has expired") {
          toast.error("Your session has expired. Please log in again.");
          setTimeout(() => {
            removeAuthDataFromLocalStorage();
            window.location.href = "/login";
          }, 2000);
        } else {
          console.error("Error checking token:", error.response.data);
        }
      } else {
        console.error("Error checking token:", error.message);
      }
    }
  }

  useEffect(() => {
    checkToken();
  }, [getJwtFromLocalStorage()]);

  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <Toaster position="top-right" reverseOrder={false} />
        <div className="dark:bg-boxdark-2 dark:text-bodydark">
          {loading ? <Loader /> : children}
        </div>
      </body>
    </html>
  );
}
