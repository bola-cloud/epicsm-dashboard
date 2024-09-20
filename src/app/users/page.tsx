import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import UsersList from "@/components/users/UsersList";

export const metadata: Metadata = {
  title: "Next.js Users | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Users page for TailAdmin  Tailwind CSS Admin Dashboard Template",
};

const UsersPage = () => {
  return (
    <DefaultLayout>
      <UsersList />
    </DefaultLayout>
  );
};

export default UsersPage;
