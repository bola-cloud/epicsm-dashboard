import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import UserProfile from "@/components/users/UserProfile";

export const metadata: Metadata = {
  title: "Next.js User profile | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js User profile page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

const page = () => {
  return (
    <DefaultLayout>
      <div className="mx-auto max-w-242.5">
        <Breadcrumb pageName="User / Profile" />

        <UserProfile />
      </div>
    </DefaultLayout>
  );
};

export default page;
