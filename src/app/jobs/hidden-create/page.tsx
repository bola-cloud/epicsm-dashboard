import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import JobCreateHidden from "@/components/jobs/JobCreateHidden";

export const metadata: Metadata = {
  title: "Hidden Create Job | TailAdmin",
  description: "Hidden job creation page with extended options.",
};

function HiddenJobCreatePage() {
  return (
    <DefaultLayout>
      <JobCreateHidden />
    </DefaultLayout>
  );
}

export default HiddenJobCreatePage;
