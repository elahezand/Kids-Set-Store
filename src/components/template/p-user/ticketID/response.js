"use client";
import React, { useState } from "react";
import styles from "./response.module.css";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { manageError } from "@/utils/helper";

export default function Response({ ticketID }) {
  const router = useRouter();
  const [content, setContent] = useState("");

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/tickets/${ticketID}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) throw res.status;
      return res.json();
    },
    onSuccess: () => {
      swal({
        title: "Ticket Sent Successfully :)",
        icon: "success",
        buttons: "ok",
      }).then(() => {
        router.refresh();
        setContent("");
      });
    },
    onError: (status) => {
      manageError(status);
    },
  });

  return (
    <div className={styles.response}>
      <input
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <button
        className={styles.btn}
        onClick={() => mutate()}
        disabled={isPending}
      >
        {isPending ? "Sending..." : "Response"}
      </button>
    </div>
  );
}
