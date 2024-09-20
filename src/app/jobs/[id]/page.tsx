import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import JobDetails from "@/components/jobs/JobDetails";

export const metadata: Metadata = {
  title: "Next.js Job | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Job page for TailAdmin  Tailwind CSS Admin Dashboard Template",
};

const Page = () => {
  return (
    <DefaultLayout>
      <JobDetails/>
    </DefaultLayout>
  );
};

export default Page;
