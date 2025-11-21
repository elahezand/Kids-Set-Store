"use client"
import React, { useEffect, useState } from 'react'
import { IoIosSend } from "react-icons/io";
import styles from "./sendTicket.module.css"
import showSwal, { manageError } from '@/utils/helper';

export default function SendTicket() {
    const [title, setTitle] = useState("")
    const [departmentID, setDepartmentID] = useState("")
    const [subDepartmentID, setSubDepartmentID] = useState("")
    const [priority, setPriority] = useState("")
    const [content, setContent] = useState("")

    const [departments, setDepartments] = useState([])
    const [subDepartments, setsubDepartments] = useState([])


    const getDepartment = async () => {
        const res = await fetch("/api/departments")
        if (res.status === 200) {
            const result = await res.json()
            setDepartments(result.departments)
        }
    }

    const getSubDepartments = async (id) => {
        const res = await fetch("/api/subDepartments")
        if (res.status === 200) {
            const result = await res.json()
            const relatedSub = result.subDepartments.filter(item => item.department === id)
            setsubDepartments(relatedSub)
        }
    }

    useEffect(() => {
        getDepartment()
    }, [])


    const sendTicket = async () => {
        if (departmentID === "-1") {
            return showSwal("Please choose one Department !", "warning", "Try again")
        }

        if (subDepartmentID === "-1") {
            return showSwal("Please choose one Department !", "warning", "Try again")
        }

        try {
            const res = await fetch("/api/tickets", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    subject: title,
                    department: departmentID,
                    subDepartment: subDepartmentID,
                    priority,
                    message: content,
                    status: "open"
                })
            })

            if (res.status !== 200) return manageError(res.status)
            swal({
                title: "Ticket sent Successfully:)",
                icon: "success",
                buttons: "ok"
            })

        } catch (err) {
            swal({
                title: "NetWork Error",
                icon: "warning",
                buttons: "ok"
            })
        }

    }

    return (
        <>
            <div>
                <h1 className="title">
                    <span>Send Ticket</span>
                </h1>
            </div>
            <div className={styles.content}>
                <div className={styles.group}>
                    <label> Please select Depatment:</label>
                    <select onChange={(e) => {
                        setDepartmentID(e.target.value)
                        getSubDepartments(e.target.value)
                    }}>
                        <option value="-1">Please choose One Department :)</option>
                        {departments.length ?
                            departments.map((item, index) => (
                                <option
                                    key={index + 1}
                                    value={item._id}>{item.title}</option>
                            )) : null}

                    </select>
                </div>
                <div className={styles.group}>
                    <label>Select The Ticket Type :</label>
                    <select
                        onChange={(e) =>
                            setSubDepartmentID(e.target.value)}>
                        <option value="-1">Please choose One Item :)</option>
                        {subDepartments.length ?
                            subDepartments.map((item, index) => (
                                <option
                                    key={index + 1}
                                    value={item._id}>
                                    {item.title}</option>
                            )) : null}
                    </select>
                </div>
                <div className={styles.group}>
                    <label>Title:</label>
                    <input
                        onChange={(e) =>
                            setTitle(e.target.value)}
                        placeholder="..." type="text" />
                </div>
                <div className={styles.group}>
                    <label> Please Select The Priority Level Of The Ticket:</label>
                    <select
                        onChange={(e) =>
                            setPriority(e.target.value)}>
                        <option value="-1">Please choose One Item :)</option>
                        <option value="1">Low</option>
                        <option value="2">Medium</option>
                        <option value="3">High</option>
                    </select>
                </div>
            </div>
            <div className={styles.group}>
                <label>Content:</label>
                <textarea
                    onChange={(e) =>
                        setContent(e.target.value)}
                    rows={10}></textarea>
            </div>
            <div className={styles.uploader}>
                <span> Maximum Size : 6MB</span>
                <span> Allowed Format: jpg, png.jpeg, rar, zip</span>
                <input type="file" />
            </div>

            <button

                className={styles.btn}
                onClick={sendTicket}
            >
                <IoIosSend />
                Send
            </button>
        </>
    )
}
