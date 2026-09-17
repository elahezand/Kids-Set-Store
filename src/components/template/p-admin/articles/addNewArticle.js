"use client";
import { useActionState, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { LuSend } from "react-icons/lu";
import { NewArticle } from "@/utils/actions/articleServerAction";
import RichEditor from "./richEditor";

export default function AddNewArticle({ article }) {
    const formRef = useRef(null);
    const [content, setContent] = useState(article?.content || "");
    const isEdit = Boolean(article?._id);

    const [state, formAction, isPending] = useActionState(NewArticle, {
        status: null,
        message: null,
        fields: {
            title: article?.title || "",
            author: article?.author || "",
            shortDescription: article?.shortDescription || "",
            content: article?.content || "",
            cover: article?.cover || null,
        },
    });

    useEffect(() => {
        if (state?.status === 201 || state?.status === 200) {
            toast.success(isEdit ? "Article updated successfully" : "Article added successfully");
            if (!isEdit) {
                formRef.current?.reset();
                setContent("");
            }
        }
    }, [state, isEdit]);

    const handleSubmit = async (formData) => {
        if (isEdit) formData.set("_id", article._id);
        formData.set("content", content);
        await formAction(formData);
    };

    const fieldError = (name) => state?.errors?.[name] && <span className="field-error">{state.errors[name][0]}</span>;

    return (
        <section className="card mb-6">
            <div className="card-header">
                <h2 className="card-title">{isEdit ? "Edit article" : "New article"}</h2>
                {article?.status && (
                    <span className={`badge ${article.status === "published" ? "badge-success" : "badge-warning"} capitalize`}>{article.status}</span>
                )}
            </div>
            <form ref={formRef} action={handleSubmit} className="card-body space-y-5">
                {isEdit && <input type="hidden" name="_id" value={article._id} />}

                <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                        <label htmlFor="article-title" className="label">Title</label>
                        <input id="article-title" name="title" defaultValue={state.fields?.title} type="text" required className="input" />
                        {fieldError("title")}
                    </div>
                    <div>
                        <label htmlFor="article-author" className="label">Author</label>
                        <input id="article-author" name="author" defaultValue={state.fields?.author} type="text" required className="input" />
                        {fieldError("author")}
                    </div>
                    <div>
                        <label htmlFor="article-short" className="label">Short description</label>
                        <input id="article-short" name="shortDescription" defaultValue={state.fields?.shortDescription} type="text" required className="input" />
                        {fieldError("shortDescription")}
                    </div>
                    <div>
                        <label htmlFor="article-cover" className="label">Cover image</label>
                        <input id="article-cover" name="cover" type="file" accept="image/*" className="input" />
                        {fieldError("cover")}
                    </div>
                </div>

                <div>
                    <span className="label">Content</span>
                    <RichEditor value={content} onChange={setContent} />
                    <input type="hidden" name="content" value={content} />
                    {fieldError("content")}
                </div>

                <div className="flex justify-end">
                    <button type="submit" disabled={isPending} className="btn btn-primary">
                        <LuSend className="size-4" />
                        {isPending ? "Saving…" : isEdit ? "Update article" : "Publish article"}
                    </button>
                </div>
            </form>
        </section>
    );
}
