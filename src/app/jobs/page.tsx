import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import JobsTable from "@/components/jobs/JobsTable";

export const metadata: Metadata = {
  title: "Next.js Jobs | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Jobs page for TailAdmin  Tailwind CSS Admin Dashboard Template",
};

const Page = () => {
  return (
    <DefaultLayout>
      <JobsTable />
    </DefaultLayout>
  );
};

export default Page;
