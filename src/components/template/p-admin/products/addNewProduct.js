"use client";
import React, { useEffect, useState } from "react";
import styles from "./addNewProduct.module.css";
import swal from "sweetalert";
import { NewProduct } from "@/utils/useServerAction";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

function AddProduct() {
    const { pending } = useFormStatus()
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
            subSubCategory: "",
            longDescription: "",
            shortDescription: "",
        }
    })
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubCategories] = useState([]);
    const [subsubcategories, setSubSubCategories] = useState([]);

    const getCategory = async () => {
        const res = await fetch("/api/categories");
        if (res.status === 200) {
            const data = await res.json();
            setCategories(data.categories);
        }
    };

    const getSubCategories = async (e) => {
        const res = await fetch("/api/subcategories");
        if (res.status === 200) {
            const data = await res.json();
            const filtered = data.subcategories.filter(
                (item) => item.parentID === e.target.value
            );
            setSubCategories(filtered);
        }
    };

    const getSubSubCategories = async (e) => {
        const res = await fetch("/api/subsubcategories");
        if (res.status === 200) {
            const data = await res.json();
            const filtered = data.subsubcategories.filter(
                (item) => item.subParent === e.target.value
            );
            setSubSubCategories(filtered);
        }
    };

    useEffect(() => {
        getCategory();

    }, []);


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
                        name="categoryID"
                        onChange={(e) => getSubCategories(e)}
                    >
                        <option value="">Please choose one</option>
                        {categories.map((item, i) => (
                            <option key={i}
                                value={item._id}>{item.title}</option>
                        ))}
                    </select>
                </div>

                {/* SUBCATEGORY */}
                <div className={styles.group}>
                    <label>Select SubCategory:</label>
                    <select
                        name="subCategoryID"
                        onChange={(e) => getSubSubCategories(e)}
                    >
                        <option value="">Please choose one</option>
                        {subcategories.map((item, i) => (
                            <option key={i} value={item._id}>{item.title}</option>
                        ))}
                    </select>
                </div>

                {/* SUBSUBCATEGORY */}
                <div className={styles.group}>
                    <label>Select SubSubCategory:</label>
                    <select name="subSubCategory">
                        <option value="">Please choose one</option>
                        {subsubcategories.map((item, i) => (
                            <option key={i} value={item._id}>
                                {item.title}</option>
                        ))}
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
                    <label>Image</label>
                    <input
                        type="file"
                        name="img"
                        accept="image/*"
                    />
                </div>

                <button disabled={pending}>{pending ? "Loading...." : "addProduct"}</button>
            </form>
        </section>
    );
}

export default AddProduct;