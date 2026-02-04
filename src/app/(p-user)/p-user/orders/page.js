import React from 'react'
import Layout from '@/layouts/userPanelLayout'
import orderModel from '../../../../model/order'
import { authUser } from '@/utils/serverHelper'
import DataTable from '@/components/template/p-user/comments/DataTable'
import Pagination from '@/components/modules/pageination/pagination'
import { pageinatedData } from '@/utils/helper'

export default async function page({ searchParams }) {

  const user = await authUser
  const orders = await orderModel.find({ userID: user._id })
    .populate("productID").lean()

  const param = await searchParams
  const { page } = param
  const [filteredArray, pageCount] = pageinatedData(orders, page, 5)
  
  return (
    <Layout>
      <div>
        <h1 className="title">
          <span>Orders</span>
        </h1>
      </div>
      <main>
        {orders.length > 0 &&
          <DataTable
            comments={JSON.parse(JSON.stringify(filteredArray))}
            title="Orders "
          />
        }
        {orders.length === 0 &&
          <p className="empty">
            No Orders Yet :(
          </p>}
        <Pagination
          pageCount={pageCount}
          href="Orders"
          currentPage={page}
        />
      </main>
    </Layout>
  )
}
