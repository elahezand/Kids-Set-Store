"use client"
import styles from "./addNewArticle.module.css"
import { CKEditor } from '@ckeditor/ckeditor5-react';
import { NewArticle } from "@/utils/useServerAction";
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import { useActionState, useEffect } from "react";
export default function AddNewArticle() {
    const [state, formAction] = useActionState(NewArticle, {
        message: "",
        error: undefined,
        fields: {
            cover: "",
            title: "",
            shortDescription: "",
            content: "",
            author: ""
        }


    })

    useEffect(() => {
        if (state.message === "success") {
            swal({
                title: "Article Added Successfully :)",
                icon: "success",
                buttons: "ok",
            })
        } else if (state.message === "error") {
            swal({
                title: "Plaese Fill out required Fields :(",
                icon: "warning",
                buttons: "ok",
            })
        }
    }, [state.message])

    return (
        <section className={styles.article}>
            <div>
                <h1 className="title">
                    <span> Add New Article</span>
                </h1>
            </div>
            <form
                action={async (formData) => {
                    await formAction(formData);
                }}>
                <div className={styles.article_main}>
                    <div>
                        <label>Title </label>
                        <input
                            name='title'
                            defaultValue={state.feilds?.title}
                            type="text"
                        />
                    </div>
                    <div>
                        <label>Short Description</label>
                        <input
                            name='shortDescription'
                            type="text"
                            defaultValue={state.feilds?.shortDescription}

                        />
                    </div>
                    <div>
                        <label>Author</label>
                        <input
                            name='author'
                            type="text"
                            defaultValue={state.feilds?.author} />
                    </div>
                    <div>
                        <label>Cover</label>
                        <input
                            name='cover'
                            type="file"
                            accept="image/*"
                        />
                    </div>
                </div>
                <input type="hidden" name="content"
                    defaultValue={state.feilds?.content}
                />
                <CKEditor
                    editor={ClassicEditor}
                    onChange={(event, editor) => {
                        if (typeof window !== "undefined") {
                            document.querySelector("input[name=content]").value = editor.getData();
                        }
                    }} />
                <button >add New Article</button>
            </form>
        </section>
    )
}

