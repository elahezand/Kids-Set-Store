"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./producTable.module.css"
import EditModal from "@/components/template/p-admin/products/modal";
import swal from "sweetalert";
import { useDelete } from "@/utils/hooks/useReactQueryPanel";
import toast from "react-hot-toast";
export default function DataTable({ products, title }) {

    const [showModalEdit, setShowModalEdit] = useState(false)
    const [product, setProduct] = useState("")
  
    const hideModal = () => setShowModalEdit(false)
    const router = useRouter()

    const { mutate } = useDelete(`/products`, {
        onSuccess: (data) => {
            toast.success("Item Removed Successfully :)")
            router.refresh()
        },
    })

    const removeProduct = (id) => {
        swal({
            title: "Are You Sure To remove This item?",
            icon: "warning",
            buttons: ["No", "yes"]
        }).then(result => {
            if (result) {
                mutate(id)
            }
        })
    }

    return (
        <>
            <div>
                <h1 className="title">
                    <span>{title}</span>
                </h1>
            </div>
            <div className="table_container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Price</th>
                            <th>Score</th>
                            <th>Material</th>
                            <th>Color</th>
                            <th>Edit</th>
                            <th>Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product, index) => (
                            <tr key={product._id}>
                                <td>{index + 1}</td>
                                <td className={styles.image_product}>
                                    <Image
                                        width={100}
                                        height={100}
                                        src={product.img}
                                        alt=""
                                    />
                                    {product.name}
                                </td>
                                <td>{product.price}</td>
                                <td>{product.score}</td>
                                <td>{product.material}</td>
                                <td>{product.color}</td>
                                <td>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setProduct(product)
                                            setShowModalEdit(true)
                                        }}
                                        className="edit_btn">
                                        Edit
                                    </button>
                                </td>
                                <td>
                                    <button type="button"
                                        onClick={() => removeProduct(product._id)}
                                        className="delete_btn">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {showModalEdit &&
                    <EditModal
                        showEditModal={setShowModalEdit}
                        hideModal={hideModal}
                        data={product}
                    />
                }
            </div>
        </>
    );
}
