import Breadcrumb from "@/components/modules/main/breadCrumb";
import Image from 'next/image';
import ArticleModel from '../../../../../model/article';
import connectToDB from "../../../../../configs/db";
import { JSDOM } from "jsdom"
import createDOMPurify from "dompurify"
import Link from 'next/link';

export async function generateMetadata({ params }) {
    await connectToDB();
    const { id } = await params
    const article = await ArticleModel.findOne({ _id: id }).lean();

    return {
        title: article?.title || "Article",
        description: article?.shortDescription || "Read this article",
        openGraph: {
            title: article?.title,
            description: article?.shortDescription,
            images: article?.cover ? [article.cover] : [],
        },
        twitter: {
            card: "summary_large_image",
            title: article?.title,
            description: article?.shortDescription,
            images: article?.cover ? [article.cover] : [],
        },
    };
}

export default async function page({ params }) {
    await connectToDB();
    const { id } = await params;
    const article = await ArticleModel.findById(id)

    const otherArticles = await ArticleModel.find({ _id: { $ne: id } })
        .sort({ createdAt: -1 })
        .limit(4)
        .lean();

    const window = new JSDOM("").window
    const DOMPurify = createDOMPurify(window)

    return (
        <div className="page-container">
            <Breadcrumb title={article.title} route="articles" />
            <div className="flex flex-col gap-8 text-text dark:text-gray-100 lg:flex-row lg:gap-10">
                <div className="w-full lg:w-[60%]">
                    <article className="card card-body [&_h3]:mb-4 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:uppercase [&_h3]:text-sage-400 [&_p]:mb-4 [&_p]:text-base [&_p]:leading-7 [&_ul]:mb-5 [&_ul_li]:mb-2.5 [&_ul_li]:list-none [&_ul_li]:text-lg sm:p-8">
                        <p className="mb-2.5 text-lg font-bold text-coral-300">{article.title}</p>
                        <h3>{article.shortDescription}</h3>
                        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.content) }} />
                        <div className="mt-6 flex flex-wrap items-center gap-3 text-base">
                            <span>Posted by:</span>
                            <div className="flex items-center gap-2">
                                <Image
                                    src="/images/user-profile-flat-illustration-avatar-person-icon-gender-neutral-silhouette-profile-picture-free-vector.jpg"
                                    alt="Author"
                                    height={40}
                                    width={40}
                                    className="h-10 w-10 rounded-full object-cover"
                                />
                                <strong className="text-coral-300">{article.author}</strong>
                            </div>
                            <span>Published: {article.createdAt.toLocaleDateString()}</span>
                        </div>
                    </article>
                </div>
                <div className="w-full rounded-2xl bg-coral-300 p-6 shadow-card sm:p-8 lg:w-[35%]">
                    <h2 className="mb-4 text-xl font-bold text-white">{article.title}</h2>
                    <div className="overflow-hidden rounded-xl">
                        <Image
                            src={article.cover}
                            alt={article.title}
                            width={400}
                            height={250}
                            className="h-[200px] w-full object-cover sm:h-[250px]"
                        />
                    </div>
                    <div className="mt-8 rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-float sm:p-8">
                        <span className="relative pl-2 text-lg text-sage-400 before:absolute before:-left-4 before:-top-[5px] before:h-[39px] before:w-[22px] before:skew-x-[10deg] before:rounded-bl-[12px] before:rounded-tl-[8px] before:bg-sage-400">
                            New articles
                        </span>
                        <ul className="mt-8">
                            {otherArticles.length ? otherArticles.map((item, index) => (
                                <li key={index + 1} className="border-b border-text py-4">
                                    <Link href={`/articles/${item._id}`} className="text-base text-text dark:text-gray-100 transition-all duration-500 hover:text-sage-400">
                                        {item.title}
                                    </Link>
                                </li>
                            )) : null}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
