"use client"
import { IoMdStar } from "react-icons/io";
import { commentValidationSchema } from "../../../../../validators/comment";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePost } from "@/utils/hooks/useReactQueryPublic";
import toast from "react-hot-toast";

const CommentForm = ({ productID }) => {
  const [score, setScore] = useState(0);
  const [rememberMe, setRememberMe] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(commentValidationSchema),
    defaultValues: { score: 0, productID: productID }
  });

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("userData"));
    if (savedUser) {
      setValue("username", savedUser.name);
      setValue("email", savedUser.email);
    }
  }, [setValue]);

  useEffect(() => {
    setValue("score", score);
  }, [score, setValue]);

  const { mutate, isLoading } = usePost('/comments', {
    onSuccess: () => {
      toast.success("Your Comment Sent Successfully :)");
      reset();
      setScore(0);
    }
  });

  const onSubmit = (data) => {
    const finalData = { ...data, productID, score };
    if (rememberMe) {
      localStorage.setItem("userData", JSON.stringify({ name: data.username, email: data.email }));
    }
    mutate(finalData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card card-body w-full">
      <p className="mb-4 text-sm font-semibold text-text dark:text-gray-100">Write Your Comment :</p>

      <div className="flex items-baseline gap-3.5">
        <p className="text-sm text-gray-700 dark:text-gray-300">Your Rating :</p>
        <div className="flex gap-0.5 pt-1 text-lg text-gray-500 dark:text-gray-400">
          {new Array(5).fill(0).map((_, index) => (
            <IoMdStar
              className={`cursor-pointer ${index + 1 <= score ? "text-orange-500" : "text-gray-500 dark:text-gray-400"}`}
              key={index}
              onClick={() => setScore(index + 1)}
            />
          ))}
        </div>
        {errors.score && <span className="field-error">{errors.score.message}</span>}
      </div>

      <div className="mt-5 grid w-full gap-1.5">
        <label className="label">Your Comment <span className="text-danger-500"> * </span></label>
        <textarea
          {...register("body")}
          id="comment"
          cols="45"
          rows="8"
          placeholder="Enter your comment here..."
          className="input resize-none"
        ></textarea>
        {errors.body && <span className="field-error">{errors.body.message}</span>}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="mt-5 grid w-full gap-1.5">
          <label className="label">Name <span className="text-danger-500"> * </span></label>
          <input type="text" {...register("username")} className="input" />
          {errors.username && <span className="field-error">{errors.username.message}</span>}
        </div>
        <div className="mt-5 grid w-full gap-1.5">
          <label className="label">Email <span className="text-danger-500"> * </span></label>
          <input type="email" {...register("email")} className="input" />
          {errors.email && <span className="field-error">{errors.email.message}</span>}
        </div>
      </div>

      <div className="my-5 flex items-baseline justify-end gap-3.5">
        <input
          onChange={(e) => setRememberMe(e.target.checked)}
          type="checkbox"
          className="checkbox"
        />
        <p className="text-sm">Save my Name and Email in this browser for the next time.</p>
      </div>

      <button type="submit" disabled={isLoading} className="btn btn-primary w-full sm:w-auto">
        {isLoading ? "Sending..." : "Submit Review"}
      </button>
    </form>
  );
};

export default CommentForm;
