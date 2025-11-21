"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./producTable.module.css"
import EditModal from "@/components/template/p-admin/products/modal";
import swal from "sweetalert";
import { manageError } from "@/utils/helper";
export default function DataTable({ products, title }) {
    const router = useRouter();

    const [showModalEdit, setShowModalEdit] = useState(false)
    const hideModal = () => setShowModalEdit(false)

    const [product, setProduct] = useState("")

    const removeProduct = async (productID) => {
        swal({
            title: "are you Sure To Remove This Product? :)",
            icon: "warning",
            buttons: ["No", "yes"]
        }).then(async result => {
            if (result) {
                try {
                    const res = await fetch(`/api/products/${productID}`, {
                        method: "DELETE",
                    })

                    if (res.status !== 200) return manageError(res.status)
                    swal({
                        title: "Product Removed Successfully :)",
                        icon: "success",
                        buttons: "ok"
                    }).then(result => {
                        if (result) {
                            router.refresh()
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
        }
        )
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
