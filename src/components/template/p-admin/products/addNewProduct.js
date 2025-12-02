"use client";
import React, { useEffect, useState } from "react";
import styles from "./addNewProduct.module.css";
import swal from "sweetalert";
import { NewProduct } from "@/utils/useServerAction";
import { useActionState } from "react";

function AddProduct() {

    const [categories, setCategories] = useState([]);
    const [tree, setTree] = useState([]);

    const [categoryId, setCategoryId] = useState("");
    const [sub, setSub] = useState([])

    const [state, formAction] = useActionState(NewProduct, {
        message: "",
        error: undefined,
        fields: {
            img: "",
            name: "",
            price: "",
            score: "",
            color: "",
            tags: "",
            material: "",
            categoryId: "",
            availableSizes: "",
            longDescription: "",
            shortDescription: "",
        }
    })

    useEffect(() => {
        const getCategory = async () => {
            const res = await fetch("/api/categories");
            if (res.status === 200) {
                const data = await res.json();
                setCategories(data.categories);
            }
        }

        getCategory();
    }, []);

    useEffect(() => {
        if (categories.length === 0) return;
        function buildChildren(parent) {
            return categories.filter(cat => cat.parentId === parent._id)
                .map(cat => ({ ...cat, children: buildChildren(cat) }));
        }

        categories.filter(parent => {
            if (!parent.parentId) {
                const newTreeItem = { ...parent, children: buildChildren(parent) };
                setTree(prev => [...prev, newTreeItem]);
            }
        })

    }, [categories]);


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

    const getSubCategories = (e) => {
        tree.map(parent => {
            parent.children.map(item => {
                if (item._id === e.target.value) {
                    setSub(item.children)
                }
            })
        });

    }

    return (
        <section className={styles.product}>
            <div>
                <h1 className="title"><span>
                    Add New Product</span></h1>
            </div>
            <form
                action={async (formatData) => {
                    await formAction(formatData)

                }}
                className={styles.product_main}>

                <div>
                    <label>Name</label>
                    <input type="text" name="name" />
                </div>

                <div>
                    <label>Price</label>
                    <input type="text" name="price" />
                </div>

                <div>
                    <label>Short Description</label>
                    <input type="text"
                        name="shortDescription" />
                </div>

                <div>
                    <label>Long Description</label>
                    <input type="text"
                        name="longDescription" />
                </div>

                {/* CATEGORY */}
                <div className={styles.group}>
                    <label>Select Category:</label>
                    <select
                        onChange={(e) => getSubCategories(e)}>
                        <option value="">
                            Please choose one</option>
                        {tree.map(parent =>
                            parent.children.map(child =>
                                <option key={child._id} value={child._id}>
                                    {child.name}
                                </option>
                            ))
                        }
                    </select>
                </div>
                {/* SubCATEGORY */}
                <div className={styles.group}>
                    <label>Select Category:</label>
                    <select name="categoryId"
                        onChange={(e) => setCategoryId(e.target.value)}>
                        <option value="">Please choose one</option>
                        {sub.map(grandchild =>
                            <option key={grandchild._id} value={grandchild._id}>
                                {grandchild.name}
                            </option>
                        )}
                    </select>
                </div>

                <div>
                    <label>Material</label>
                    <input type="text" name="material" />
                </div>

                <div>
                    <label>Color</label>
                    <input type="text" name="color" />
                </div>

                <div>
                    <label>Tags</label>
                    <input
                        type="text"
                        name="tags"
                        placeholder="Cloths,Boy,Red,Cotton"
                    />
                </div>

                <div>
                    <label>availableSizes</label>
                    <input
                        type="text"
                        name="availableSizes"
                        placeholder="M,L,S"
                    />
                </div>

                <div>
                    <label>Image</label>
                    <input
                        type="file"
                        name="img"
                        accept="image/*"
                    />
                </div>
                <button>add Product</button>
            </form>
        </section>
    );
}

export default AddProduct;