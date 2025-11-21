import React, { useState } from "react";
import styles from "./register-login.module.css";
import Link from "next/link";
import Sms from "./Sms";
import { useRouter } from "next/navigation";
import { validatePassword } from "../../../../validator/user";
import showSwal from "@/utils/helper";
import { manageError } from "@/utils/helper";
const Login = ({ showRegisterForm }) => {
  const router = useRouter()
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)

  const [showOtp, setShowOtp] = useState(false)
  const [phone, setPhone] = useState("")

  const loginHandeler = async () => {
    const isPasswordValid = validatePassword(password)
    if (!password.trim() || !identifier.trim()) showSwal("plaese inter password and email", "warning", "Try Again")
    if (!isPasswordValid) showSwal("plaese inter password Correctly", "warning", "Try Again")

    try {
      const res = await fetch("api/auth/signin", {
        method: "POST",
        headers: {
          "Content-type": "application/json"
        },
        body: JSON.stringify({
          identifier,
          password,
          rememberMe
        })
      })

      if (res.status !== 200) return manageError(res.status)

      swal({
        title: "you are loggined successfully",
        icon: "success",
        buttons: "ok"
      }).then(result => {
        if (result) {
          router.replace("/")
          router.refresh()
        }
      })

    }
    catch (err) {
      swal({
        title: "SomeThing Went Wrong",
        icon: "warning",
        buttons: "Try Again :("
      })
    }
  }

  const otpHandeler = () => {
    swal({
      title: "please send your number",
      content: "input",

    }).then(result => {
      if (result) {
        setPhone(result)
        try {
          fetch("api/auth/sms/send", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              phone: result,
            })
          }).then(res => {

            if (res.status !== 200) return manageError(res.status)

            swal({
              title: "Code Send successfully",
              icon: "success",
              buttons: "ok"
            }).then(result => {
              if (result) {
                setShowOtp(true)
              }
            })
          })
        } catch (err) {
          swal({
            title: "NetWork Error",
            text: err.message,
            icon: "warning",
            buttons: "ok"
          })

        }

      }
    })


  }

  return (
    <>
      {!showOtp ?
        <>
          <div className={styles.form}>
            <input
              className={styles.input}
              type="text"
              placeholder="Email |PhoneNumber"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
            <input
              className={styles.input}
              type="password"
              placeholder=" Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <small style={{ margin: "0.5rem", color: "var(--main-color)" }}>
              Include Up,Lower Case, Number and @</small>

            <div className={styles.checkbox}>
              <input type="checkbox" name="" id=""
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <p>Remember Me</p>
            </div>
            <button
              onClick={loginHandeler}
              className={styles.btn}>Sign In</button>
            <Link href={"/forgotPass"}
              className={styles.forgot_pass}>
              Forgot Password ? :(
            </Link>
            <button
              onClick={otpHandeler}
              className={styles.btn}>Login With One-Time Password </button>
            <p
              onClick={showRegisterForm}
              className={styles.back_to_login}> Dont Have Account ? Please <br />
              <strong>Sign Up</strong></p>
          </div>
          <Link href={"/"} className={styles.redirect_to_home}>
            Cancel
          </Link>

        </>
        : <Sms
          phone={phone}
          setShowOtp={setShowOtp}
        />

      }
    </>
  );
};

export default Login
