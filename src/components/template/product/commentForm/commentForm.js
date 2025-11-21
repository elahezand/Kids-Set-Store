"use client"
import { IoMdStar } from "react-icons/io";
import styles from "./commentForm.module.css";
import { validateEmail, validateUserNane } from "../../../../../validator/user";
import { useEffect, useState } from "react";
import showSwal, { manageError } from "@/utils/helper";
import { useRouter } from "next/navigation";
const CommentForm = ({ productID, userID }) => {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [body, setBody] = useState("")
  const [score, setScore] = useState(0)
  const [rememberMe, setRememberMe] = useState(false)


  const isValidateEmail = validateEmail(email)
  const isValidateName = validateUserNane(name)

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userData"))
    if (user) {
      setName(user.name)
      setEmail(user.email)
    }

  }, [])

  const sendComment = async () => {
    if (!isValidateEmail) {
      showSwal("Please Inter Email Correctly", "warning", "Try Again")
    }
    if (!isValidateName) {
      showSwal("Please Inter name Correctly", "warning", "Try Again")
    }
    if (!body.trim()) {
      showSwal("Please Inter Content Correctly", "warning", "Try Again")

    }

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: name,
          body,
          email,
          score,
          productID: productID,
          userID: userID
        })
      })
      if (res.status !== 200) return manageError(res.status)
      swal({
        title: "Your Comment Sent Successfully",
        icon: "success",
        buttons: "ok"
      }).then(result => {
        if (result) {
          router.refresh()
          if (rememberMe) {
            const user = { name, email }
            localStorage.setItem("userData", JSON.stringify(user))
          }
        }
      })
    } catch (err) {
      swal({
        title: "NetWork Error",
        icon: "warning",
        buttons: "ok"
      })
    }
  }


  return (
    <div className={styles.form}>
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
              key={index} onClick={() => setScore(index + 1)} />
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
          onChange={(e) => setBody(e.target.value)}
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
            value={name}
            onChange={(e) => setName(e.target.value)} />
        </div>
        <div className={styles.group}>
          <label htmlFor="">
            Email
            <span style={{ color: "red" }}> * </span>
          </label>
          <input type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)} />
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
        onClick={sendComment}
      >Send</button>
    </div>
  );
};

export default CommentForm;
