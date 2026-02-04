"use client"
import React, { useState } from "react";
import styles from "./register-login.module.css";
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
// Zod schema for validation
const loginSchema = z.object({
  email: z.string().email("Invalid email").nonempty("Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  remember: z.boolean().optional(),
})

const Login = ({ showRegisterForm }) => {
  const router = useRouter()

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onChange"
  })

  // Login mutation
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

  // Submit handler
  const onSubmit = (data) => mutation.mutate(data)

  const [showOtp, setShowOtp] = useState(false)
  const [phone, setPhone] = useState("")
  // OTP register
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
      button: {
        text: "Send OTP",
      },
    }).then((result) => {
      if (result) {
        setPhone(result);
        mutationOtp.mutate(result);
      }
    });
  };

  if (showOtp) return <Sms phone={phone} setShowOtp={setShowOtp} />;

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}>
        <div className={styles.form}>
          <input
            className={styles.input}
            type="text"
            placeholder="Email |PhoneNumber"
            {...register("email")}
          />
          {errors.email && <span className={styles.error_text}>{errors.email.message}</span>}
          <input
            className={styles.input}
            type="password"
            placeholder=" Password"
            {...register("password")}
          />
          {errors.password && <span className={styles.error_text}>{errors.password.message}</span>}
          <small style={{ margin: "0.5rem", color: "var(--main-color)" }}>
            Include Up,Lower Case, Number and @</small>

          <div className={styles.checkbox}>
            <input
              type="checkbox"
              {...register("remember")}
            />
            <p>Remember Me</p>
          </div>
          <button
            type="submit"
            className={styles.btn}>Sign In</button>
          <Link href={"/forgotPass"}
            className={styles.forgot_pass}>
            Forgot Password ? :(
          </Link>
          <button type="button" className={styles.btn} onClick={handleOtp}
            style={{ marginTop: "1rem" }}>
            Login With One-Time Password
          </button>
          <p
            onClick={showRegisterForm}
            className={styles.back_to_login}> Dont Have Account ? Please <br />
            <strong>Sign Up</strong></p>
        </div>
        <Link href={"/"}
          className={styles.redirect_to_home}>
          Cancel
        </Link>

      </form>
    </>
  );
};

export default Login
