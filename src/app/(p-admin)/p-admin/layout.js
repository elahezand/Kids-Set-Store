import React from 'react'
import styles from "@/styles/p-admin.module.css";
import { authAdmin } from '@/utils/serverHelper'
import Topbar from '@/components/modules/p-admin/topbar/topbar'
import Sidebar from '@/components/modules/p-admin/sidebar/sidebar'
import { redirect } from 'next/dist/server/api-utils';
import RefreshAccessToken from '@/utils/refreshToken';
export default async function Layout({ children }) {
    const admin = await authAdmin()
    if (!admin) {
        redirect("/login-register")
    }

    const content = (
        <div className={styles.layout}>
            <section className={styles.section}>
                <Sidebar />
                <div className={styles.contents}>
                    <Topbar
                        user={JSON.parse(JSON.stringify(admin))} />
                    {children}
                </div>
            </section>
        </div>
    );

    if (admin.status === "expired") {
        return (
            <RefreshAccessToken
                shouldRefresh={true}>
                {content}
            </RefreshAccessToken>
        );
    }
    return content;
}


