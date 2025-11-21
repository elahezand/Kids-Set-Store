import React from 'react'
import connectToDB from '../../../../db/db'
import Layout from '@/layouts/userPanelLayout'
import commentModel from '../../../../model/comment'
import Pagination from '@/components/modules/pageination/pagination'
import { pageinatedData } from '@/utils/helper'
import DataTable from '@/components/template/p-user/comments/DataTable'
import { authUser } from '@/utils/serverHelper'
export default async function page({ searchParams }) {
    connectToDB()
    const user = await authUser
    const comments = await commentModel.find({ userID: user._id })
        .populate("productID").lean()

    const param = await searchParams
    const { page } = param
    const [filteredArray, pageCount] = pageinatedData(comments, page, 5)

    return (
        <Layout>
            <div>
                <h1 className="title">
                    <span>Comments</span>
                </h1>
            </div>
            <main>
                {comments.length > 0 &&
                    <DataTable
                        comments={JSON.parse(JSON.stringify(filteredArray))}
                        title="Comments "
                    />
                }
                {comments.length === 0 &&
                    <p className="empty">
                        No Comments Yet :(
                    </p>}
                <Pagination
                    pageCount={pageCount}
                    href="comments"
                    currentPage={page}
                />
            </main>
        </Layout>
    )
}
