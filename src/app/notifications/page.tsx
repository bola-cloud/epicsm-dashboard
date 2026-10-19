import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import NotificationBroadcastPage from "@/components/notifications/NotificationBroadcastPage";

export const metadata: Metadata = {
  title: "Broadcast Notifications | Flyker Admin Dashboard",
  description: "Send push notifications to all registered users via FCM and live sockets",
};

const Notifications = () => {
  return (
    <DefaultLayout>
      <NotificationBroadcastPage />
    </DefaultLayout>
  );
};

export default Notifications;
