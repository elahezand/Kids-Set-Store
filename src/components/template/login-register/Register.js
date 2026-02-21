"use client";
import { useState } from "react";
import styles from "./register-login.module.css";
import { useRouter } from "next/navigation";
import Sms from "./Sms";
import swal from "sweetalert";
import Link from "next/link";
import axios from "axios";
import { userValidationSchema } from "../../../../validators/user";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { manageError } from "@/utils/helper";
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

  const onSubmit = (data) => {
    mutate(data);
  };

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
    <form
      onSubmit={handleSubmit(onSubmit)}>
      <div className={styles.form}>
        <input
          className={styles.input}
          placeholder="Username"
          {...register("username")}
        />
        {errors.username && <span className={styles.error_text}>
          {errors.username.message}</span>}

        <input
          className={styles.input}
          placeholder="Email (optional)"
          {...register("email")}
        />
        {errors.email && <span className={styles.error_text}>{errors.email.message}</span>}

        <input
          className={styles.input}
          placeholder="Phone"
          {...register("phone")}
        />
        {errors.phone && <span className={styles.error_text}>{errors.phone.message}</span>}
        {showPasswordField && (
          <>
            <input
              className={styles.input}
              type="password"
              placeholder="Password"
              {...register("password")}
            />
            {errors.password && <span className={styles.error_text}>{errors.password.message}</span>}
            <small style={{ margin: "0.5rem", color: "var(--main-color)" }}>
              Include Upper, Lower Case, Number and @
            </small>
          </>
        )}

        {!showPasswordField ? (
          <button
            type="button"
            className={styles.btn}
            style={{ marginTop: ".7rem" }}
            onClick={() => setShowPasswordField(true)}
          >
            Register with Password
          </button>
        ) : (
          <button
            type="submit"
            className={styles.btn}
            style={{ marginTop: ".7rem" }}
            disabled={isPending}
          >
            {isPending ? "Registering..." : "Register"}
          </button>
        )}

        <button
          type="button"
          className={styles.btn}
          style={{ marginTop: "1rem" }}
          onClick={handleOtp}
          disabled={optPending}
        >
          {optPending ? "Sending..." : "Register with Phone"}
        </button>

        <p onClick={showloginForm} className={styles.back_to_login} style={{ cursor: "pointer" }}>
          Already have an account? <br />
          <strong>Log In</strong>
        </p>
      </div>
      <Link href={"/"} className={styles.redirect_to_home}>
        Cancel
      </Link>
    </form>
  );
};

export default Register;