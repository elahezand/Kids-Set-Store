"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePut } from "@/utils/hooks/useReactQueryPanel";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import styles from "./editModal.module.css";
import { z } from "zod";

export const userValidationSchema = z.object({
  username: z.string().min(2, "Username too short"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Invalid phone"),
});

const EditModal = ({ hideModal, data }) => {
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      username: data?.username || "",
      email: data?.email || "",
      phone: data?.phone || "",
    },
    resolver: zodResolver(userValidationSchema),
  });

  const mutation = usePut(`/users`, {
    onSuccess: () => {
      toast.success("User Updated Successfully :)");
      hideModal();
      router.refresh();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Update failed");
    }
  });

  const onSubmit = (formData) => {
    if (!data?._id) {
      toast.error("User ID is missing!");
      return;
    }
    mutation.mutate({ id: data._id, payload: formData });
  };

  return (
    <div className={styles.modal_container} id="edit-modal">
      <div className={styles.modal_bg} onClick={hideModal}></div>
      <div className={styles.box_modal}>
        <h1 className={styles.modal_title}>Edit User Details</h1>
        <form onSubmit={handleSubmit(onSubmit)} className={styles.edit_user_form}>
          <div className={styles.inputBox}>
            <input {...register("username")} type="text" placeholder="Name.." className={errors.username ? styles.input_error : ""} />
            {errors.username && <span className={styles.error_text}>{errors.username.message}</span>}
          </div>

          <div className={styles.inputBox}>
            <input {...register("email")} type="text" placeholder="Email.." className={errors.email ? styles.input_error : ""} />
            {errors.email && <span className={styles.error_text}>{errors.email.message}</span>}
          </div>

          <div className={styles.inputBox}>
            <input {...register("phone")} type="text" placeholder="Phone.." className={errors.phone ? styles.input_error : ""} />
            {errors.phone && <span className={styles.error_text}>{errors.phone.message}</span>}
          </div>

          <button type="submit" className={styles.btn_action} disabled={mutation.isLoading}>
            {mutation.isLoading ? "Updating..." : "Update User"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditModal;
