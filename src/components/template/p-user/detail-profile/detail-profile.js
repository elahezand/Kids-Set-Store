"use client";
import React, { useEffect } from "react";
import styles from "./detail-profile.module.css";
import swal from "sweetalert";
import { IoCloudUploadOutline } from "react-icons/io5";
import { MdOutlineDelete } from "react-icons/md";
import { useState } from "react";
import Image from "next/image";
import showSwal, { manageError } from "@/utils/helper";
import { validateEmail, validatePhone, validateUserNane } from "../../../../../validator/user";
import { useRouter } from "next/navigation";
function DetailProfile() {
    const router = useRouter()
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [id, setId] = useState("");


    useEffect(() => {
        const getUser = async () => {
            const res = await fetch("/api/auth/me");
            const data = await res.json();
            setName(data.user.username);
            setEmail(data.user.email);
            setPhone(data.user.phone);
            setId(data.user._id)
        };
        getUser();
    }, []);

    const updateUser = async () => {
        const isNameValid = validateUserNane(name)
        const isEmailValid = validateEmail(email)
        const isPhoneValid = validatePhone(phone)

        if (!isNameValid) {
            return showSwal("please inter your name correctly", "warning", "try again")
        }
        if (!isEmailValid) {
            return showSwal("please inter your email correctly", "warning", "try again")
        }
        if (!isPhoneValid) {
            return showSwal("please inter your phone correctly", "warning", "try again")
        }


        swal({
            title: "Are You Sure To Save Changes?",
            icon: "warning",
            buttons: ["No", "yes"]
        }).then(async result => {
            if (result) {
                try {
                    const res = await fetch(`/api/users/${id}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            name,
                            email,
                            phone
                        })

                    })

                    if (res.status !== 200) return manageError(res.status)
                    swal({
                        title: "your detail was updated successfully :)",
                        icon: "success",
                        buttons: "ok"
                    }).then(result => {
                        if (result) {
                            router.refresh()
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


        })
    }

    return (
        <main>
            <div>
                <h1 className="title">
                    <span>Detail-profile</span>
                </h1>
            </div>
            <div className={styles.details}>
                <h1 className={styles.title}>
                    <span>Detail Account</span>
                </h1>
                <div className={styles.details_main}>
                    <section>
                        <div>
                            <label>UserName</label>
                            <input
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                placeholder=" Please Inter Your UserName"
                                type="text"
                            />
                        </div>
                        <div>
                            <label>Email</label>
                            <input
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                placeholder=" Please Inter Your Email"

                                type="text"
                            />
                        </div>
                        <div>
                            <label> Phone</label>
                            <input
                                value={phone}
                                onChange={(event) => setPhone(event.target.value)}
                                placeholder=" Please Inter Your Phone"
                                type="number"
                            />
                        </div>
                    </section>
                    <section>
                        <div className={styles.uploader}>
                            <Image
                                width={200}
                                height={200}
                                alt=""
                                src="/images/user-profile-flat-illustration-avatar-person-icon-gender-neutral-silhouette-profile-picture-free-vector.jpg" />
                            <div>
                                <div>
                                    <button>
                                        <IoCloudUploadOutline />
                                        Change
                                    </button>
                                    <input type="file" name="" id="" />
                                </div>
                                <button>
                                    <MdOutlineDelete />
                                    Remove
                                </button>
                            </div>
                        </div>
                        <div>
                            <label> Password</label>
                            <div className={styles.password_group}>
                                <input type="password" />
                                <button>Change</button>
                            </div>
                        </div>
                    </section>
                </div>
                <button
                    type="submit"
                    onClick={updateUser}
                    className={styles.submit_btn}
                >
                    Send
                </button>
            </div>
        </main>
    );
}

export default DetailProfile;
