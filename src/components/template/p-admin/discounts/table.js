"use client";
import React from "react";
import styles from "@/components/template/p-admin/discounts/discountTable.module.css";
import swal from "sweetalert";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useDelete } from "@/utils/hooks/useReactQueryPanel";

function Table({ discounts, title }) {
  const router = useRouter();

  const { mutate: removeDiscountMutate } = useDelete("/discount", {
    onSuccess: () => {
      toast.success("Code Removed Successfully :)");
      router.refresh();
    },
  });

  const removeDiscount = (discountID) => {
    swal({
      title: "Are you sure to remove this discount? :)",
      icon: "warning",
      buttons: ["No", "Yes"],
    }).then((result) => {
      if (result) {
        removeDiscountMutate({ id: discountID });
      }
    });
  };

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
                <td
                  className={
                    discount.uses >= discount.maxUses
                      ? styles.complete
                      : styles.uncomplete
                  }
                >
                  {index + 1}
                </td>
                <td>{discount.code}</td>
                <td>{discount.percent}</td>
                <td>{discount.maxUses}</td>
                <td>{discount.uses}</td>
                <td>{discount.expTime.slice(0, 10)}</td>
                <td>
                  <button
                    type="button"
                    onClick={() => removeDiscount(discount._id)}
                    className="delete_btn"
                  >
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