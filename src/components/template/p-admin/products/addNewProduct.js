"use client";
import { useActionState, useEffect, useState } from "react";
import swal from "sweetalert";
import { LuPlus } from "react-icons/lu";
import { NewProduct } from "@/utils/actions/productActionServer";

export default function AddProduct() {
    const [categories, setCategories] = useState([]);
    const [path, setPath] = useState([]); // [level1, level2, level3]

    const [state, formAction, isPending] = useActionState(NewProduct, { message: "", error: undefined });

    useEffect(() => {
        const getCategories = async () => {
            const res = await fetch("/api/categories");
            if (res.ok) {
                const data = await res.json();
                setCategories(data.data || []);
            }
        };
        getCategories();
    }, []);

    const tree = categories; // already nested: { _id, name, slug, subCategories }

    const level2Options = tree.find((c) => c._id === path[0])?.subCategories || [];
    const level3Options = level2Options.find((c) => c._id === path[1])?.subCategories || [];

    const selectLevel = (level) => (e) => {
        const next = path.slice(0, level);
        if (e.target.value) next[level] = e.target.value;
        setPath(next);
    };

    useEffect(() => {
        if (state.message === "success") {
            swal({ title: "Product added successfully", icon: "success", buttons: "OK" });
        } else if (state.message === "error") {
            swal({ title: "Please fill out the required fields", icon: "warning", buttons: "OK" });
        }
    }, [state]);

    const textField = (name, label, props = {}) => (
        <div>
            <label htmlFor={`product-${name}`} className="label">{label}</label>
            <input id={`product-${name}`} name={name} type="text" className="input" {...props} />
        </div>
    );

    return (
        <section className="card mb-6">
            <div className="card-header">
                <div>
                    <h2 className="card-title">Add new product</h2>
                    <p className="mt-0.5 text-xs text-gray-700 dark:text-gray-500">Fields marked with * are required.</p>
                </div>
            </div>
            <form action={formAction} className="card-body grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {textField("title", "Title *", { required: true })}
                {textField("price", "Price *", { required: true, inputMode: "decimal" })}
                {textField("discount", "Discount %", { inputMode: "decimal", defaultValue: 0 })}
                {textField("stock", "Stock (per size) *", { required: true, inputMode: "numeric", defaultValue: 0 })}
                {textField("material", "Material")}
                {textField("color", "Color")}
                {textField("tags", "Tags", { placeholder: "Cloths, Boy, Red" })}
                {textField("sizes", "Sizes", { placeholder: "S, M, L (one variant per size)" })}
                <div>
                    <label htmlFor="product-status" className="label">Status</label>
                    <select id="product-status" name="status" className="input" defaultValue="active">
                        <option value="active">Active (visible in store)</option>
                        <option value="draft">Draft</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>

                <div>
                    <label className="label">Category</label>
                    <select className="input" value={path[0] || ""} onChange={selectLevel(0)}>
                        <option value="">Select category</option>
                        {tree.map((cat) => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                    </select>
                </div>
                {level2Options.length > 0 && (
                    <div>
                        <label className="label">Sub-category</label>
                        <select className="input" value={path[1] || ""} onChange={selectLevel(1)}>
                            <option value="">Select sub-category</option>
                            {level2Options.map((cat) => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                        </select>
                    </div>
                )}
                {level3Options.length > 0 && (
                    <div>
                        <label className="label">Detail category</label>
                        <select className="input" value={path[2] || ""} onChange={selectLevel(2)}>
                            <option value="">Select detail category</option>
                            {level3Options.map((cat) => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                        </select>
                    </div>
                )}
                <input type="hidden" name="categoryPath" value={JSON.stringify(path.filter(Boolean))} />

                <div className="sm:col-span-2 lg:col-span-3">
                    <label htmlFor="product-description" className="label">Description *</label>
                    <textarea id="product-description" name="description" rows={4} className="input" required />
                </div>

                <div className="sm:col-span-2">
                    <label htmlFor="product-images" className="label">Images (up to 10)</label>
                    <input id="product-images" type="file" name="images" accept="image/*" multiple className="input" />
                </div>

                <div className="flex items-end justify-end sm:col-span-2 lg:col-span-1">
                    <button type="submit" disabled={isPending} className="btn btn-primary w-full lg:w-auto">
                        <LuPlus className="size-4" />
                        {isPending ? "Adding…" : "Add product"}
                    </button>
                </div>
            </form>
        </section>
    );
}
