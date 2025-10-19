import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import JobDetails from "@/components/jobs/JobDetails";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Next.js Job | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Job page for TailAdmin  Tailwind CSS Admin Dashboard Template",
};

const RESERVED_PATHS = new Set(["create", "hidden-create"]);

const Page = ({ params }: { params: { id: string } }) => {
  const pathId = params?.id?.toLowerCase();

  if (pathId && RESERVED_PATHS.has(pathId)) {
    redirect(`/jobs/${pathId}`);
  }

  return (
    <DefaultLayout>
      <JobDetails />
    </DefaultLayout>
  );
};

export default Page;
