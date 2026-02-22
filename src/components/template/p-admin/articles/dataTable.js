"use client"
import React from "react";
import swal from "sweetalert";
import styles from "./articleTable.module.css"
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FaRegEdit } from "react-icons/fa";
import { useDelete } from "@/utils/hooks/useReactQueryPanel";

function Table({ data, title }) {
      const router = useRouter()

    const { mutate } = useDelete(`/articles`, {
        onSuccess: (data) => {
            router.refresh()
            toast.success("Article Updated Successfully :)");
        },
    })

    const removeArticle = (id) => {
        swal({
            title: "Are You Sure To remove This item?",
            icon: "warning",
            buttons: ["No", "yes"]
        }).then(result => {
            if (result) {
                mutate(id)
            }
        })
    }

    return (
        <>
            <div>
                <h1 className="title">
                    <span>{title}</span>
                </h1>
            </div>
            <table className="table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Title</th>
                        <th>author</th>
                        <th>shortDescription</th>
                        <th>Created AT</th>
                        <th>Status</th>
                        <th><FaRegEdit /></th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((article, index) => (
                        <tr key={article._id}>
                            <td>{index + 1}</td>
                            <td className={styles.image_article}>
                                <Image
                                    width={50}
                                    height={50}
                                    src={article.cover}
                                    alt=""
                                />{article.title}</td>
                            <td>{article.author}</td>
                            <td>{article.shortDescription}</td>
                            <td>{article.createdAt.slice(0, 10)}</td>
                            <td>{article.status}</td>
                            <td style={{ display: "flex", gap: "0.5rem" }}>
                                <button
                                    type="button"
                                    onClick={() => removeArticle(article._id)}
                                    className="delete_btn">
                                    Remove
                                </button>
                                {article.status === "published" ?
                                    <Link
                                        href={`/p-admin/articles/${article._id}`}
                                        className='edit_btn'>
                                        Edit
                                    </Link> :
                                    <Link
                                        href={`/p-admin/articles/draft?id=${article._id}`}
                                        className="edit_btn">
                                        Draft
                                    </Link>
                                }
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
}

export default Table;
