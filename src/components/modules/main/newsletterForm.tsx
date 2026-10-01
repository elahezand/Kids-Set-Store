"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSubscribeNewsletter } from "@/services/client/site";
import { newsletterSchema } from "@/validators/newsletter";
import type { NewsletterPayload } from "@/types";

export default function NewsletterForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewsletterPayload>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { email: "" },
  });

  const { mutate: subscribe, isPending } = useSubscribeNewsletter({ onSubscribed: () => reset() });

  return (
    <form onSubmit={handleSubmit((data) => subscribe(data))} noValidate className="mt-6 max-w-sm">
      <label htmlFor="newsletter-email" className="text-sm font-semibold">
        Get new arrivals and offers by email
      </label>
      <div className="mt-2 flex gap-2">
        <input
          id="newsletter-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          className={`input flex-1 ${errors.email ? "input-error" : ""}`}
          aria-invalid={Boolean(errors.email)}
          {...register("email")}
        />
        <button type="submit" className="btn btn-primary" disabled={isPending}>
          {isPending ? "..." : "Subscribe"}
        </button>
      </div>
      {errors.email && <p className="mt-1 text-xs text-danger-500">{errors.email.message}</p>}
    </form>
  );
}
