"use client"
import { IoMdStar } from "react-icons/io";
import styles from "./commentForm.module.css";
import { commentValidationSchema } from "../../../../../validators/comment";
import { useEffect, useState } from "react";
const CommentForm = ({ productID, user }) => {
  const [score, setScore] = useState(0)
  const [rememberMe, setRememberMe] = useState(false)

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userData"))
    if (user) {
      setName(user.name)
      setEmail(user.email)
    }
  }, [])

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(commentValidationSchema),
  })
  useEffect(() => {
    console.log(errors);
  }, [errors]);


  const { mutate, isLoading } = usePost('/comments', {
    onSuccess: () => {
      toast.success("Your Comment Sent Successfully :)")
      if (rememberMe) {
        const user = { name, email }
        localStorage.setItem("userData", JSON.stringify(user))
      }
      reset()
    }
  });

  const onSubmit = (data) => {
    const commentData = {
      username,
      body,
      email,
      score,
      productID: productID,
      userID: user
    }
    mutate(commentData);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={styles.form}>
      <p className={styles.title}>Write Your Comment : </p>
      <p>
        Your Email Addrees Will Not Be Published.
        Required Files Are Marked :)
        <span style={{ color: "red" }}> * </span>
      </p>
      <div className={styles.rate}>
        <p> Your Rating :</p>
        <div>
          {new Array(5).fill(0).map((item, index) => (
            <IoMdStar
              style={{
                "color": `${index + 1 <= score ? "var(--sage)" : "gray"}`
              }}
              key={index}
              onClick={() => setScore(index + 1)} />
          ))}
        </div>
      </div>
      <div className={styles.group}>
        <label htmlFor="">
          Your Comment
          <span style={{ color: "red" }}> * </span>
        </label>
        <textarea
          value={body}
          {...register("body")}
          id="comment"
          name="comment"
          cols="45"
          rows="8"
          required=""
          placeholder=""
        ></textarea>
      </div>
      <div className={styles.groups}>
        <div className={styles.group}>
          <label htmlFor="">
            Name
            <span style={{ color: "red" }}> * </span>
          </label>
          <input type="text"
            {...register("username")} />
        </div>
        <div className={styles.group}>
          <label htmlFor="">
            Email
            <span style={{ color: "red" }}> * </span>
          </label>
          <input type="email"
            value={email}
            {...register("email")} />
        </div>
      </div>
      <div className={styles.checkbox}>
        <input
          onChange={(e) =>
            setRememberMe(e.target.checked)}
          type="checkbox" name="" id="" />
        <p>
          Save my Name, Email, And Website In This Browser For The Next Time I Comment :)
        </p>
      </div>
      <button
        type='submit'
        disabled={isLoading}
        className={styles.btn}>
        {isLoading ? "Loading..." : "  Submit Review"}</button>
    </form>
  );
};

export default CommentForm;
