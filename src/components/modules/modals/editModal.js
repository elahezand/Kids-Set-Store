import { useState } from "react";
import styles from "./editModal.module.css";
import { validateUserNane, validatePhone, validateEmail } from "../../../../validator/user";
import showSwal, { manageError } from "@/utils/helper";
import { useRouter } from "next/navigation";


const EditModal = ({ hideModal, data }) => {
    const router = useRouter()
    const [name, setName] = useState(data.username);
    const [email, setEmail] = useState(data.email);
    const [phone, setPhone] = useState(data.phone);
    
    const updatedUser = async (e) => {
        e.preventDefault()

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

        try {
            const res = await fetch(`/api/users/${data._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: name,
                    email,
                    phone
                })
            })

            if (res.status !== 200) return manageError(res.status)
                
            swal({
                title: "User has been update successfully",
                icon: "success",
                button: "ok"
            }).then(result => {
                if (result) {
                    hideModal()
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

    return (
        <div className={styles.modal_container} id="edit-modal">
            <div className={styles.modal_bg} onClick={hideModal}></div>
            <div className={styles.box_modal}>
                <h1 className={styles.modal_title}>Please send New Detail</h1>
                <form action="#" className={styles.edit_user_form}>
                    <div className={styles.inputBox}>
                        <input
                            autoComplete="off" required
                            type="text"
                            value={name}
                            placeholder="Name.."
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className={styles.inputBox}>
                        <input
                            autoComplete="off" required
                            type="text"
                            value={email}
                            placeholder="Email.."
                            onChange={(e) => setEmail(e.target.value)}

                        />
                    </div>
                    <div className={styles.inputBox}>
                        <input
                            autoComplete="off" required
                            type="text"
                            value={phone}
                            placeholder="Phone.."
                            onChange={(e) => setPhone(e.target.value)}

                        />
                    </div>


                    <input
                        className={styles.btn_action}
                        type="submit"
                        onClick={(e) => updatedUser(e)}>
                    </input>
                </form>
            </div>

        </div>
    )
}

export default EditModal
