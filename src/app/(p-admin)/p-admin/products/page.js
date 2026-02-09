import connectToDB from '../../../../../configs/db'
import ProductModal from '../../../../../model/product'
import AddProduct from '@/components/template/p-admin/products/addNewProduct'
import DataTable from '@/components/template/p-admin/products/table'
import Pagination from '@/components/modules/pageination/pagination'
import { paginate } from '@/utils/helper'
const Products = async ({ searchParams }) => {
  await connectToDB()
  const paginatedData = await paginate(ProductModal, searchParams, {})

  return (
      <main>
        <AddProduct />
        {paginatedData.data.length === 0 ? (
          <p className="empty">  No Discount Yet :(</p>
        ) : (
          <DataTable
            products={JSON.parse(JSON.stringify(paginatedData.data))}
            title=" Products List"
          />
        )}
        <Pagination
          href={`products?`}
          currentPage={paginatedData.page}
          pageCount={paginatedData.pageCount}
          limit={paginatedData.limit} />

      </main>
  )
}

export default Products
