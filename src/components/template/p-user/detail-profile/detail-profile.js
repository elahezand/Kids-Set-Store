"use client";
import React from "react";
import styles from "../../../template/p-admin/detail-account/detail.account.module.css";
import { usePut } from "@/utils/hooks/useReactQueryPanel";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userValidationSchema } from "@/components/modules/modals/editModal";
import { useRouter } from "next/navigation";
function DetailProfile(userData) {
    const router = useRouter();
    const fileInputRef = React.useRef(null);

    const { mutate: userMutate, isPending } = usePut(`/users/`, {
        onSuccess: () => {
            toast.success("User updated successfully :)");
            router.refresh();
        },
    });

    const {
        register: formRegister,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(userValidationSchema),
        defaultValues: {
            username: userData.username,
            email: userData.email,
            phone: userData.phone,
            password: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    const onSubmit = (values) => {
        const data = new FormData();
        Object.entries(values).forEach(([key, val]) => {
            if (val !== null && val !== "") {
                data.append(key, val);
            }
        });

        if (fileInputRef.current?.files?.[0]) {
            data.append("avatar", fileInputRef.current.files[0]);
        }

        userMutate({ id: userData.id, payload: data });
    };


    return (
         <section className={styles.detail}>
           <form onSubmit={handleSubmit(onSubmit)} noValidate>
             <div className={styles.detail_main}>
               {/* Username */}
               <div>
                 <label>Username</label>
                 <input
                   type="text"
                   {...formRegister("username")}
                   required
                   className={errors.username ? styles.input_error : ""}
                 />
                 {errors.username && (
                   <span className={styles.error_text}>{errors.username.message}</span>
                 )}
               </div>
     
               {/* Email */}
               <div>
                 <label>Email</label>
                 <input
                   type="email"
                   {...formRegister("email")}
                   required
                   className={errors.email ? styles.input_error : ""}
                 />
                 {errors.email && (
                   <span className={styles.error_text}>{errors.email.message}</span>
                 )}
               </div>
     
               {/* Phone */}
               <div>
                 <label>Phone</label>
                 <input
                   type="text"
                   {...formRegister("phone")}
                   required
                   className={errors.phone ? styles.input_error : ""}
                 />
                 {errors.phone && (
                   <span className={styles.error_text}>{errors.phone.message}</span>
                 )}
               </div>
     
               {/* Avatar */}
               <div>
                 <label>Profile Picture</label>
                 <input
                   type="file"
                   accept="image/*"
                   ref={fileInputRef}
                   className={styles.file_input}
                 />
               </div>
     
               {/* Password */}
               <div>
                 <label>Current Password</label>
                 <input
                   type="password"
                   {...formRegister("password")}
                   className={errors.password ? styles.input_error : ""}
                 />
               </div>
               <div>
                 <label>New Password</label>
                 <input
                   type="password"
                   {...formRegister("newPassword")}
                   className={errors.newPassword ? styles.input_error : ""}
                 />
               </div>
               <div>
                 <label>Confirm New Password</label>
                 <input
                   type="password"
                   {...formRegister("confirmPassword")}
                   className={errors.confirmPassword ? styles.input_error : ""}
                 />
               </div>
     
               <button type="submit" disabled={isPending} className={styles.submit_btn}>
                 {isPending ? "Updating..." : "Update Details"}
               </button>
             </div>
           </form>
         </section>
    );
}

export default DetailProfile;
