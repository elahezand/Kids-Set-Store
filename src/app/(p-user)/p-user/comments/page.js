import React from 'react'
import commentModel from '../../../../../model/comment'
import Pagination from '@/components/modules/pageination/pagination'
import { paginate } from '@/utils/helper'
import DataTable from '@/components/template/p-user/comments/DataTable'
import { authUser } from '@/utils/serverHelper'
export default async function page({ searchParams }) {
    const user = await authUser()
    const paginatedData = await paginate(
        commentModel,
        searchParams,
        { userID: user._id },
        "productID")

    return (
        <>
            <div>
                <h1 className="title">
                    <span>Comments</span>
                </h1>
            </div>
            <main>
                {paginatedData.data.length > 0 &&
                    <DataTable
                        comments={JSON.parse(JSON.stringify(paginatedData.data))}
                        title="Comments "
                    />
                }
                {paginatedData.data.length === 0 &&
                    <p className="empty">
                        No Comments Yet :(
                    </p>}
                <Pagination
                    href={`comments?`}
                    currentPage={paginatedData.page}
                    pageCount={paginatedData.pageCount}
                    limit={paginatedData.limit}
                />
            </main>
        </>
    )
}
