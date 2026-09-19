"use client";

import { useEffect, useState } from "react";
import { IoMdStar } from "react-icons/io";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { usePost } from "@/utils/hooks/useReactQuery";
import { commentValidationSchema } from "../../../../../validators/comment";

const USER_DATA_KEY = "userData";

const getSavedUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_DATA_KEY));
  } catch {
    return null;
  }
};

const CommentForm = ({ productID }) => {
  const queryClient = useQueryClient();
  const [rememberMe, setRememberMe] = useState(false);

  const emptyValues = {
    score: 0,
    productID,
    body: "",
    username: "",
    email: "",
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(commentValidationSchema),
    defaultValues: emptyValues,
  });

  const score = watch("score");

  useEffect(() => {
    const savedUser = getSavedUser();

    if (savedUser) {
      setValue("username", savedUser.name ?? "");
      setValue("email", savedUser.email ?? "");
      setRememberMe(true);
    }
  }, [setValue]);

  const { mutate: sendComment, isPending } = usePost("/comments", {
    errorFallback: "Failed to send comment",
    onSuccess: () => {
      toast.success("Your comment was sent successfully :)");

      queryClient.invalidateQueries({
        predicate: (query) =>
          typeof query.queryKey[0] === "string" &&
          query.queryKey[0].startsWith("/comments"),
      });

      const { username, email } = getValues();
      reset({
        ...emptyValues,
        ...(rememberMe && { username, email }),
      });
    },
  });

  const onSubmit = (data) => {
    if (rememberMe) {
      localStorage.setItem(
        USER_DATA_KEY,
        JSON.stringify({ name: data.username, email: data.email })
      );
    } else {
      localStorage.removeItem(USER_DATA_KEY);
    }

    sendComment({ ...data, productID });
  };

  const scoreHandler = (value) => {
    setValue("score", value, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="card card-body w-full"
      noValidate
    >
      <p className="mb-4 text-sm font-semibold text-text dark:text-gray-100">
        Write Your Comment :
      </p>

      <div className="flex items-baseline gap-3.5">
        <p className="text-sm text-gray-700 dark:text-gray-300">Your Rating :</p>

        <div className="flex gap-0.5 pt-1 text-lg" role="radiogroup" aria-label="Rating">
          {Array.from({ length: 5 }, (_, index) => {
            const value = index + 1;

            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={score === value}
                aria-label={`${value} star${value > 1 ? "s" : ""}`}
                onClick={() => scoreHandler(value)}
              >
                <IoMdStar
                  className={
                    value <= score
                      ? "text-orange-500"
                      : "text-gray-500 dark:text-gray-400"
                  }
                />
              </button>
            );
          })}
        </div>

        {errors.score && (
          <span className="field-error">{errors.score.message}</span>
        )}
      </div>

      <div className="mt-5 grid w-full gap-1.5">
        <label htmlFor="comment" className="label">
          Your Comment <span className="text-danger-500"> * </span>
        </label>
        <textarea
          id="comment"
          rows={8}
          placeholder="Enter your comment here..."
          className="input resize-none"
          {...register("body")}
        />
        {errors.body && (
          <span className="field-error">{errors.body.message}</span>
        )}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="mt-5 grid w-full gap-1.5">
          <label htmlFor="comment-username" className="label">
            Name <span className="text-danger-500"> * </span>
          </label>
          <input
            id="comment-username"
            type="text"
            autoComplete="name"
            className="input"
            {...register("username")}
          />
          {errors.username && (
            <span className="field-error">{errors.username.message}</span>
          )}
        </div>

        <div className="mt-5 grid w-full gap-1.5">
          <label htmlFor="comment-email" className="label">
            Email <span className="text-danger-500"> * </span>
          </label>
          <input
            id="comment-email"
            type="email"
            autoComplete="email"
            className="input"
            {...register("email")}
          />
          {errors.email && (
            <span className="field-error">{errors.email.message}</span>
          )}
        </div>
      </div>

      <label className="my-5 flex cursor-pointer items-baseline justify-end gap-3.5">
        <input
          type="checkbox"
          className="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
        />
        <span className="text-sm">
          Save my Name and Email in this browser for the next time.
        </span>
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="btn btn-primary w-full disabled:opacity-60 sm:w-auto"
      >
        {isPending ? "Sending..." : "Submit Review"}
      </button>
    </form>
  );
};

export default CommentForm;