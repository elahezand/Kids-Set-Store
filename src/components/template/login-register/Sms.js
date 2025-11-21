"use client"
import styles from "@/components/template/login-register/sms.module.css";
import { useState } from "react";
import swal from "sweetalert";
import { useRouter } from "next/navigation";
import { manageError } from "@/utils/helper";
const Sms = ({ phone, setShowOtp }) => {
  const [code, setCode] = useState("")
  const router = useRouter()

  const verifyHandeler = async () => {
    try {
      const res = await fetch("/api/auth/sms/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          phone,
          code
        })
      })
      if (res.status !== 200) return manageError(res.status)
      swal({
        title: "you are registred successfully :)",
        icon: "success",
        buttons: "ok"
      }).then(result => {
        if (result) {
          router.push("/")
        }
      })
    } catch (err) {
      swal({
        title: "SomeThing Went Wrong",
        icon: "warning",
        buttons: "Try Again :("
      })
    }

  }
  return (
    <div>
      <div className={styles.form}>
        <p>Verification Code</p>
        <span className={styles.code_title}>
          Please Enter Verification Code
        </span>
        <span className={styles.number}>{phone}</span>
        <input className={styles.input} type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)} />
        <button style={{ marginTop: "1rem" }}
          onClick={verifyHandeler}
          className={styles.btn}>
          Verify Code
        </button>
        <p className={styles.send_again_code}>Send Code again</p>
      </div>
      <p
        onClick={() => setShowOtp(false)}
        className={styles.redirect_to_home}>Cancel</p>
    </div>
  );
};

export default Sms;
