"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Sms from "./Sms";
import swal from "sweetalert";
import Link from "next/link";
import axios from "axios";
import { userValidationSchema } from "../../../../../validators/user";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { manageError } from "@/utils/paginate";
import toast from "react-hot-toast";

const Register = ({ showloginForm }) => {
  const router = useRouter();
  const [showOtp, setShowOtp] = useState(false);
  const [phone, setPhone] = useState("");
  const [showPasswordField, setShowPasswordField] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(userValidationSchema),
    mode: "onChange"
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await axios.post("/api/auth/signup", data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("SignUp Successfully :)");
      router.replace("/");
    },
    onError: (error) => manageError(error.response?.status),
  });

  const onSubmit = (data) => { mutate(data); };

  const { mutate: mutationOtp, isPending: optPending } = useMutation({
    mutationFn: async (phoneNumber) => {
      const res = await axios.post("/api/auth/sms/send", { phone: phoneNumber });
      return res.data;
    },
    onSuccess: () => {
      toast.success("OTP Sent Successfully :)");
      setShowOtp(true);
    },
    onError: (error) => manageError(error.response?.status),
  });

  const handleOtp = () => {
    swal({
      title: "Please enter your phone number",
      content: "input",
    }).then((result) => {
      if (result) {
        setPhone(result);
        mutationOtp(result);
      }
    });
  };

  if (showOtp) {
    return <Sms phone={phone} setShowOtp={setShowOtp} />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
      <div className="auth-card">
        <div className="text-left">
          <input className="input" placeholder="Username" {...register("username")} />
          {errors.username && <span className="field-error">{errors.username.message}</span>}
        </div>

        <div className="text-left">
          <input className="input" placeholder="Email (optional)" {...register("email")} />
          {errors.email && <span className="field-error">{errors.email.message}</span>}
        </div>

        <div className="text-left">
          <input className="input" placeholder="Phone" {...register("phone")} />
          {errors.phone && <span className="field-error">{errors.phone.message}</span>}
        </div>

        {showPasswordField && (
          <div className="text-left">
            <input className="input" type="password" placeholder="Password" {...register("password")} />
            {errors.password && <span className="field-error">{errors.password.message}</span>}
            <small className="field-hint text-sage-500">Include Upper, Lower Case, Number and @</small>
          </div>
        )}

        {!showPasswordField ? (
          <button type="button" className="btn btn-primary w-full" onClick={() => setShowPasswordField(true)}>
            Register with Password
          </button>
        ) : (
          <button type="submit" className="btn btn-primary w-full" disabled={isPending}>
            {isPending ? "Registering..." : "Register"}
          </button>
        )}

        <button type="button" className="btn btn-secondary w-full" onClick={handleOtp} disabled={optPending}>
          {optPending ? "Sending..." : "Register with Phone"}
        </button>

        <p onClick={showloginForm} className="mt-2 cursor-pointer font-bold text-text dark:text-gray-100">
          Already have an account? <br />
          <strong className="text-sage-500">Log In</strong>
        </p>
      </div>
      <Link href="/" className="btn btn-accent mx-auto mt-6 w-max">
        Cancel
      </Link>
    </form>
  );
};

export default Register;
