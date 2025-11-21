"use client"
import { useState } from "react";
import styles from "./modal.module.css";
import { useRouter } from "next/navigation";
import { manageError } from "@/utils/helper";


const EditModal = ({ hideModal, data }) => {
    const router = useRouter()
    const [name, setName] = useState(data.name);
    const [price, setPrice] = useState(data.price);
    const [color, setColor] = useState(data.color);
    const [size, setSize] = useState(data.size);
    const [suitableFor, setSuitableFor] = useState(data.suitableFor);
    const [material, setMaterial] = useState(data.material);
    const [image, setImg] = useState({});
    const [tags, setTags] = useState("");



    const updateProduct = async (e) => {
        e.preventDefault()
        console.log("sakama");


        const formData = new FormData();

        formData.append("name", name);
        formData.append("price", price);
        formData.append("material", material);
        formData.append("color", color);
        formData.append("suitableFor", suitableFor);
        formData.append("size", size);
        formData.append("tags", tags.split("،"));
        formData.append("img", image);

        try {
            const res = await fetch(`/api/products/${data._id}`, {
                method: "PUT",
                body: formData
            })

            if (res.status !== 200) return manageError(res.status)
            swal({
                title: "Product has been update successfully",
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
                            value={price}
                            placeholder="Price.."
                            onChange={(e) => setPrice(e.target.value)}

                        />
                    </div>
                    <div className={styles.inputBox}>
                        <input
                            autoComplete="off" required
                            type="text"
                            value={color}
                            placeholder="Color.."
                            onChange={(e) => setColor(e.target.value)}

                        />
                    </div>
                    <div className={styles.inputBox}>
                        <input
                            autoComplete="off" required
                            type="text"
                            value={size}
                            placeholder="Size.."
                            onChange={(e) => setSize(e.target.value)}

                        />
                    </div>

                    <div className={styles.inputBox}>
                        <input
                            autoComplete="off" required
                            type="text"
                            value={suitableFor}
                            placeholder="SuitableFor.."
                            onChange={(e) => setSuitableFor(e.target.value)}

                        />
                    </div>

                    <div className={styles.inputBox}>
                        <input
                            autoComplete="off" required
                            type="text"
                            value={material}
                            placeholder="Material.."
                            onChange={(e) => setMaterial(e.target.value)}

                        />
                    </div>
                    <div className={styles.inputBox}>
                        <input
                            autoComplete="off" required
                            type="text"
                            value={tags}
                            placeholder="Tags.."
                            onChange={(e) => setTags(e.target.value)}

                        />
                    </div>
                    <div className={styles.inputBox}>
                        <input
                            type="file"
                            placeholder="Image.."
                            onChange={(e) => setImg(e.target.files[0])}

                        />
                    </div>
                    <input
                        className={styles.btn_action}
                        type="submit"
                        onClick={(e) => updateProduct(e)}>
                    </input>
                </form>
            </div>

        </div>
    )
}

export default EditModal
