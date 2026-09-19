"use client";
import { useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { usePut } from "@/utils/hooks/useReactQuery";
import { profileValidationSchema } from "../../../../validators/user";

const DEFAULT_AVATAR = "/images/user-profile-flat-illustration-avatar-person-icon-gender-neutral-silhouette-profile-picture-free-vector.jpg";

// Account details form — shared by admin "detail-account" and user "detail-profile"
export default function ProfileForm({ userData }) {
    const router = useRouter();
    const fileInputRef = useRef(null);

    const { mutate, isPending } = usePut("/users", {
        onSuccess: () => {
            toast.success("Profile updated successfully");
            router.refresh();
        },
    });

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(profileValidationSchema),
        defaultValues: {
            username: userData?.username || "",
            email: userData?.email || "",
            phone: userData?.phone || "",
            password: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    const onSubmit = (values) => {
        const data = new FormData();
        Object.entries(values).forEach(([key, val]) => {
            if (val !== null && val !== undefined && val !== "") data.append(key, val);
        });
        if (fileInputRef.current?.files?.[0]) data.append("avatar", fileInputRef.current.files[0]);
        mutate({ id: userData?._id || userData?.id, payload: data });
    };

    const field = (name, label, type = "text", extra = {}) => (
        <div>
            <label htmlFor={name} className="label">{label}</label>
            <input id={name} type={type} {...register(name)} {...extra}
                className={`input ${errors[name] ? "input-error" : ""}`} />
            {errors[name] && <span className="field-error">{errors[name].message}</span>}
        </div>
    );

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-6 lg:grid-cols-3">
            <section className="card p-6 text-center lg:col-span-1">
                <Image
                    width={112}
                    height={112}
                    src={userData?.avatar || DEFAULT_AVATAR}
                    alt=""
                    className="mx-auto size-28 rounded-full object-cover ring-4 ring-sage-100 dark:ring-white/10"
                />
                <p className="mt-4 font-semibold text-gray-900 dark:text-gray-100">{userData?.username}</p>
                <p className="text-sm text-gray-700 dark:text-gray-500">{userData?.email}</p>
                {userData?.role && <span className="badge badge-success mt-3">{userData.role}</span>}
                <div className="mt-6 text-left">
                    <label htmlFor="avatar" className="label">Profile picture</label>
                    <input id="avatar" type="file" accept="image/*" ref={fileInputRef} className="input" />
                    <span className="field-hint">PNG or JPG, square images look best.</span>
                </div>
            </section>

            <div className="space-y-6 lg:col-span-2">
                <section className="card">
                    <div className="card-header">
                        <h2 className="card-title">Personal information</h2>
                    </div>
                    <div className="card-body grid gap-5 sm:grid-cols-2">
                        {field("username", "Username")}
                        {field("email", "Email", "email")}
                        {field("phone", "Phone", "tel")}
                    </div>
                </section>

                <section className="card">
                    <div className="card-header">
                        <div>
                            <h2 className="card-title">Change password</h2>
                            <p className="mt-0.5 text-xs text-gray-700 dark:text-gray-500">Leave empty to keep your current password.</p>
                        </div>
                    </div>
                    <div className="card-body grid gap-5 sm:grid-cols-3">
                        {field("password", "Current password", "password", { autoComplete: "current-password" })}
                        {field("newPassword", "New password", "password", { autoComplete: "new-password" })}
                        {field("confirmPassword", "Confirm password", "password", { autoComplete: "new-password" })}
                    </div>
                </section>

                <div className="flex justify-end">
                    <button type="submit" disabled={isPending} className="btn btn-primary btn-lg">
                        {isPending ? "Saving…" : "Save changes"}
                    </button>
                </div>
            </div>
        </form>
    );
}
