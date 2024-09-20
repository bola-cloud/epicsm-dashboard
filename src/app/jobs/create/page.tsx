import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import JobCreate from "@/components/jobs/JobCreate";

export const metadata: Metadata = {
  title: "Next.js Create Job | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Create Job page for TailAdmin  Tailwind CSS Admin Dashboard Template",
};

function page() {
  return (
    <DefaultLayout>
      <JobCreate />
    </DefaultLayout>
  );
}

export default page;
