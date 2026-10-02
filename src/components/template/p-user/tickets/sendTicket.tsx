"use client";

import { useEffect } from "react";
import { LuSend } from "react-icons/lu";
import { useForm, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { ticketValidationSchema } from "@/validators/ticket";
import { useCreateTicket, useDepartments } from "@/services/client/panel";
import { TICKET_PRIORITY } from "@/utils/panelView";
import type { TicketPriority } from "@/types";

type TicketInput = z.input<typeof ticketValidationSchema>;
type TicketOutput = z.output<typeof ticketValidationSchema>;

const EMPTY: TicketInput = { title: "", department: "", subDepartment: "", priority: "1", content: "" };

export default function SendTicket() {
  const { data, isLoading } = useDepartments();
  const departments = data?.data ?? [];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TicketInput, unknown, TicketOutput>({
    resolver: zodResolver(ticketValidationSchema),
    defaultValues: EMPTY,
  });

  const departmentId = watch("department");
  const subDepartments = departments.find((item) => String(item._id) === departmentId)?.subDepartments ?? [];

  // a new department -> the old sub-department no longer fits
  useEffect(() => {
    setValue("subDepartment", "");
  }, [departmentId, setValue]);

  const { mutate, isPending } = useCreateTicket({ onCreated: () => reset(EMPTY) });

  const onSubmit = (values: TicketOutput) =>
    mutate({ ...values, priority: values.priority as TicketPriority });

  const error = (name: FieldPath<TicketInput>) =>
    errors[name]?.message ? <span className="field-error">{String(errors[name]?.message)}</span> : null;

  return (
    <section className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">Open a new ticket</h2>
          <p className="mt-0.5 text-xs text-gray-700 dark:text-gray-500">Our support team usually replies within 24 hours.</p>
        </div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="card-body grid gap-5 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
        <div>
          <label htmlFor="ticket-department" className="label">
            Department
          </label>
          <select
            id="ticket-department"
            {...register("department")}
            disabled={isLoading}
            className={`input ${errors.department ? "input-error" : ""}`}
          >
            <option value="">{isLoading ? "Loading…" : "Select department"}</option>
            {departments.map((item) => (
              <option key={String(item._id)} value={String(item._id)}>
                {item.title}
              </option>
            ))}
          </select>
          {error("department")}
        </div>

        <div>
          <label htmlFor="ticket-sub" className="label">
            Sub-department
          </label>
          <select
            id="ticket-sub"
            {...register("subDepartment")}
            disabled={!subDepartments.length}
            className={`input ${errors.subDepartment ? "input-error" : ""}`}
          >
            <option value="">{departmentId ? "Select sub-department" : "Choose a department first"}</option>
            {subDepartments.map((item) => (
              <option key={String(item._id)} value={String(item._id)}>
                {item.title}
              </option>
            ))}
          </select>
          {error("subDepartment")}
        </div>

        <div>
          <label htmlFor="ticket-title" className="label">
            Subject
          </label>
          <input
            id="ticket-title"
            type="text"
            {...register("title")}
            placeholder="Briefly describe the issue"
            className={`input ${errors.title ? "input-error" : ""}`}
          />
          {error("title")}
        </div>

        <div>
          <label htmlFor="ticket-priority" className="label">
            Priority
          </label>
          <select id="ticket-priority" {...register("priority")} className="input">
            {Object.entries(TICKET_PRIORITY).map(([value, item]) => (
              <option key={value} value={value}>
                {item.label}
              </option>
            ))}
          </select>
          {error("priority")}
        </div>

        <div className="sm:col-span-2 xl:col-span-1 2xl:col-span-2">
          <label htmlFor="ticket-content" className="label">
            Message
          </label>
          <textarea
            id="ticket-content"
            {...register("content")}
            rows={6}
            placeholder="Tell us more…"
            className={`input ${errors.content ? "input-error" : ""}`}
          />
          {error("content")}
        </div>

        <div className="flex justify-end sm:col-span-2 xl:col-span-1 2xl:col-span-2">
          <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={isPending}>
            <LuSend className="size-4" />
            {isPending ? "Sending…" : "Send ticket"}
          </button>
        </div>
      </form>
    </section>
  );
}
