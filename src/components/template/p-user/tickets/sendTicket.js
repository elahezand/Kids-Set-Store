"use client";
import React, { useEffect, useState } from "react";
import { IoIosSend } from "react-icons/io";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePost } from "@/utils/hooks/useReactQueryPanel";
import toast from "react-hot-toast";
import styles from "./sendTicket.module.css";
import { ticketValidationSchema } from "../../../../../validators/ticket";

export default function SendTicket({ user }) {
    const [departments, setDepartments] = useState([]);
    const [subDepartments, setSubDepartments] = useState([]);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(ticketValidationSchema),
        defaultValues: {
            title: "",
            department: "",
            subDepartment: "",
            priority: "1",
            content: "",
        },
    });

    const watchDepartment = watch("department");

    // fetch departments
    useEffect(() => {
        const getDepartments = async () => {
            const res = await fetch("/api/departments");
            if (res.ok) {
                const result = await res.json();
                setDepartments(result.departments);
            }
        };
        getDepartments();
    }, []);

    // fetch subDepartments when department changes
    useEffect(() => {
        const getSubDepartments = async () => {
            if (!watchDepartment) return;
            const res = await fetch("/api/subDepartments");
            if (res.ok) {
                const result = await res.json();

                const relatedSub = result.subDepartments.filter(
                    (item) => item.department._id === watchDepartment
                );

                setSubDepartments(relatedSub);
                setValue("subDepartment", ""); // reset subDepartment on department change
            }
        };
        getSubDepartments();
    }, [watchDepartment, setValue]);

    const { mutate, isLoading } = usePost("/tickets", {
        onSuccess: () => {
            toast.success("Ticket sent successfully :)");
            reset();
        },
        onError: () => {
            toast.error("Failed to send ticket :(");
        },
    });

    const onSubmit = (data) => {
        mutate({
            title: data.title,
            department: data.department,
            subDepartment: data.subDepartment,
            priority: data.priority,
            content: data.content,
            isAnswer:0,
            answer:0
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}
            className={styles.form}>
            <h1 className="title">Send Ticket</h1>
            <div className={styles.group}>
                <label>Department:</label>
                <select {...register("department")}>
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                        <option key={d._id} value={d._id}>
                            {d.title}
                        </option>
                    ))}
                </select>
                {errors.department && <p className={styles.error}>{errors.department.message}</p>}
            </div>

            <div className={styles.group}>
                <label>SubDepartment:</label>
                <select {...register("subDepartment")}>
                    <option value="">Select SubDepartment</option>
                    {subDepartments.map((s) => (
                        <option key={s._id} value={s._id}>
                            {s.title}
                        </option>
                    ))}
                </select>
                {errors.subDepartment && <p className={styles.error}>{errors.subDepartment.message}</p>}
            </div>

            <div className={styles.group}>
                <label>Title:</label>
                <input type="text" {...register("title")} />
                {errors.title && <p className={styles.error}>{errors.title.message}</p>}
            </div>

            <div className={styles.group}>
                <label>Priority:</label>
                <select {...register("priority")}>
                    <option value="1">Low</option>
                    <option value="2">Medium</option>
                    <option value="3">High</option>
                </select>
                {errors.priority && <p className={styles.error}>{errors.priority.message}</p>}
            </div>

            <div className={styles.group}>
                <label>Content:</label>
                <textarea {...register("content")} rows={6}></textarea>
                {errors.content && <p className={styles.error}>{errors.content.message}</p>}
            </div>

            <button type="submit" className={styles.btn} disabled={isLoading}>
                {isLoading ? "Sending..." : <><IoIosSend /> Send</>}
            </button>
        </form>
    );
}
