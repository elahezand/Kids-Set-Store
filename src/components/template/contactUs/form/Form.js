"use client"
import { useState } from "react";
import styles from "./form.module.css";
import { validateEmail, validatePhone, validateUserNane } from "../../../../../validator/user";
import showSwal from "@/utils/helper";
import swal from "sweetalert";
import { manageError } from "@/utils/helper";
import { useRouter } from "next/navigation";
const Form = () => {
    const router = useRouter()
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")
    const [company, setCompany] = useState("")
    const [body, setBody] = useState("")

    const isValidateUsername = validateUserNane(name)
    const isValidateEmail = validateEmail(email)
    const isValidatePhone = validatePhone(phone)

    const submitMessage = async (e) => {
        e.preventDefault()
        if (!isValidateUsername) return showSwal("please inter username correctly", "warning", "try again")
        if (!isValidateEmail) return showSwal("please inter Email correctly", "warning", "try again")
        if (!isValidatePhone) return showSwal("please inter Phone correctly", "warning", "try again")
        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name,
                    email,
                    phone,
                    body,
                    company
                })
            })

            if (res.status !== 200) return manageError(res.status)

            swal({
                title: "Your Request Sent Successfully",
                icon: "success",
                buttons: "ok"
            }).then(result => {
                if (result) {
                    router.refresh()
                    setName("")
                    setEmail("")
                    setPhone("")
                    setCompany("")
                    setBody("")
                }
            })
        }
        catch (err) {
            swal({
                title: "NetWork Error",
                icon: "warning",
                buttons: "ok"
            })
        }
    }


    return (

        <form className={styles.form}>
            <span>Contact  With Us</span>
            <p>To Conact Us ,Please Fill Out The Form Below :)</p>
            <div className={styles.groups}>
                <div className={styles.group}>
                    <label>Name & LastName</label>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        type="text" />
                </div>
                <div className={styles.group}>
                    <label> Email</label>
                    <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="text" />
                </div>
            </div>
            <div className={styles.groups}>
                <div className={styles.group}>
                    <label> Phone</label>
                    <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        type="text" />
                </div>
                <div className={styles.group}>
                    <label>Company</label>
                    <input
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        type="text" />
                </div>
            </div>
            <div className={styles.group}>
                <label>Your Request</label>
                <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    name="" id="" cols="30" rows="3"></textarea>
            </div>
            <button
                onClick={submitMessage}
            >Send</button>
        </form>
    );
};

export default Form;
