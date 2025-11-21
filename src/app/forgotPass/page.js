"use client"
import React, { useState } from "react";
import styles from "@/components/template/login-register/register-login.module.css"
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { validatePhone, validatePassword } from "../../../validator/user";
import swal from "sweetalert";
import showSwal from "@/utils/helper";
import { manageError } from "@/utils/helper";
import Footer from "@/components/modules/footer/footer";

const ForgotPassword = () => {
    const router = useRouter()
    const [phone, setPhone] = useState("")
    const [showResetPassword, setShowResetPassword] = useState(false)
    const [newPassword, setNewPassword] = useState("")

    const resetHandeler = async () => {
        const isValidPhone = validatePhone(phone)
        if (!isValidPhone) return showSwal("Please Inter Your Phoen Number Correctly!!!", "warning", "ok")

        try {
            const res = await fetch("api/auth/sms/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    phone: phone
                })
            })
            if (res.status !== 200) return manageError(res.status)

            swal({
                title: "Please Send Code",
                content: "input",
                buttons: "Submit"
            }).then(result => {
                if (result) {
                    fetch("api/auth/sms/verify", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"

                        },
                        body: JSON.stringify({
                            phone: phone,
                            code: result
                        })
                    }).then((res) => {
                        if (res.status !== 200) {
                            swal({
                                title: "Verification failed!:(",
                                icon: "warning",
                                buttons: "ok"
                            })
                            return
                        }
                        setShowResetPassword(true)
                    })
                }
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

    const resetPaasword = async () => {
        const isValidPassword = validatePassword(newPassword)
        if (!isValidPassword) return showSwal("Please Inter Stronger password!!!", "warning", "ok")
        try {

            const res = await fetch("api/reset-password", {
                method: "POST",
                headers: {
                    "Content-Type": "appilication/json"
                },
                body: JSON.stringify({
                    password: newPassword,
                    phone: phone
                })
            })

            if (res.status !== 200) return manageError(res.status)
            swal({
                title: "your password has been updated successfully :)",
                icon: "success",
                buttons: "ok"
            }).then(result => {
                if (result) {
                    router.push("/login-register")
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
        <>
            <div className="forgot_password">
                <div data-aos="fade-up" className={styles.bg}>
                    <div className={styles.form}>
                        {!showResetPassword ?
                            <>
                                <input
                                    className={styles.input}
                                    type="text"
                                    placeholder="PhoneNumber "
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                                <button
                                    onClick={resetHandeler}
                                    style={{ marginTop: "1rem" }} className={styles.btn}>
                                    Reset Password
                                </button>
                            </>
                            :
                            <>
                                <input
                                    className={styles.input}
                                    type="text"
                                    placeholder="newPassword "
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                                <small style={{ margin: "0.5rem", color: "var(--main-color)" }}>
                                    Include Up,Lower Case, Number and @</small>
                                <button
                                    onClick={resetPaasword}
                                    style={{ marginTop: "1rem" }} className={styles.btn}>
                                    Send
                                </button>
                            </>
                        }
                        <Link href={"/login-register"} className={styles.back_to_login}>
                            Back To Login
                        </Link>
                    </div>
                    <Link href={"/login-register"} className={styles.redirect_to_home}>
                        Cancel
                    </Link>

                </div>
                <div className="image-container">
                    <Image
                        width={1000}
                        height={1000}
                        src="/images/55694782091264d5234a0dad5cbf505a.jpg"
                        alt=""
                    />
                </div>
            </div>
            <Footer />
        </>
    );
};

export default ForgotPassword;


