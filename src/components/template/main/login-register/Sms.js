"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { manageError } from "@/utils/helper"
import toast from "react-hot-toast"
import axios from "axios"
import { useMutation } from "@tanstack/react-query"
import { z } from "zod"

const schema = z.object({
  phone: z.string().length(11).regex(/^09\d{9}$/),
  code: z.string().min(4),
})

const Sms = ({ phone, setShowOtp }) => {
  const [code, setCode] = useState("")
  const router = useRouter()

  const { mutate, isPending } = useMutation({
    mutationFn: async ({ phone, code }) => {
      const parsed = schema.safeParse({ phone, code })
      if (!parsed.success) throw new Error("Invalid data")
      const res = await axios.post("/api/auth/sms/verify", { phone, code })
      return res.data
    },
    onSuccess: () => {
      toast.success("Login Successfully:)")
      router.replace("/")
    },
    onError: (error) => { manageError(error.response?.status) },
  })

  const verifyHandler = () => { mutate({ phone, code }) }

  return (
    <div className="w-full">
      <div className="auth-card">
        <p className="font-semibold text-text dark:text-gray-100">Verification Code</p>
        <span className="text-sm font-bold text-text dark:text-gray-300">Please Enter Verification Code</span>
        <span className="text-sm text-gray-600 dark:text-gray-400">{phone}</span>

        <input
          className="input text-center"
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button
          onClick={verifyHandler}
          className="btn btn-primary w-full"
          disabled={isPending}
        >
          Verify Code
        </button>

        <p className="cursor-pointer text-sm font-medium text-sage-500 transition-colors hover:text-sage-600">
          Send Code again
        </p>
      </div>

      <p onClick={() => setShowOtp(false)} className="btn btn-accent mx-auto mt-6 w-max cursor-pointer">
        Cancel
      </p>
    </div>
  )
}

export default Sms
