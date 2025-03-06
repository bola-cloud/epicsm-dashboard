import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import PromotionPage from "@/components/Promotion/PromotionPage";

export const metadata: Metadata = {
  title: "Next.js Promotion | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Promotion page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

const Promotion = () => {
  return (
    <DefaultLayout>
      <PromotionPage />
    </DefaultLayout>
  );
};

export default Promotion;
