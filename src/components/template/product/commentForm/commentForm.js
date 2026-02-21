"use client"
import { IoMdStar } from "react-icons/io";
import styles from "./commentForm.module.css";
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
    defaultValues: {
      score: 0,
      productID: productID
    }
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
      localStorage.setItem("userData", JSON.stringify({
        name: data.username,
        email: data.email
      }));
    }

    mutate(finalData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <p className={styles.title}>Write Your Comment : </p>

      <div className={styles.rate}>
        <p> Your Rating :</p>
        <div>
          {new Array(5).fill(0).map((_, index) => (
            <IoMdStar
              style={{ color: `${index + 1 <= score ? "orange" : "gray"}`, cursor: "pointer" }}
              key={index}
              onClick={() => setScore(index + 1)}
            />
          ))}
        </div>
        {errors.score && <span style={{ color: "red", fontSize: "12px" }}>{errors.score.message}</span>}
      </div>

      <div className={styles.group}>
        <label>Your Comment <span style={{ color: "red" }}> * </span></label>
        <textarea
          {...register("body")}
          id="comment"
          cols="45"
          rows="8"
          placeholder="Enter your comment here..."
        ></textarea>
        {errors.body && <span style={{ color: "red", fontSize: "12px" }}>{errors.body.message}</span>}
      </div>

      <div className={styles.groups}>
        <div className={styles.group}>
          <label>Name <span style={{ color: "red" }}> * </span></label>
          <input type="text" {...register("username")} />
          {errors.username && <span style={{ color: "red", fontSize: "12px" }}>{errors.username.message}</span>}
        </div>
        <div className={styles.group}>
          <label>Email <span style={{ color: "red" }}> * </span></label>
          <input type="email" {...register("email")} />
          {errors.email && <span style={{ color: "red", fontSize: "12px" }}>{errors.email.message}</span>}
        </div>
      </div>

      <div className={styles.checkbox}>
        <input
          onChange={(e) => setRememberMe(e.target.checked)}
          type="checkbox"
        />
        <p>Save my Name and Email in this browser for the next time.</p>
      </div>

      <button type='submit' disabled={isLoading} className={styles.btn}>
        {isLoading ? "Sending..." : "Submit Review"}
      </button>
    </form>
  );
};

export default CommentForm;