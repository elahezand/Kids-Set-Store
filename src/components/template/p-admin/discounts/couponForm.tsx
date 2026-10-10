"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Modal from "@/components/modules/ui/modal";
import { useCreateCoupon } from "@/services/client/admin";
import { createCouponSchema } from "@/validators/coupon";
import type { z } from "zod";
import type { CouponPayload } from "@/types";

type FormInput = z.input<typeof createCouponSchema>;
type FormOutput = z.output<typeof createCouponSchema>;

const EMPTY: FormInput = {
  code: "",
  type: "percent",
  amount: 10,
  maxDiscount: "",
  usageLimit: "",
  perUserLimit: "",
  minOrderAmount: "",
  startsAt: "",
  expiresAt: "",
  isActive: true,
};

export default function CouponForm({ onClose }: { onClose: () => void }) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormInput, unknown, FormOutput>({ resolver: zodResolver(createCouponSchema), defaultValues: EMPTY });

  const create = useCreateCoupon({ onCreated: onClose });
  const type = watch("type");

  const onSubmit = (values: FormOutput) => create.mutate(values as CouponPayload);

  const error = (name: keyof FormInput) =>
    errors[name]?.message ? <span className="field-error">{String(errors[name]?.message)}</span> : null;

  return (
    <Modal
      title="New discount code"
      description="Leave a limit empty for no limit."
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className="btn btn-secondary" disabled={create.isPending}>
            Cancel
          </button>
          <button type="submit" form="coupon-form" className="btn btn-primary" disabled={create.isPending}>
            {create.isPending ? "Creating..." : "Create code"}
          </button>
        </>
      }
    >
      <form id="coupon-form" onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="coupon-code" className="label">
            Code
          </label>
          <input
            id="coupon-code"
            {...register("code")}
            placeholder="SUMMER25"
            autoComplete="off"
            className={`input font-mono uppercase ${errors.code ? "input-error" : ""}`}
          />
          {error("code")}
        </div>

        <div>
          <label htmlFor="coupon-type" className="label">
            Type
          </label>
          <select id="coupon-type" {...register("type")} className="input">
            <option value="percent">Percent off</option>
            <option value="fixed">Fixed amount off</option>
          </select>
        </div>

        <div>
          <label htmlFor="coupon-amount" className="label">
            {type === "percent" ? "Percent" : "Amount"}
          </label>
          <input
            id="coupon-amount"
            type="number"
            min={0}
            max={type === "percent" ? 100 : undefined}
            step="0.01"
            {...register("amount")}
            className={`input ${errors.amount ? "input-error" : ""}`}
          />
          {error("amount")}
        </div>

        {type === "percent" && (
          <div>
            <label htmlFor="coupon-max" className="label">
              Max discount
            </label>
            <input
              id="coupon-max"
              type="number"
              min={0}
              step="0.01"
              {...register("maxDiscount")}
              placeholder="No cap"
              className={`input ${errors.maxDiscount ? "input-error" : ""}`}
            />
            {error("maxDiscount")}
          </div>
        )}

        <div>
          <label htmlFor="coupon-limit" className="label">
            Usage limit
          </label>
          <input
            id="coupon-limit"
            type="number"
            min={0}
            {...register("usageLimit")}
            placeholder="Unlimited"
            className={`input ${errors.usageLimit ? "input-error" : ""}`}
          />
          {error("usageLimit")}
        </div>

        <div>
          <label htmlFor="coupon-user-limit" className="label">
            Uses per customer
          </label>
          <input
            id="coupon-user-limit"
            type="number"
            min={0}
            {...register("perUserLimit")}
            placeholder="Unlimited"
            className={`input ${errors.perUserLimit ? "input-error" : ""}`}
          />
          {error("perUserLimit")}
        </div>

        <div>
          <label htmlFor="coupon-min-order" className="label">
            Minimum order
          </label>
          <input
            id="coupon-min-order"
            type="number"
            min={0}
            {...register("minOrderAmount")}
            placeholder="No minimum"
            className={`input ${errors.minOrderAmount ? "input-error" : ""}`}
          />
          {error("minOrderAmount")}
        </div>

        <div>
          <label htmlFor="coupon-starts" className="label">
            Starts
          </label>
          <input id="coupon-starts" type="date" {...register("startsAt")} className="input" />
          {error("startsAt")}
        </div>

        <div>
          <label htmlFor="coupon-expires" className="label">
            Expires
          </label>
          <input
            id="coupon-expires"
            type="date"
            {...register("expiresAt")}
            className={`input ${errors.expiresAt ? "input-error" : ""}`}
          />
          {error("expiresAt")}
        </div>

        <label className="flex cursor-pointer items-center gap-3 sm:col-span-2">
          <input type="checkbox" {...register("isActive")} className="checkbox" />
          <span className="text-sm text-gray-800 dark:text-gray-300">Enabled right away</span>
        </label>
      </form>
    </Modal>
  );
}
