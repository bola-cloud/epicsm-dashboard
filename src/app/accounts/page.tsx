import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import AccountsList from "@/components/accounts/AccountsList";

export const metadata: Metadata = {
  title: "Next.js Social media accounts | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Social media accounts page for TailAdmin  Tailwind CSS Admin Dashboard Template",
};

const UsersPage = () => {
  return (
    <DefaultLayout>
      <AccountsList />
    </DefaultLayout>
  );
};

export default UsersPage;
