import { getMe } from "@/utils/serverHelper";
import PageHeader from "@/components/modules/panel/pageHeader";
import ProfileForm from "@/components/modules/panel/profileForm";

export default async function ProfilePage() {
    const info = await getMe();

    return (
        <>
            <PageHeader title="Profile" description="Manage your personal information and password." />
            <ProfileForm userData={JSON.parse(JSON.stringify(info))} />
        </>
    );
}
