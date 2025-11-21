import ProductModal from '../../../../model/product'
import connectToDB from '../../../../db/db'
import Layout from '@/layouts/adminPanelLayout'
import AddProduct from '@/components/template/p-admin/products/addNewProduct'
import DataTable from '@/components/template/p-admin/products/table'
import CategoryModel from '../../../../model/category'
import Pagination from '@/components/modules/pageination/pagination'
import { pageinatedData } from '@/utils/helper'

const Products = async ({ searchParams }) => {
  connectToDB()

  const param = await searchParams
  const { page } = param

  const products = await ProductModal.find({}).lean()
  const [filteredArray, pageCount] = pageinatedData(products, page, 10)

  return (
    <Layout>
      <main>
        <AddProduct />
        {products.length === 0 ? (
          <p className="empty">  No Discount Yet :(</p>
        ) : (
          <DataTable
            products={JSON.parse(JSON.stringify(filteredArray))}
            title=" Products List"
          />
        )}
        <Pagination
          pageCount={pageCount}
          href="products?"
          currentPage={page}
        />
      </main>
    </Layout>
  )
}

export default Products
