"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { LuSend } from "react-icons/lu";
import { usePost } from "@/utils/hooks/useReactQueryPanel";

export default function TicketReplyForm({ ticketID }) {
    const router = useRouter();
    const [content, setContent] = useState("");

    const { mutate, isPending } = usePost(`/tickets/${ticketID}/answer`, {
        onSuccess: () => {
            toast.success("Your reply was sent successfully");
            setContent("");
            router.refresh();
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!content.trim()) return toast.error("Please enter a message!");
        mutate({ content });
    };

    return (
        <form onSubmit={handleSubmit} className="card mt-6 p-4">
            <label htmlFor="ticket-reply" className="label">Reply</label>
            <textarea
                id="ticket-reply"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your reply here…"
                rows={4}
                className="input"
            />
            <div className="mt-3 flex justify-end">
                <button type="submit" className="btn btn-primary" disabled={isPending}>
                    <LuSend className="size-4" />
                    {isPending ? "Sending…" : "Send reply"}
                </button>
            </div>
        </form>
    );
}
