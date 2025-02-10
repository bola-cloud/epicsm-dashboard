import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Stats from "@/components/statistics/Stats";

export const metadata: Metadata = {
  title: "EpicSm Statistics",
  description: "Epicsm statistics",
};

const Profile = () => {
  return (
    <DefaultLayout>
      <Stats />
    </DefaultLayout>
  );
};

export default Profile;
