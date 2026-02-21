"use client"
import styles from "@/components/template/login-register/sms.module.css"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { manageError } from "@/utils/helper"
import toast from "react-hot-toast"
import axios from "axios"
import { useMutation } from "@tanstack/react-query"
import { z } from "zod"

const schema = z.object({
  phone: z
    .string()
    .length(11)
    .regex(/^09\d{9}$/),
  code: z.string().min(4),
})

const Sms = ({ phone, setShowOtp }) => {
  const [code, setCode] = useState("")
  const router = useRouter()

  const { mutate, isPending } = useMutation({
    mutationFn: async ({ phone, code }) => {
      const parsed = schema.safeParse({ phone, code })
      if (!parsed.success)
        throw new Error("Invalid data")

      const res = await axios.post("/api/auth/sms/verify", {
        phone,
        code,
      })
      return res.data
    },
    onSuccess: () => {
      toast.success("Login Successfully:)")
      router.replace("/")
    },
    onError: (error) => {
      manageError(error.response?.status)
    },
  })

  const verifyHandler = () => {
    mutate({ phone, code })
  }

  return (
    <div>
      <div className={styles.form}>
        <p>Verification Code</p>
        <span className={styles.code_title}>
          Please Enter Verification Code
        </span>
        <span className={styles.number}>{phone}</span>

        <input
          className={styles.input}
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button
          style={{ marginTop: "1rem" }}
          onClick={verifyHandler}
          className={styles.btn}
          disabled={isPending}>
          Verify Code
        </button>

        <p className={styles.send_again_code}>
          Send Code again
        </p>
      </div>

      <p
        onClick={() => setShowOtp(false)}
        className={styles.redirect_to_home}>
        Cancel
      </p>
    </div>
  )
}

export default Sms
