import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Blockedusers from "@/components/blockedusers/Blockedusers";

export const metadata: Metadata = {
  title: "Next.js Blocked users | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Blocked users page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

const page = () => {
  return (
    <DefaultLayout>
      <Blockedusers />
    </DefaultLayout>
  );
};

export default page;
