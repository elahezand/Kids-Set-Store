"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Modal from "@/components/modules/ui/modal";
import { useSaveDepartment } from "@/services/client/admin";
import type { AdminDepartment } from "@/types";

const schema = z.object({
  title: z.string().trim().min(2, "At least 2 characters").max(80, "At most 80 characters"),
  description: z.string().trim().max(300, "At most 300 characters"),
  order: z.coerce.number().int("Whole numbers only").min(0, "0 or more"),
  isActive: z.boolean(),
});

type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

interface DepartmentFormProps {
  department?: AdminDepartment | null;
  nextOrder: number;
  onClose: () => void;
}

export default function DepartmentForm({ department, nextOrder, onClose }: DepartmentFormProps) {
  const editing = Boolean(department);
  const save = useSaveDepartment(department?.id, { onDone: onClose });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: department?.title ?? "",
      description: department?.description ?? "",
      order: department?.order ?? nextOrder,
      isActive: department?.isActive ?? true,
    },
  });

  return (
    <Modal
      title={editing ? `Edit ${department?.title}` : "New department"}
      description="Customers pick a department when they open a support ticket."
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className="btn btn-secondary" disabled={save.isPending}>
            Cancel
          </button>
          <button type="submit" form="department-form" className="btn btn-primary" disabled={save.isPending}>
            {save.isPending ? "Saving…" : editing ? "Save changes" : "Create department"}
          </button>
        </>
      }
    >
      <form
        id="department-form"
        onSubmit={handleSubmit((values) => save.mutate(values))}
        noValidate
        className="grid gap-5 sm:grid-cols-[1fr_7rem]"
      >
        <div>
          <label htmlFor="department-title" className="label">
            Title
          </label>
          <input
            id="department-title"
            {...register("title")}
            placeholder="Orders & delivery"
            autoComplete="off"
            className={`input ${errors.title ? "input-error" : ""}`}
          />
          {errors.title && <span className="field-error">{errors.title.message}</span>}
        </div>

        <div>
          <label htmlFor="department-order" className="label">
            Position
          </label>
          <input
            id="department-order"
            type="number"
            min={0}
            {...register("order")}
            className={`input tabular-nums ${errors.order ? "input-error" : ""}`}
          />
          {errors.order && <span className="field-error">{errors.order.message}</span>}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="department-description" className="label">
            Description
          </label>
          <textarea
            id="department-description"
            rows={3}
            {...register("description")}
            placeholder="Optional. What this team handles."
            className={`input resize-y ${errors.description ? "input-error" : ""}`}
          />
          {errors.description && <span className="field-error">{errors.description.message}</span>}
        </div>

        <label className="flex cursor-pointer items-center gap-3 sm:col-span-2">
          <input type="checkbox" {...register("isActive")} className="checkbox" />
          <span className="text-sm text-gray-800 dark:text-gray-300">Customers can choose it</span>
        </label>
      </form>
    </Modal>
  );
}
