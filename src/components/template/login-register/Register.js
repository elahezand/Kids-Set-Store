"use client"
import { useState } from "react";
import styles from "./register-login.module.css";
import { useRouter } from "next/navigation";
import Sms from "./Sms";
import Link from "next/link";
import { validateEmail, validatePhone, validateUserNane, validatePassword } from "../../../../validator/user";
import showSwal, { manageError } from "@/utils/helper";
const Register = ({ showloginForm }) => {
  const router = useRouter()
  const [showOtp, setShowOtp] = useState(false)

  const [isShowPassword, setIsShowPassword] = useState(false)

  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phone, setPhone] = useState("")


  const signUpHandeler = async () => {

    const isEmailValid = validateEmail(email)
    const isPasswordValid = validatePassword(password)
    const isPhoneValid = validatePhone(phone)
    const isUsernameValid = validateUserNane(username)


    if (!isEmailValid) return showSwal("plaese inter Email Correctly", "warning", "Try Again")
    if (!isPhoneValid) return showSwal("plaese inter Phone Correctly", "warning", "Try Again")
    if (!isUsernameValid) return showSwal("plaese inter username Correctly", "warning", "Try Again")
    if (!isPasswordValid) return showSwal("plaese inter password Correctly", "warning", "Try Again")


    try {
      const res = await fetch("api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username,
          email,
          password,
          phone
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

  const otpHandeler = async () => {
    const isPhoneValid = validatePhone(phone)

    if (!isPhoneValid) return showSwal("Please Inter Your Phone Number Correctly!!!", "warning", "ok")

    try {
      const res = await fetch("api/auth/sms/check-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ phone })
      })


      if (res.status === 200) {
        const res = await fetch("api/auth/sms/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            phone
          })
        })

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
      } else {
        swal({
          title: "Your account already existed plaese logIn",
          icon: "warning",
          buttons: "ok"
        }).then(result => {
          if (result) {
            showloginForm(true)
          }
        })
      }
    } catch (err) {
      swal({
        title: "SomeThing Went Wrong",
        icon: "warning",
        buttons: "Try Again :("
      })
    }
  }


  return (
    <>
      {!showOtp ?
        <>
          <div className={styles.form}>
            <input className={styles.input}
              type="text"
              placeholder="UseraName"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              className={styles.input}
              type="text"
              placeholder="Email (optinal)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className={styles.input}
              type="Phone"
              value={phone}
              placeholder=" Phone *"
              onChange={(e) => setPhone(e.target.value)}
            />
            {isShowPassword &&
              <>
                <input
                  className={styles.input}
                  type="password"
                  value={password}
                  placeholder="Password"
                  onChange={(e) => setPassword(e.target.value)}
                />
                <small style={{ margin: "0.5rem", color: "var(--main-color)" }}>
                  Include Up,Lower Case, Number and @</small>
              </>
            }

            <button
              style={{ marginTop: ".7rem" }}
              className={styles.btn}
              onClick={() => {
                if (isShowPassword) {
                  signUpHandeler()
                } else {
                  setIsShowPassword(true)
                }
              }}>
              Register with password
            </button>
            <p style={{ marginTop: "1rem" }}
              className={styles.btn}
              onClick={() => {
                otpHandeler()
              }
              }
            >
              Register with phoneNumber
            </p>
            <p
              onClick={showloginForm}
              className={styles.back_to_login}> If Have Account ? Please <br />
              <strong>Log In</strong></p>
          </div>
          <Link
            href={"/"}
            className={styles.redirect_to_home}>Cancel</Link>
        </> :
        <Sms
          phone={phone}
          email={email}
          setShowOtp={setShowOtp}
        />
      }

    </>
  );
};

export default Register;
