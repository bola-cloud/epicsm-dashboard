import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import SettingsPage from "@/components/settings/SettingsPage";
import ExecutionMethodsManager from "@/components/settings/ExecutionMethodsManager";
import DictionaryManager from "@/components/settings/Dictionary";

export const metadata: Metadata = {
  title: "Next.js Settings | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Settings page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

const Settings = () => {
  return (
    <DefaultLayout>
      <SettingsPage />

      <ExecutionMethodsManager />

      <DictionaryManager />
    </DefaultLayout>
  );
};

export default Settings;
