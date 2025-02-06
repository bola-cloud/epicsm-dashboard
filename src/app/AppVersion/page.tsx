import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Content from "@/components/AppVersion/Content";

export const metadata: Metadata = {
  title:
    "Epicsm App Version",
  description:
    "Epicsm App Version",
};

const UsersPage = () => {
  return (
    <DefaultLayout>
      <Content />
    </DefaultLayout>
  );
};

export default UsersPage;
