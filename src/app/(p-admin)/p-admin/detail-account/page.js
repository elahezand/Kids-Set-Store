import { getMe } from "@/utils/serverHelper";
import PageHeader from "@/components/modules/panel/pageHeader";
import ProfileForm from "@/components/modules/panel/profileForm";

export default async function AdminAccountPage() {
    const info = await getMe();

    return (
        <>
            <PageHeader title="Account details" description="Update your admin profile and password." />
            <ProfileForm userData={JSON.parse(JSON.stringify(info))} />
        </>
    );
}
