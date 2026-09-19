"use client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { LuPlus } from "react-icons/lu";
import { usePost } from "@/utils/hooks/useReactQuery";
import { discountSchema } from "../../../../../validators/discount";

export default function AddDiscount({ products = [] }) {
    const router = useRouter();

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: zodResolver(discountSchema),
        defaultValues: {
            code: "",
            percent: 0,
            max: 1,
            product: products[0]?._id || "",
        },
    });

    const { mutate, isPending } = usePost("/discount", {
        onSuccess: () => {
            toast.success("Discount added successfully");
            reset();
            router.refresh();
        },
    });

    const error = (name) => errors[name] && <span className="field-error">{errors[name].message}</span>;

    return (
        <section className="card mb-6">
            <div className="card-header">
                <h2 className="card-title">Add new code</h2>
            </div>
            <form onSubmit={handleSubmit((data) => mutate(data))} className="card-body grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                    <label htmlFor="discount-code" className="label">Code</label>
                    <input id="discount-code" {...register("code")} type="text" placeholder="SUMMER25"
                        className={`input uppercase ${errors.code ? "input-error" : ""}`} />
                    {error("code")}
                </div>
                <div>
                    <label htmlFor="discount-percent" className="label">Percent</label>
                    <input id="discount-percent" {...register("percent", { valueAsNumber: true })} type="number" min={0} max={100}
                        className={`input ${errors.percent ? "input-error" : ""}`} />
                    {error("percent")}
                </div>
                <div>
                    <label htmlFor="discount-max" className="label">Max usage</label>
                    <input id="discount-max" {...register("max", { valueAsNumber: true })} type="number" min={1}
                        className={`input ${errors.max ? "input-error" : ""}`} />
                    {error("max")}
                </div>
                <div>
                    <label htmlFor="discount-product" className="label">Product</label>
                    <select id="discount-product" {...register("product")} className={`input ${errors.product ? "input-error" : ""}`}>
                        <option value="">Select a product</option>
                        {products.map((item) => (
                            <option key={item._id} value={item._id}>{item.name}</option>
                        ))}
                    </select>
                    {error("product")}
                </div>
                <div className="flex justify-end sm:col-span-2 lg:col-span-4">
                    <button type="submit" disabled={isPending} className="btn btn-primary">
                        <LuPlus className="size-4" />
                        {isPending ? "Creating…" : "Create code"}
                    </button>
                </div>
            </form>
        </section>
    );
}
