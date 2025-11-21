import Navbar from '@/components/modules/navbar/navbar'
import Footer from '@/components/modules/footer/footer'
import Breadcrumb from "@/components/modules/breadCrumb/breadCrumb";
import styles from "@/styles/articles.module.css"
import Image from 'next/image';
import ArticleModel from '../../../../model/article';
import { notFound } from 'next/navigation';
import { JSDOM } from "jsdom"
import createDOMPurify from "dompurify"
import Link from 'next/link';

export default async function page({ params }) {
    const { id } = await params
    const article = await ArticleModel.findOne({ _id: id })
    if (!article) notFound()
    const articles = await ArticleModel.find()

    const window = new JSDOM("").window
    const DOMPurify = createDOMPurify(window)

    return (
        <>
            <Navbar />
            <Breadcrumb route={"articles"} title={"Articles"} />
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
                            className={styles.post_img}
                        />
                    </div>
                    <div className={styles.articles_info}>
                        <div className={styles.article_info}>
                            <span className={styles.articles_info__article__title}> New articles </span>
                            <ul className={styles.last_articles__list}>
                                {articles.length ? articles.map((item, index) => (
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
            <Footer />
        </>
    )
}
