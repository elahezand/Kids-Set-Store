"use client"
import { useState } from "react";
import Link from "next/link";
import Sms from "./Sms";
import { useRouter } from "next/navigation";
import swal from "sweetalert";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { manageError } from "@/utils/helper";
import axios from "axios";
import toast from "react-hot-toast";

const loginSchema = z.object({
  email: z.string().email("Invalid email").nonempty("Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  remember: z.boolean().optional(),
})

const Login = ({ showRegisterForm }) => {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onChange"
  })

  const mutation = useMutation({
    mutationFn: async (data) => {
      const res = await axios.post("/api/auth/signin", {
        identifier: data.email,
        password: data.password,
        remember: data.remember,
      })
      return res.data
    },
    onSuccess: () => {
      toast.success("LogIn Successfully:)"),
        router.replace("/")
    },
    onError: (error) => {
      const status = error.response?.status
      manageError(status)
    },
  })

  const onSubmit = (data) => mutation.mutate(data)

  const [showOtp, setShowOtp] = useState(false)
  const [phone, setPhone] = useState("")

  const mutationOtp = useMutation({
    mutationFn: async (phoneNumber) =>
      axios.post("/api/auth/sms/send", { phone: phoneNumber }).then(r => r.data),
    onSuccess: () => {
      toast.success("OTP Sent Successfully :)");
      setShowOtp(true);
    },
    onError: (error) => {
      const status = error.response?.status;
      manageError(status);
    },
  });

  const handleOtp = async () => {
    swal({
      title: "Please enter your phone number",
      content: "input",
      button: { text: "Send OTP" },
    }).then((result) => {
      if (result) {
        setPhone(result);
        mutationOtp.mutate(result);
      }
    });
  };

  if (showOtp) return <Sms phone={phone} setShowOtp={setShowOtp} />;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
      <div className="auth-card">
        <div className="text-left">
          <input className="input" type="text" placeholder="Email | PhoneNumber" {...register("email")} />
          {errors.email && <span className="field-error">{errors.email.message}</span>}
        </div>
        <div className="text-left">
          <input className="input" type="password" placeholder="Password" {...register("password")} />
          {errors.password && <span className="field-error">{errors.password.message}</span>}
          <small className="field-hint text-sage-500">Include Up,Lower Case, Number and @</small>
        </div>

        <div className="flex items-center gap-1.5">
          <input type="checkbox" className="checkbox" {...register("remember")} />
          <p className="text-sm">Remember Me</p>
        </div>

        <button type="submit" className="btn btn-primary w-full">
          Sign In
        </button>
        <Link href="/forgotPass" className="cursor-pointer text-sm text-gray-600 dark:text-gray-400">
          Forgot Password ? :(
        </Link>
        <button type="button" className="btn btn-secondary w-full" onClick={handleOtp}>
          Login With One-Time Password
        </button>
        <p onClick={showRegisterForm} className="mt-2 cursor-pointer font-bold text-text dark:text-gray-100">
          Dont Have Account ? Please <br />
          <strong className="text-sage-500">Sign Up</strong>
        </p>
      </div>
      <Link href="/" className="btn btn-accent mx-auto mt-6 w-max">
        Cancel
      </Link>
    </form>
  );
};

export default Login
