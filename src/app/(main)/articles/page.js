import React from 'react'
import ArticlesList from '@/components/template/articles/articlesList'
import connectToDB from '../../../../configs/db'
import ArticleModel from '../../../../model/article'
import { paginate } from '@/utils/helper'
import Breadcrumb from '@/components/modules/breadCrumb/breadCrumb'
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