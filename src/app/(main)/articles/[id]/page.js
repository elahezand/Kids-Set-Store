import connectToDB from "../../../../../configs/db";
import Breadcrumb from "@/components/modules/breadCrumb/breadCrumb";
import styles from "@/styles/articles.module.css"
import Image from 'next/image';
import ArticleModel from '../../../../../model/article';
import { JSDOM } from "jsdom"
import createDOMPurify from "dompurify"
import Link from 'next/link';

// Generate metadata for SEO and social sharing
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

    // Fetch the main article
    const article = await ArticleModel.findById(id)

    // Fetch other articles
    const otherArticles = await ArticleModel.find({ _id: { $ne: id } })
        .sort({ createdAt: -1 })
        .limit(4)
        .lean();


    const window = new JSDOM("").window
    const DOMPurify = createDOMPurify(window)

    return (
        <>
            <Breadcrumb
                title={article.title}
                route={"articles"} />
            <div className={styles.container}>
                <div className={styles.box}>
                    <article className={styles.article}>
                        <p>
                            {article.title}
                        </p>
                        <h3>{article.shortDescription}</h3>
                        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.content) }}>
                        </div>
                        <div className={styles.author_container}>
                            <span> Posted by:</span>
                            <div className={styles.author_img}>
                                <Image
                                    src="/images/user-profile-flat-illustration-avatar-person-icon-gender-neutral-silhouette-profile-picture-free-vector.jpg"
                                    alt="Headshot of Laura Jones"
                                    height={50}
                                    width={50}
                                    className={styles.author_img}
                                />
                                <strong>{article.author}</strong>
                            </div>
                            <span> Published:{article.createdAt.toLocaleDateString()}</span>
                        </div>
                    </article>
                </div>
                <div className={styles.post_header}>
                    <h2>{article.title}</h2>
                    <div className={styles.post_img}>
                        <Image
                            src={article.cover}
                            alt="HTML code on a screen"
                            width={400}
                            height={400}
                            className={styles.post_img} />
                    </div>
                    <div className={styles.articles_info}>
                        <div className={styles.article_info}>
                            <span className={styles.articles_info__article__title}> New articles </span>
                            <ul className={styles.last_articles__list}>
                                {otherArticles.length ? otherArticles.map((item, index) => (
                                    <li key={index + 1} className={styles.last_articles__item}>
                                        <Link href={`/articles/${item._id}`}
                                            className={styles.last_articles__link}>
                                            {item.title}
                                        </Link>
                                    </li>
                                )) : null}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
