import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Logs from "@/components/logs/Logs";

export const metadata: Metadata = {
  title: "EpicSm Logs",
  description: "Epicsm logs",
};

const Profile = () => {
  return (
    <DefaultLayout>
      <Logs />
    </DefaultLayout>
  );
};

export default Profile;
