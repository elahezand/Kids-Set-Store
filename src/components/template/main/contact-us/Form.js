"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { usePost } from "@/utils/hooks/useReactQuery";
import { contactValidationSchema } from "../../../../../validators/contact";

const Field = ({ id, label, error, as = "input", ...props }) => {
  const Component = as;

  return (
    <div className="flex w-full flex-col gap-1.5">
      <label htmlFor={id} className="label">
        {label}
      </label>

      <Component
        id={id}
        className={`input ${error ? "input-error" : ""}`}
        aria-invalid={!!error}
        {...props}
      />

      {error && (
        <p className="text-xs text-danger-500">{error.message}</p>
      )}
    </div>
  );
};

const Form = () => {
  const {
    register: formRegister,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(contactValidationSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      body: "",
    },
  });

  const { mutate: sendMessage, isPending } = usePost("/contact", {
    errorFallback: "Failed to send message",

    onSuccess: () => {
      toast.success("Your message was sent successfully :)");
      reset();
    },
  });

  const onSubmit = (data) => sendMessage(data);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="card card-body w-full"
      noValidate
    >
      <span className="block text-sm font-semibold text-coral-400">
        Contact With Us
      </span>

      <p className="mb-6 mt-2 text-lg font-bold text-text dark:text-gray-100 sm:text-xl">
        To Contact Us, Please Fill Out The Form Below :)
      </p>

      <div className="mb-4 flex flex-col gap-4 sm:flex-row">
        <Field
          id="name"
          label="Name & LastName"
          type="text"
          autoComplete="name"
          error={errors.name}
          {...formRegister("name")}
        />

        <Field
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email}
          {...formRegister("email")}
        />
      </div>

      <div className="mb-4 flex flex-col gap-4 sm:flex-row">
        <Field
          id="phone"
          label="Phone"
          type="tel"
          autoComplete="tel"
          error={errors.phone}
          {...formRegister("phone")}
        />

        <Field
          id="company"
          label="Company"
          type="text"
          autoComplete="organization"
          error={errors.company}
          {...formRegister("company")}
        />
      </div>

      <div className="mb-5">
        <Field
          as="textarea"
          id="body"
          label="Your Request"
          rows={3}
          error={errors.body}
          {...formRegister("body")}
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="btn btn-accent w-full disabled:opacity-60"
      >
        {isPending ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
};

export default Form;