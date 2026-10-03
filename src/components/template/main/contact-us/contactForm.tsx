"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSendContact } from "@/services/client/site";
import { contactSchema } from "@/validators/contact";
import type { ContactPayload } from "@/types";

const EMPTY: ContactPayload = { name: "", email: "", phone: "", body: "" };

const FIELDS: Array<{
  name: Exclude<keyof ContactPayload, "body">;
  label: string;
  type: string;
  autoComplete: string;
  inputMode?: "numeric";
}> = [
  { name: "name", label: "Full name", type: "text", autoComplete: "name" },
  { name: "email", label: "Email", type: "email", autoComplete: "email" },
  { name: "phone", label: "Phone number", type: "tel", autoComplete: "tel", inputMode: "numeric" },
];

export default function ContactForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactPayload>({
    resolver: zodResolver(contactSchema),
    defaultValues: EMPTY,
  });

  const { mutate: send, isPending } = useSendContact({ onSent: () => reset(EMPTY) });

  return (
    <form
      onSubmit={handleSubmit((data) => send(data))}
      noValidate
      className="card card-body flex w-full flex-col gap-4"
    >
      <h2 className="text-lg font-bold">Send us a message</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        {FIELDS.map(({ name, label, ...rest }) => (
          <div key={name} className={name === "name" ? "sm:col-span-2" : undefined}>
            <label htmlFor={`contact-${name}`} className="label">
              {label}
            </label>
            <input
              id={`contact-${name}`}
              {...rest}
              {...register(name)}
              aria-invalid={Boolean(errors[name])}
              className={`input ${errors[name] ? "input-error" : ""}`}
            />
            {errors[name] && <span className="field-error">{errors[name]?.message}</span>}
          </div>
        ))}
      </div>

      <div>
        <label htmlFor="contact-body" className="label">
          Message
        </label>
        <textarea
          id="contact-body"
          rows={5}
          {...register("body")}
          aria-invalid={Boolean(errors.body)}
          className={`input resize-none ${errors.body ? "input-error" : ""}`}
        />
        {errors.body && <span className="field-error">{errors.body.message}</span>}
      </div>

      <button type="submit" disabled={isPending} className="btn btn-primary w-full sm:w-auto sm:self-end">
        {isPending ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}
