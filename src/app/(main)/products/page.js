import React from 'react'
import { handleTree } from '@/utils/tree'
import CategoryModel from '../../../../model/category'
import ProductsList from '@/components/template/products/productList'
import connectToDB from '../../../../configs/db'
import ProductModal from '../../../../model/product'
import { paginate } from '@/utils/helper'

export async function generateMetadata({ searchParams }) {
    const params = await searchParams;
    const categoryName = params.category || "Products";
    await connectToDB();

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
    const value = params.value;

    const tree = await handleTree();
    let filter = {};

    if (categoryName) {
        const category = await CategoryModel.findOne({ slug: categoryName });
        if (category) {
            filter.categoryPath = category._id;
        }
    }
    if (value === "bestSelling") {
        filter.score = { $gte: 4 };
    }

    const paginatedData = await paginate(
        ProductModal,
        params,
        filter,
        null,
        true,
        false
    );
    return (
        <div className="container">
            <section className="title">
                <div>
                    <span>{categoryName ? categoryName.replace("-", " ") : "Products"}</span>
                </div>
            </section>

            <ProductsList
                categories={JSON.parse(JSON.stringify(tree))}
                nextCursor={paginatedData.nextCursor}
                limit={paginatedData.limit}
                categoryName={categoryName}
                value={value}
                data={JSON.parse(JSON.stringify(paginatedData.data))}
            />
        </div>
    )
}