"use client"
import { usePost } from '@/utils/hooks/useReactQueryPublic'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from 'react-hook-form'
import { contactValidationSchema } from "../../../../../validators/contact"
import toast from 'react-hot-toast'

const Form = () => {
    const {
        register: formRegister,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(contactValidationSchema),
    })

    const { mutate } = usePost("/contact", {
        onSuccess: () => {
            toast.success("your Message Sent Successfully :)")
        },
    })

    const onSubmit = async (data) => mutate(data)

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="card card-body w-full">
            <span className="block text-sm font-semibold text-coral-400">Contact With Us</span>
            <p className="mb-6 mt-2 text-lg font-bold text-text dark:text-gray-100 sm:text-xl">To Conact Us ,Please Fill Out The Form Below :)</p>

            <div className="mb-4 flex flex-col gap-4 sm:flex-row">
                <div className="flex w-full flex-col gap-1.5">
                    <label className="label">Name & LastName</label>
                    <input {...formRegister("name")} type="text" className="input" />
                </div>
                <div className="flex w-full flex-col gap-1.5">
                    <label className="label">Email</label>
                    <input {...formRegister("email")} type="text" className="input" />
                </div>
            </div>

            <div className="mb-4 flex flex-col gap-4 sm:flex-row">
                <div className="flex w-full flex-col gap-1.5">
                    <label className="label">Phone</label>
                    <input {...formRegister("phone")} type="text" className="input" />
                </div>
                <div className="flex w-full flex-col gap-1.5">
                    <label className="label">Company</label>
                    <input {...formRegister("company")} type="text" className="input" />
                </div>
            </div>

            <div className="mb-5 flex flex-col gap-1.5">
                <label className="label">Your Request</label>
                <textarea {...formRegister("body")} cols="30" rows="3" className="input" />
            </div>

            <button type="submit" className="btn btn-accent w-full">
                Send Message
            </button>
        </form>
    );
};

export default Form;
