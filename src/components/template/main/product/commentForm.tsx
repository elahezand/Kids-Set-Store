"use client";

import { IoMdStar } from "react-icons/io";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateComment } from "@/services/client/comment";
import { commentValidationSchema } from "@/validators/comment";
import type { CommentFormValues, Recommendation, SelectOption } from "@/types";

const EMPTY: CommentFormValues = { rating: 0, body: "", recommendation: "no_idea" };

const RECOMMENDATIONS: SelectOption<Recommendation>[] = [
  { value: "recommended", label: "I recommend it" },
  { value: "not_recommended", label: "I don't recommend it" },
  { value: "no_idea", label: "Not sure" },
];

/* Only buyers can review; new reviews are "pending" until an admin approves them */
const CommentForm = ({ productId }: { productId: string }) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CommentFormValues>({
    // rating is z.coerce -> input type unknown, output number
    resolver: zodResolver(commentValidationSchema) as unknown as Resolver<CommentFormValues>,
    defaultValues: EMPTY,
  });

  const rating = watch("rating");
  const { mutate: sendComment, isPending } = useCreateComment({ onCreated: () => reset(EMPTY) });

  return (
    <form
      onSubmit={handleSubmit((data) => sendComment({ productId, ...data }))}
      className="card card-body w-full"
      noValidate
    >
      <p className="mb-4 text-sm font-semibold text-text dark:text-gray-100">Write your review</p>

      <div className="flex flex-wrap items-baseline gap-3.5">
        <p className="text-sm text-gray-700 dark:text-gray-300">Your rating:</p>

        <div className="flex gap-0.5 pt-1 text-xl" role="radiogroup" aria-label="Rating">
          {Array.from({ length: 5 }, (_, index) => {
            const value = index + 1;
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={rating === value}
                aria-label={`${value} star${value > 1 ? "s" : ""}`}
                onClick={() => setValue("rating", value, { shouldValidate: true, shouldDirty: true })}
              >
                <IoMdStar className={value <= rating ? "text-orange-500" : "text-gray-500 dark:text-gray-400"} />
              </button>
            );
          })}
        </div>

        {errors.rating && <span className="field-error">{errors.rating.message}</span>}
      </div>

      <fieldset className="mt-4 flex flex-wrap gap-4 text-sm">
        <legend className="sr-only">Recommendation</legend>
        {RECOMMENDATIONS.map((option) => (
          <label key={option.value} className="flex cursor-pointer items-center gap-1.5">
            <input type="radio" value={option.value} {...register("recommendation")} />
            {option.label}
          </label>
        ))}
      </fieldset>

      <div className="mt-5 grid w-full gap-1.5">
        <label htmlFor="comment" className="label">
          Your review <span className="text-danger-500">*</span>
        </label>
        <textarea
          id="comment"
          rows={6}
          placeholder="What did you like or dislike?"
          className="input resize-none"
          {...register("body")}
        />
        {errors.body && <span className="field-error">{errors.body.message}</span>}
      </div>

      <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">Only customers who bought this product can review it.</p>

      <button type="submit" disabled={isPending} className="btn btn-primary mt-4 w-full disabled:opacity-60 sm:w-auto">
        {isPending ? "Sending..." : "Submit Review"}
      </button>
    </form>
  );
};

export default CommentForm;
