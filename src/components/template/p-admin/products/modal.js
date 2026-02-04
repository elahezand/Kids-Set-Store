"use client"
import React, { useEffect, useRef } from "react";
import styles from "./modal.module.css";
import { useRouter } from "next/navigation";
import { productSchema } from "../../../../../validators/product";
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { usePut } from '@/utils/hooks/useReactQueryPanel';
import swal from 'sweetalert';

const EditModal = ({ hideModal, data }) => {
    const router = useRouter();
    const fileInputRef = useRef(null);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: "",
            price: 0,
            shortDescription: "",
            longDescription: "",
            color: "",
            material: "",
            tags: "",
            availableSizes: "",
            isAvailable: true,
            categoryPath: [],
        },
    });

    useEffect(() => {
        if (!data) return;
        setValue("name", data.name);
        setValue("price", data.price);
        setValue("shortDescription", data.shortDescription);
        setValue("longDescription", data.longDescription);
        setValue("color", data.color || "");
        setValue("material", data.material || "");
        setValue("tags", Array.isArray(data.tags) ? data.tags.join(", ") : data.tags);
        setValue("availableSizes", Array.isArray(data.availableSizes) ? data.availableSizes.join(", ") : "");
        setValue("isAvailable", data.isAvailable);
        setValue("categoryPath", data.categoryPath || []);
    }, [data, setValue]);

    const { mutate } = usePut("/products", {
        onSuccess: () => {
            toast.success("Product Updated Successfully :)");
            hideModal();
            router.refresh();
        },
        onError: () => toast.error("Error updating product"),
    });

    const onSubmit = (values) => {
        const formData = new FormData();

        formData.append("name", values.name);
        formData.append("price", values.price);
        formData.append("color", values.color);
        formData.append("material", values.material);
        formData.append("shortDescription", values.shortDescription);
        formData.append("longDescription", values.longDescription);

        formData.append("tags", JSON.stringify(values.tags));
        formData.append("availableSizes", JSON.stringify(values.availableSizes));
        formData.append("categoryPath", JSON.stringify(values.categoryPath));

        if (fileInputRef.current?.files?.[0]) {
            formData.append("img", fileInputRef.current.files[0]);
        }

        mutate({ id: data._id, payload: formData });
    };
    return (
        <div className={styles.modal_container} id="edit-modal">
            <div className={styles.modal_bg} onClick={hideModal}></div>
            <div className={styles.box_modal}>
                <h1 className={styles.modal_title}>Please send New Detail</h1>
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className={styles.edit_user_form}
                >
                    <div className={styles.inputBox}>
                        <input autoComplete="off" type="text" placeholder="Name.." {...register("name")} />
                        {errors.name && <p className={styles.error_text}>{errors.name.message}</p>}
                    </div>

                    <div className={styles.inputBox}>
                        <input autoComplete="off" type="number" placeholder="Price.." {...register("price", { valueAsNumber: true })} />
                        {errors.price && <p className={styles.error_text}>{errors.price.message}</p>}
                    </div>

                    <div className={styles.inputBox}>
                        <input autoComplete="off" type="text" placeholder="Color.." {...register("color")} />
                        {errors.color && <p className={styles.error_text}>{errors.color.message}</p>}
                    </div>

                    <div className={styles.inputBox}>
                        <input autoComplete="off" type="text" placeholder="Sizes (e.g. S, M, L).." {...register("availableSizes")} />
                        {errors.availableSizes && <p className={styles.error_text}>{errors.availableSizes.message}</p>}
                    </div>

                    <div className={styles.inputBox}>
                        <input autoComplete="off" type="text" placeholder="Material.." {...register("material")} />
                        {errors.material && <p className={styles.error_text}>{errors.material.message}</p>}
                    </div>

                    <div className={styles.inputBox}>
                        <input autoComplete="off" type="text" placeholder="Tags.." {...register("tags")} />
                        {errors.tags && <p className={styles.error_text}>{errors.tags.message}</p>}
                    </div>

                    <div className={styles.inputBox}>
                        <input ref={fileInputRef} type="file" accept="image/*" />
                    </div>

                    <button className={styles.btn_action} type="submit">
                        Update Product
                    </button>
                </form>
            </div>
        </div>
    )
}

export default EditModal;