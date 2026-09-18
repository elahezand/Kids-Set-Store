import connectToDB from "../../../../../configs/db";
import ProductModel from "../../../../../model/product";
import { paginate } from "@/utils/paginate";
import PageHeader from "@/components/modules/panel/pageHeader";
import Pagination from "@/components/modules/ui/loadMore";
import AddProduct from "@/components/template/p-admin/products/addNewProduct";
import ProductsTable from "@/components/template/p-admin/products/table";

export default async function ProductsPage({ searchParams }) {
    await connectToDB();
    const params = await searchParams;
    const paginatedData = await paginate(ProductModel, params, {});

    return (
        <>
            <PageHeader title="Products" description="Create, edit and manage your store products." />
            <AddProduct />
            <ProductsTable products={JSON.parse(JSON.stringify(paginatedData.data))} total={paginatedData.totalCount} />
            <Pagination pageCount={paginatedData.pageCount} limit={paginatedData.limit} />
        </>
    );
}
