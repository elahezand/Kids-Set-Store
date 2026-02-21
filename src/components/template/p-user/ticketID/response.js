"use client";
import React, { useState } from "react";
import styles from "./response.module.css";
import { usePost } from "@/utils/hooks/useReactQueryPanel";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function Response({ ticketID}) {
 
  const router = useRouter();
  const [content, setContent] = useState("");

  const { mutate, isLoading } = usePost(`/tickets/${ticketID}/answer`, {
    onSuccess: () => {
      toast.success("Your Ticket Response Sent Successfully :)");
      setContent("");
      router.refresh();
    }
  });

  const handleSubmit = () => {
    if (!content.trim()) {
      toast.error("Please enter a message!");
      return;
    }
    mutate({
    content,
    });
  };

  return (
    <div className={styles.response}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your reply here..."
        rows={4}
        className={styles.textarea}
      />
      <button
        className={styles.btn}
        onClick={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? "Sending..." : "Submit"}
      </button>
    </div>
  );
}
