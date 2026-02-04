import React from 'react'
import { getMe } from '@/utils/serverHelper';
import AdminProfileClient from '@/components/template/p-admin/detail-account/adminProfileClient';
import Layout from '@/layouts/adminPanelLayout';
export default async function page() {
    const Info = await getMe()
    return (
        <Layout>
            <main>
                <h4 className="title">
                    <span>Detail Account </span>
                </h4>
                <div>
                    <AdminProfileClient
                        adminData={JSON.parse(JSON.stringify(Info))} />
                </div>
            </main>
        </Layout>
    )
}

