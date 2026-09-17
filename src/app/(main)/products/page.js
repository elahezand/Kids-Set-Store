import { handleTree } from '@/utils/tree'
import CategoryModel from '../../../../model/category'
import ProductsList from '@/components/template/main/products/productList'
import Pagination from '@/components/modules/ui/pagination'
import FilterSection from '@/components/template/main/products/filterSection'
import { useServerData } from '@/utils/useServerData'
import qs from "qs"
import connectToDB from '../../../../configs/db'

export async function generateMetadata({ searchParams }) {
    await connectToDB();
    const params = await searchParams;
    const categoryName = params.category || "Products";
    const category = await CategoryModel.findOne({ slug: categoryName });

    return {
        title: category ? `${category.name} Products | SET kIDS` : "All Products | Blue Tea",
        description: category
            ? `Explore our ${category.name} products. High-quality items for your healthy lifestyle.`
            : "Browse our full collection of products.",
    };
}

export default async function page({ searchParams }) {
    await connectToDB();
    const params = await searchParams;
    const categoryName = params.category;
    const tree = await handleTree();

    const paramsWithPagination = {
        ...params,
        page: params.page || 1,
        limit: params.limit || 10,
    };

    const queryString = qs.stringify(paramsWithPagination, { encode: false });
    const endpoint = queryString ? `/products?${queryString}` : "/products";
    const data = await useServerData(endpoint, `products-${queryString}`, 60);

    return (
        <div className="page-container">
            <h1 className="section-title mb-8 capitalize">
                {categoryName ? categoryName.replace("-", " ") : "Products"}
            </h1>
            <FilterSection categories={tree} />
            <ProductsList
                categories={JSON.parse(JSON.stringify(tree))}
                data={data}
            />
            <Pagination totalCount={data?.totalCount} pageSize={10} />
        </div>
    )
}
