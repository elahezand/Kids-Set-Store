"use client";

import { useState } from "react";
import { LuMail, LuPhone, LuTrash2 } from "react-icons/lu";
import Modal from "@/components/modules/ui/modal";
import { useAnswerContact } from "@/services/client/admin";
import { formatDate } from "@/utils/format";
import { contactState, personName } from "@/utils/panelView";
import type { ContactMessage } from "@/types";

interface ContactDialogProps {
  message: ContactMessage;
  onDelete: () => void;
  onClose: () => void;
}

export default function ContactDialog({ message, onDelete, onClose }: ContactDialogProps) {
  const [answer, setAnswer] = useState("");
  const reply = useAnswerContact({ onDone: onClose });
  const state = contactState(message.status);
  const answered = message.status === "answered";
  const tooShort = answer.trim().length < 3;

  return (
    <Modal
      size="lg"
      title={
        <span className="flex flex-wrap items-center gap-2">
          {message.name}
          <span className={`badge ${state.badge}`}>{state.label}</span>
        </span>
      }
      description={`Sent ${formatDate(message.createdAt)}`}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onDelete} className="btn btn-soft-danger sm:mr-auto">
            <LuTrash2 className="size-4" /> Delete
          </button>
          <button type="button" onClick={onClose} className="btn btn-secondary" disabled={reply.isPending}>
            Close
          </button>
          {!answered && (
            <button
              type="submit"
              form="contact-answer"
              className="btn btn-primary"
              disabled={reply.isPending || tooShort}
            >
              {reply.isPending ? "Sending..." : "Send answer"}
            </button>
          )}
        </>
      }
    >
      <div className="space-y-5">
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <a
            href={`mailto:${message.email}`}
            className="inline-flex items-center gap-1.5 text-sage-700 hover:underline dark:text-sage-300"
          >
            <LuMail className="size-4" /> {message.email}
          </a>
          <a
            href={`tel:${message.phone}`}
            className="inline-flex items-center gap-1.5 text-gray-800 tabular-nums hover:underline dark:text-gray-300"
          >
            <LuPhone className="size-4" /> {message.phone}
          </a>
        </div>

        <p className="rounded-xl bg-gray-50 p-4 text-sm leading-relaxed whitespace-pre-line text-gray-900 dark:bg-white/5 dark:text-gray-100">
          {message.body}
        </p>

        {answered ? (
          <div className="border-l-2 border-sage-400 pl-4">
            <p className="text-xs text-gray-700 dark:text-gray-500">
              Answered by {personName(typeof message.answeredBy === "object" ? message.answeredBy : null, "an admin")}
              {message.answeredAt ? ` on ${formatDate(message.answeredAt)}` : ""}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed whitespace-pre-line text-gray-900 dark:text-gray-100">
              {message.answer || "Marked as answered without a written reply."}
            </p>
          </div>
        ) : (
          <form
            id="contact-answer"
            onSubmit={(event) => {
              event.preventDefault();
              if (!tooShort) reply.mutate({ id: String(message._id), answer: answer.trim() });
            }}
          >
            <label htmlFor="contact-answer-text" className="label">
              Your answer
            </label>
            <textarea
              id="contact-answer-text"
              rows={6}
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              maxLength={3000}
              placeholder={`Hi ${message.name.split(" ")[0]},`}
              className="input resize-y"
            />
            <span className="field-hint">
              Emailed to {message.email}. {3000 - answer.length} characters left.
            </span>
          </form>
        )}
      </div>
    </Modal>
  );
}
