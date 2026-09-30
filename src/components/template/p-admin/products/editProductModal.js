"use client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { usePut } from "@/utils/hooks/useReactQuery";
import Modal from "@/components/modules/ui/modal";
import { productFormSchema } from "@/validators/product";
import { buildProductPayload, productToFormValues } from "@/utils/productForm";

export default function EditProductModal({ hideModal, data }) {
    const router = useRouter();

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(productFormSchema),
        defaultValues: productToFormValues(data),
    });

    const { mutate, isPending } = usePut((body) => `/admin/products/${body.id}`, {
        onSuccess: () => {
            toast.success("Product updated successfully");
            hideModal();
            router.refresh();
        },
        onError: () => toast.error("Error updating product"),
    });

    const onSubmit = (values) => {
        // images stay as they are (the update API keeps them when none are sent)
        mutate({ id: data._id, ...buildProductPayload(values) });
    };

    const field = (name, label, props = {}) => (
        <div>
            <label htmlFor={`edit-${name}`} className="label">{label}</label>
            <input
                id={`edit-${name}`}
                autoComplete="off"
                className={`input ${errors[name] ? "input-error" : ""}`}
                {...register(name, props.registerOptions)}
                {...props.input}
            />
            {errors[name] && <span className="field-error">{errors[name].message}</span>}
        </div>
    );

    return (
        <Modal
            title="Edit product"
            description={data?.title}
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
                {field("title", "Title")}
                {field("price", "Price", { input: { type: "number", step: "0.01" } })}
                {field("discount", "Discount %", { input: { type: "number" } })}
                {field("stock", "Stock (per size)", { input: { type: "number" } })}
                {field("color", "Color")}
                {field("material", "Material")}
                {field("sizes", "Sizes", { input: { placeholder: "S, M, L" } })}
                {field("tags", "Tags")}
                <div>
                    <label htmlFor="edit-status" className="label">Status</label>
                    <select id="edit-status" className="input" {...register("status")}>
                        <option value="active">Active</option>
                        <option value="draft">Draft</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
                <div className="sm:col-span-2">
                    <label htmlFor="edit-description" className="label">Description</label>
                    <textarea id="edit-description" rows={4} className={`input ${errors.description ? "input-error" : ""}`} {...register("description")} />
                    {errors.description && <span className="field-error">{errors.description.message}</span>}
                </div>
            </form>
        </Modal>
    );
}
