import PageHeader from "@/components/modules/panel/pageHeader";
import ProfileForm from "@/components/modules/panel/profileForm";
import { requireAdmin } from "@/utils/auth/panelUser";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Account" };

export default async function AdminAccountPage() {
  const { user } = await requireAdmin();

  return (
    <>
      <PageHeader title="Account" description="Update your admin profile and password." />
      <ProfileForm userData={user} />
    </>
  );
}
