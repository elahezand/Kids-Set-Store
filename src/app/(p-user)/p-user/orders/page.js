import React from 'react'
import orderModel from '../../../../../model/order'
import { authUser } from '@/utils/serverHelper'
import { paginate } from '@/utils/helper'
import DataTable from '@/components/template/p-user/comments/DataTable'
import Pagination from '@/components/modules/pageination/pagination'

export default async function page({ searchParams }) {
  const user = await authUser()
  const searchparams = searchParams

  const paginatedData = await paginate(
    orderModel,
    searchparams,
    { userID: user._id },
    "productID"
  )
  return (
    <>
      <div>
        <h1 className="title">
          <span>Orders</span>
        </h1>
      </div>
      <main>
        {paginatedData.data.length > 0 &&
          <DataTable
            comments={JSON.parse(JSON.stringify(paginatedData.data))}
            title="Orders "
          />
        }
        {paginatedData.data.length === 0 &&
          <p className="empty">
            No Orders Yet :(
          </p>}
        <Pagination
          href={`orders?`}
          currentPage={paginatedData.page}
          pageCount={paginatedData.pageCount}
          limit={paginatedData.limit}
        />
      </main>
    </>
  )
}
