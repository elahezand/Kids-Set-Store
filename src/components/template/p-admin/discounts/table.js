"use client"
import React from "react";
import styles from "@/components/template/p-admin/discounts/discountTable.module.css"
import swal from "sweetalert";
import { useRouter } from "next/navigation";
function Table({ discounts, title }) {
  const router = useRouter()

  const removeDiscount = async (discountID) => {
    swal({
      title: "are you Sure To Remove This Discount? :)",
      icon: "warning",
      buttons: ["No", "yes"]
    }).then(async result => {
      if (result) {
        try {
          const res = await fetch(`/api/discount/${discountID}`, {
            method: "DELETE",
          })

          if (res.status !== 200) {
            let message = null
            if (res.status === 401) message = "Unauthorized Request";
            if (res.status === 404) message = "Not Found";
            else if (res.status === 500) message = "server Error";
            else message = `unexpected Error (${res.status})`

            swal({
              title: "Error",
              text: message,
              icon: "warning",
              buttons: "ok"
            })
            return
          }
          swal({
            title: "Code Removed Successfully :)",
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
              <th>Code</th>
              <th>Percent</th>
              <th>MaxUses</th>
              <th>Uses</th>
              <th>Expire Time</th>
              <th>Remove</th>
            </tr>
          </thead>
          <tbody>
            {discounts.map((discount, index) => (
              <tr key={discount._id}>
                <td className={discount.uses >= discount.maxUses ? `${styles.complete}` : `${styles.uncomplete}`}>{index + 1}</td>
                <td>{discount.code}</td>
                <td>{discount.percent}</td>
                <td>{discount.maxUses}</td>
                <td>{discount.uses}</td>
                <td>{discount.expTime.slice(0, 10)}</td>
                <td>
                  <button type="button"
                    onClick={() => removeDiscount(discount._id)}
                    className="delete_btn">
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default Table;
