import PageHeader from "@/components/modules/panel/pageHeader";
import ProfileForm from "@/components/modules/panel/profileForm";
import { getPanelSession } from "@/utils/auth/panelUser";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Account" };

export default async function AdminAccountPage() {
  const { user } = await getPanelSession();
  if (!user) return null;

  return (
    <>
      <PageHeader title="Account" description="Update your admin profile and password." />
      <ProfileForm userData={user} />
    </>
  );
}
