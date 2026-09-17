"use client";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { usePut } from "@/utils/hooks/useReactQueryPanel";
import Modal from "@/components/modules/ui/modal";
import { productSchema } from "../../../../../validators/product";

const joinList = (value) => (Array.isArray(value) ? value.join(", ") : value || "");

export default function EditProductModal({ hideModal, data }) {
    const router = useRouter();
    const fileInputRef = useRef(null);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: data?.name || "",
            price: data?.price || 0,
            shortDescription: data?.shortDescription || "",
            longDescription: data?.longDescription || "",
            color: data?.color || "",
            material: data?.material || "",
            tags: joinList(data?.tags),
            availableSizes: joinList(data?.availableSizes),
            isAvailable: data?.isAvailable ?? true,
            categoryPath: data?.categoryPath || [],
        },
    });

    const { mutate, isPending } = usePut("/products", {
        onSuccess: () => {
            toast.success("Product updated successfully");
            hideModal();
            router.refresh();
        },
        onError: () => toast.error("Error updating product"),
    });

    const onSubmit = (values) => {
        const formData = new FormData();
        ["name", "price", "color", "material", "shortDescription", "longDescription"].forEach((key) =>
            formData.append(key, values[key] ?? "")
        );
        formData.append("tags", JSON.stringify(values.tags));
        formData.append("availableSizes", JSON.stringify(values.availableSizes));
        formData.append("categoryPath", JSON.stringify(values.categoryPath));
        if (fileInputRef.current?.files?.[0]) formData.append("img", fileInputRef.current.files[0]);
        mutate({ id: data._id, payload: formData });
    };

    const field = (name, label, props = {}) => (
        <div>
            <label htmlFor={`edit-${name}`} className="label">{label}</label>
            <input id={`edit-${name}`} autoComplete="off" className={`input ${errors[name] ? "input-error" : ""}`} {...register(name, props.registerOptions)} {...props.input} />
            {errors[name] && <span className="field-error">{errors[name].message}</span>}
        </div>
    );

    return (
        <Modal
            title="Edit product"
            description={data?.name}
            hideModal={hideModal}
            size="lg"
            footer={
                <>
                    <button type="button" onClick={hideModal} className="btn btn-secondary">Cancel</button>
                    <button type="submit" form="edit-product-form" disabled={isPending} className="btn btn-primary">
                        {isPending ? "Saving…" : "Save changes"}
                    </button>
                </>
            }
        >
            <form id="edit-product-form" onSubmit={handleSubmit(onSubmit)} className="grid gap-5 sm:grid-cols-2">
                {field("name", "Name")}
                {field("price", "Price", { registerOptions: { valueAsNumber: true }, input: { type: "number" } })}
                {field("color", "Color")}
                {field("material", "Material")}
                {field("availableSizes", "Sizes", { input: { placeholder: "S, M, L" } })}
                {field("tags", "Tags")}
                <div className="sm:col-span-2">
                    <label htmlFor="edit-img" className="label">Replace image</label>
                    <input id="edit-img" ref={fileInputRef} type="file" accept="image/*" className="input" />
                </div>
            </form>
        </Modal>
    );
}
