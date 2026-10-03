import PageHeader from "@/components/modules/panel/pageHeader";
import ProfileForm from "@/components/modules/panel/profileForm";
import { getPanelSession } from "@/utils/auth/panelUser";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const { user } = await getPanelSession();
  if (!user) return null;

  return (
    <>
      <PageHeader title="Profile" description="Manage your personal information and password." />
      <ProfileForm userData={user} />
    </>
  );
}
