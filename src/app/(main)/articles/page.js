import React from 'react'
import ArticlesList from '@/components/template/articles/articlesList'
import connectToDB from '../../../../configs/db'
import ArticleModel from '../../../../model/article'
import { paginate } from '@/utils/helper'
import Breadcrumb from '@/components/modules/breadCrumb/breadCrumb'

export const metadata = {
    title: "Our Articles | My Website",
    description: "Read our latest articles, news, and insights on various topics.",
    openGraph: {
        title: "Our Articles | My Website",
        description: "Read our latest articles, news, and insights on various topics.",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Our Articles | My Website",
        description: "Read our latest articles, news, and insights on various topics.",
    },
}
export default async function page({ searchParams }) {
    await connectToDB();
    const params = await searchParams;

    const paginatedData = await paginate(
        ArticleModel,
        params,
        {},
        null,
        true,
        false
    );
    return (
        <div className="container">
            <Breadcrumb
                route={"articles"}
                title={"Our Articles"} />
            <ArticlesList
                nextCursor={paginatedData.nextCursor}
                limit={paginatedData.limit}
                data={JSON.parse(JSON.stringify(paginatedData.data))}
            />
        </div>
    )
}