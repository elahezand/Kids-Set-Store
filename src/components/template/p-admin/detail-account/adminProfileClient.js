"use client";
import React from "react";
import toast from "react-hot-toast";
import { usePut } from "@/utils/hooks/useReactQueryPanel";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { userValidationSchema } from "../../../../../validators/user";
import styles from "./detail.account.module.css"
export default function AdminProfileClient({ adminData }) {
    const router = useRouter()
    const fileInputRef = React.useRef(null);

    const { mutate: userMutate, isPending } = usePut("/users", {
        onSuccess: () => {
            toast.success("user updated Successfully :)")
            router.refresh()
        },
    })

    // React Hook Form setup
    const {
        register: formRegister,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(userValidationSchema),
        defaultValues: {
            name: adminData.username,
            email: adminData.email,
            phone: adminData.phone,
            avatar: null,
            password: "",
            newPassword: "",
            confirmPassword: ""
        }
    })

    const onSubmit = async (values) => {
        const data = new FormData();
        Object.entries(values).forEach(([key, val]) => {
            if (val !== null && val !== "") {
                data.append(key, val);
            }
            if (fileInputRef.current?.files?.[0]) {
                data.append("avatar", fileInputRef.current.files[0]);
            }
        });

        userMutate({ id: adminData._id, payload: data })
    };

    return (
        <section className={styles.detail}>
            <form
                onSubmit={handleSubmit(onSubmit)}
                noValidate>
                <div className={styles.detail_main}>
                    {/* Name & Email */}
                    <div>
                        <label>Name</label>
                        <input
                            type="text"
                            name="name"
                            {...formRegister("name")}
                            required
                        />
                    </div>
                    <div>
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            className="form-control"
                            {...formRegister("email")}
                            required
                        />
                    </div>
                    <div className="col-md-12">
                        <label>Phone</label>
                        <input
                            type="text"
                            name="phone"
                            className="form-control"
                            {...formRegister("phone")}
                            required
                        />
                    </div>

                    {/* Avatar */}
                    <div className="col-md-12">
                        <label>Profile Picture</label>
                        <input
                            type="file"
                            name="avatar"
                            accept="image/*"
                            className="form-control"
                            ref={fileInputRef}
                        />
                    </div>

                    {/* Change Password */}
                    <div>
                        <label>Old Password</label>
                        <input
                            type="password"
                            name="password"
                            className="form-control"
                            {...formRegister("password")}

                        />
                    </div>
                    <div>
                        <label>New Password</label>
                        <input
                            type="password"
                            name="newPassword"
                            className="form-control"
                            {...formRegister("newPassword")}

                        />
                    </div>
                    <div>
                        <label>Confirm New Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            className="form-control"
                            {...formRegister("confirmPassword")}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isPending}
                        className={styles.submit_btn}>
                        {isPending ? "Sending..." : "Update Detail"}
                    </button>
                </div>
            </form>
        </section>
    );
}
