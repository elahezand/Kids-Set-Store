"use client";

import { IoMdStar } from "react-icons/io";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { usePost } from "@/utils/hooks/useReactQuery";
import { commentValidationSchema } from "@/validators/comment";

const CommentForm = ({ productId }) => {
    const queryClient = useQueryClient();

    const emptyValues = {
        rating: 0,
        body: "",
    };

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(commentValidationSchema),
        defaultValues: emptyValues,
    });

    const rating = watch("rating");

    const { mutate: sendComment, isPending } = usePost(
        "/user/comment",
        {
            errorFallback: "Failed to send comment",

            onSuccess: () => {
                queryClient.invalidateQueries({
                    queryKey: ["comments", productId],
                });

                reset(emptyValues);
            },
        }
    );

    const onSubmit = (data) => {
        sendComment({
            productId,
            rating: data.rating,
            body: data.body,
        });
    };

    const ratingHandler = (value) => {
        setValue("rating", value, {
            shouldValidate: true,
            shouldDirty: true,
        });
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="card card-body w-full"
            noValidate
        >
            <p className="mb-4 text-sm font-semibold text-text dark:text-gray-100">
                Write Your Comment:
            </p>

            <div className="flex items-baseline gap-3.5">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                    Your Rating:
                </p>

                <div
                    className="flex gap-0.5 pt-1 text-lg"
                    role="radiogroup"
                    aria-label="Rating"
                >
                    {Array.from({ length: 5 }, (_, index) => {
                        const value = index + 1;

                        return (
                            <button
                                key={value}
                                type="button"
                                role="radio"
                                aria-checked={rating === value}
                                aria-label={`${value} star${
                                    value > 1 ? "s" : ""
                                }`}
                                onClick={() =>
                                    ratingHandler(value)
                                }
                            >
                                <IoMdStar
                                    className={
                                        value <= rating
                                            ? "text-orange-500"
                                            : "text-gray-500 dark:text-gray-400"
                                    }
                                />
                            </button>
                        );
                    })}
                </div>

                {errors.rating && (
                    <span className="field-error">
                        {errors.rating.message}
                    </span>
                )}
            </div>

            <div className="mt-5 grid w-full gap-1.5">
                <label htmlFor="comment" className="label">
                    Your Comment{" "}
                    <span className="text-danger-500">
                        *
                    </span>
                </label>

                <textarea
                    id="comment"
                    rows={8}
                    placeholder="Enter your comment here..."
                    className="input resize-none"
                    {...register("body")}
                />

                {errors.body && (
                    <span className="field-error">
                        {errors.body.message}
                    </span>
                )}
            </div>

            <div className="my-5" />

            <button
                type="submit"
                disabled={isPending}
                className="btn btn-primary w-full disabled:opacity-60 sm:w-auto"
            >
                {isPending
                    ? "Sending..."
                    : "Submit Review"}
            </button>
        </form>
    );
};

export default CommentForm;
