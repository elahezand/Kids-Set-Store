"use client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { usePut } from "@/utils/hooks/useReactQuery";
import Modal from "@/components/modules/ui/modal";
import { userUpdateSchema } from "../../../../../validators/user";

export default function EditUserModal({ hideModal, data }) {
    const router = useRouter();

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(userUpdateSchema),
        defaultValues: {
            username: data?.username || "",
            email: data?.email || "",
            phone: data?.phone || "",
        },
    });

    const { mutate, isPending } = usePut("/users", {
        onSuccess: () => {
            toast.success("User updated successfully");
            hideModal();
            router.refresh();
        },
        onError: (err) => toast.error(err.response?.data?.message || "Update failed"),
    });

    const onSubmit = (formData) => {
        if (!data?._id) return toast.error("User ID is missing!");
        mutate({ id: data._id, payload: formData });
    };

    const field = (name, label, type = "text") => (
        <div>
            <label htmlFor={`user-${name}`} className="label">{label}</label>
            <input id={`user-${name}`} type={type} {...register(name)} className={`input ${errors[name] ? "input-error" : ""}`} />
            {errors[name] && <span className="field-error">{errors[name].message}</span>}
        </div>
    );

    return (
        <Modal
            title="Edit user"
            description={data?.email}
            hideModal={hideModal}
            footer={
                <>
                    <button type="button" onClick={hideModal} className="btn btn-secondary">Cancel</button>
                    <button type="submit" form="edit-user-form" disabled={isPending} className="btn btn-primary">
                        {isPending ? "Updating…" : "Update user"}
                    </button>
                </>
            }
        >
            <form id="edit-user-form" onSubmit={handleSubmit(onSubmit)} className="grid gap-5">
                {field("username", "Username")}
                {field("email", "Email", "email")}
                {field("phone", "Phone", "tel")}
            </form>
        </Modal>
    );
}
