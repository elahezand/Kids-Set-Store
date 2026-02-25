import React from 'react'
import { getMe } from '@/utils/serverHelper';
import AdminProfileClient from '@/components/template/p-admin/detail-account/adminProfileClient';
export default async function page() {
    const Info = await getMe()
    return (
        <main className='container'>
            <h1 className="title">
                <span>Detail Account </span>
            </h1>
            <div>
                <AdminProfileClient
                    adminData={JSON.parse(JSON.stringify(Info))} />
            </div>
        </main>
    )
}

