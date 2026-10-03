"use client";

import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { LuSend } from "react-icons/lu";
import { useTicketReply } from "@/services/client/panel";

interface TicketReplyFormProps {
  ticketID: string;
}

export default function TicketReplyForm({ ticketID }: TicketReplyFormProps) {
  const [content, setContent] = useState("");
  const { mutate, isPending } = useTicketReply(ticketID, { onSent: () => setContent("") });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = content.trim();
    if (text.length < 3) {
      toast.error("Please write at least 3 characters");
      return;
    }
    mutate({ content: text });
  };

  return (
    <form onSubmit={handleSubmit} className="card mt-6 p-4">
      <label htmlFor="ticket-reply" className="label">
        Reply
      </label>
      <textarea
        id="ticket-reply"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="Write your reply here…"
        rows={4}
        maxLength={5000}
        className="input"
      />
      <div className="mt-3 flex justify-end">
        <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={isPending}>
          <LuSend className="size-4" />
          {isPending ? "Sending…" : "Send reply"}
        </button>
      </div>
    </form>
  );
}
