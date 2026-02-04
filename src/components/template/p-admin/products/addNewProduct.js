"use client";
import React, { useEffect, useState } from "react";
import styles from "./addNewProduct.module.css";
import swal from "sweetalert";
import { NewProduct } from "@/utils/actions/productActionServer";
import { useActionState } from "react";

function AddProduct() {
    const [categories, setCategories] = useState([]);
    const [tree, setTree] = useState([]);
    const [selectedPath, setSelectedPath] = useState([]);
    const [level2Options, setLevel2Options] = useState([]);
    const [level3Options, setLevel3Options] = useState([]);

    const [state, formAction] = useActionState(NewProduct, {
        message: "",
        error: undefined,
    });
    
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
        if (!categories || categories.length === 0) return;
        const buildChildren = (parentId) => {
            return categories
                .filter(cat => cat.parentId === parentId)
                .map(cat => ({
                    _id: cat.id,
                    name: cat.slug,
                    children: buildChildren(cat.id)
                }));
        }

        const mainTree = categories
            .filter(cat => !cat.parentId)
            .map(cat => ({
                _id: cat.id,
                name: cat.slug,
                children: buildChildren(cat.id)
            }));

        setTree(mainTree);
    }, [categories]);

    const handleMainCategoryChange = (e) => {
        const id = e.target.value;
        setLevel2Options([]);
        setLevel3Options([]);

        const found = tree.find(cat => cat._id === id);
        if (found) {
            setLevel2Options(found.children || []);
            setSelectedPath([id]);
        } else {
            setSelectedPath([]);
        }
    };

    const handleSubCategoryChange = (e) => {
        const id = e.target.value;
        setLevel3Options([]);

        const found = level2Options.find(cat => cat._id === id);
        if (found) {
            setLevel3Options(found.children || []);
            setSelectedPath([selectedPath[0], id]);
        } else {
            setSelectedPath([selectedPath[0]]);
        }
    };

    const handleLevel3Change = (e) => {
        const id = e.target.value;
        if (id) {
            setSelectedPath([selectedPath[0], selectedPath[1], id]);
        } else {
            setSelectedPath([selectedPath[0], selectedPath[1]]);
        }
    };

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
                <h1 className="title"><span>Add New Product</span></h1>
            </div>

            <form action={formAction} className={styles.product_main}>
                <div><label>Name</label><input type="text" name="name" required /></div>
                <div><label>Price</label><input type="text" name="price" required /></div>
                <div><label>Short Description</label><input type="text" name="shortDescription" /></div>
                <div><label>Long Description</label><input type="text" name="longDescription" /></div>

                {/* Level 1 Select */}
                <div className={styles.group}>
                    <label>Select Category (Level 1):</label>
                    <select onChange={handleMainCategoryChange}>
                        <option value="">Please choose one</option>
                        {tree.map(cat => (
                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                    </select>
                </div>

                {/* Level 2 Select */}
                {level2Options.length > 0 && (
                    <div className={styles.group}>
                        <label>Select Sub-Category (Level 2):</label>
                        <select onChange={handleSubCategoryChange}>
                            <option value="">Please choose one</option>
                            {level2Options.map(cat => (
                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Level 3 Select */}
                {level3Options.length > 0 && (
                    <div className={styles.group}>
                        <label>Select Detail Category (Level 3):</label>
                        <select onChange={handleLevel3Change}>
                            <option value="">Please choose one</option>
                            {level3Options.map(cat => (
                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                )}
                <input type="hidden" name="categoryPath" value={JSON.stringify(selectedPath)} />
                <div><label>Material</label><input type="text" name="material" /></div>
                <div><label>Color</label><input type="text" name="color" /></div>
                <div><label>Tags</label><input type="text" name="tags" placeholder="Cloths,Boy,Red" /></div>
                <div><label>Available Sizes</label><input type="text" name="availableSizes" placeholder="M,L,S" /></div>
                <div><label>Image</label><input type="file" name="img" accept="image/*" /></div>
                <button type="submit">Add Product</button>
            </form>
        </section>
    );
}

export default AddProduct;






