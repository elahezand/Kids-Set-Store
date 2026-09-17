"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LuSend } from "react-icons/lu";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePost } from "@/utils/hooks/useReactQueryPanel";
import toast from "react-hot-toast";
import { ticketValidationSchema } from "../../../../../validators/ticket";

export default function SendTicket() {
    const router = useRouter();
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
                setValue("subDepartment", "");
            }
        };
        getSubDepartments();
    }, [watchDepartment, setValue]);

    const { mutate, isPending } = usePost("/tickets", {
        onSuccess: () => {
            toast.success("Ticket sent successfully :)");
            reset();
            router.refresh();
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
            isAnswer: 0,
            answer: 0
        });
    };

    const error = (name) => errors[name] && <span className="field-error">{errors[name].message}</span>;

    return (
        <section className="card">
            <div className="card-header">
                <div>
                    <h2 className="card-title">Open a new ticket</h2>
                    <p className="mt-0.5 text-xs text-gray-700 dark:text-gray-500">Our support team usually replies within 24 hours.</p>
                </div>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="card-body grid gap-5 sm:grid-cols-2">
                <div>
                    <label htmlFor="ticket-department" className="label">Department</label>
                    <select id="ticket-department" {...register("department")} className={`input ${errors.department ? "input-error" : ""}`}>
                        <option value="">Select department</option>
                        {departments.map((d) => (
                            <option key={d._id} value={d._id}>{d.title}</option>
                        ))}
                    </select>
                    {error("department")}
                </div>

                <div>
                    <label htmlFor="ticket-sub" className="label">Sub-department</label>
                    <select id="ticket-sub" {...register("subDepartment")} disabled={!subDepartments.length}
                        className={`input ${errors.subDepartment ? "input-error" : ""}`}>
                        <option value="">Select sub-department</option>
                        {subDepartments.map((s) => (
                            <option key={s._id} value={s._id}>{s.title}</option>
                        ))}
                    </select>
                    {error("subDepartment")}
                </div>

                <div>
                    <label htmlFor="ticket-title" className="label">Subject</label>
                    <input id="ticket-title" type="text" {...register("title")} placeholder="Briefly describe the issue"
                        className={`input ${errors.title ? "input-error" : ""}`} />
                    {error("title")}
                </div>

                <div>
                    <label htmlFor="ticket-priority" className="label">Priority</label>
                    <select id="ticket-priority" {...register("priority")} className="input">
                        <option value="1">Low</option>
                        <option value="2">Medium</option>
                        <option value="3">High</option>
                    </select>
                    {error("priority")}
                </div>

                <div className="sm:col-span-2">
                    <label htmlFor="ticket-content" className="label">Message</label>
                    <textarea id="ticket-content" {...register("content")} rows={6} placeholder="Tell us more…"
                        className={`input ${errors.content ? "input-error" : ""}`} />
                    {error("content")}
                </div>

                <div className="flex justify-end sm:col-span-2">
                    <button type="submit" className="btn btn-primary" disabled={isPending}>
                        <LuSend className="size-4" />
                        {isPending ? "Sending…" : "Send ticket"}
                    </button>
                </div>
            </form>
        </section>
    );
}
