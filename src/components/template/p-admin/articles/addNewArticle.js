"use client";
import React, { useState, useEffect, useRef } from "react";
import { useActionState } from "react";
import styles from "./addNewArticle.module.css"
import { NewArticle } from "@/utils/actions/articleServerAction";
import toast from "react-hot-toast";
import RichEditor from "./richEditor";


export default function AddNewArticle({ article }) {
    const formRef = useRef(null);
    const [content, setContent] = useState(article?.content || "");

    const [state, formAction, isPending] = useActionState(NewArticle, {
        status: null,
        message: null,
        fields: {
            title: article?.title || "",
            author: article?.author || "",
            shortDescription: article?.shortDescription || "",
            content: article?.content || "",
            cover: article?.cover || null,
        }
    });

    useEffect(() => {
        if (state?.status === 201 || state.status === 200) {
            toast.success("article added Successfully :)")
            formRef.current?.reset();
        }
    }, [state]);

    const handleSubmit = async (formData) => {
        if (article?._id) formData.set("_id", article._id);
        formData.set("content", content);
        await formAction(formData);
    }

    return (
        <section className={styles.article}>
            <div>
                <h1 className="title">
                    <span>{article?._id ? "Edit Article" : "Add New Article"}</span>
                </h1>
            </div>
            <form ref={formRef}
                action={handleSubmit}>
                {article?._id &&
                    <input type="hidden" name="_id"
                        value={article._id} />}
                <div className={styles.article_main}>
                    <div>
                        <label>Title</label>
                        <input
                            name="title"
                            defaultValue={state.fields?.title}
                            type="text"
                            required
                        />
                    </div>
                    <div>
                        <label>Short Description</label>
                        <input
                            name="shortDescription"
                            type="text"
                            defaultValue={state.fields?.shortDescription}
                            required
                        />
                    </div>
                    <div>
                        <label>Author</label>
                        <input
                            name="author"
                            type="text"
                            defaultValue={state.fields?.author}
                            required
                        />
                    </div>
                    <div>
                        <label>Cover</label>
                        <input name="cover" type="file" accept="image/*" />
                    </div>
                </div>
                <div className={styles.editorContainer}>
                    <RichEditor
                        value={content}
                        onChange={setContent} />
                    <input type="hidden" name="content"
                        value={content} />
                    {state?.errors?.content && (
                        <span className="text-sm text-red-500">{state.errors.content[0]}</span>
                    )}
                </div>
                <button
                    type="submit"
                    disabled={isPending}
                    className={styles.submit_btn}>
                    {isPending ? "Sending..." : article?._id ? "Update Article" : "Add New Article"}
                </button>
            </form>
        </section>
    );
}