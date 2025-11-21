"use client"
import React from 'react'
import { useState } from 'react';
import styles from "./response.module.css"
import { useRouter } from 'next/navigation';
import { manageError } from '@/utils/helper';
export default function Response({ ticketID }) {
    const router = useRouter()
    const [content, setContent] = useState("")
    const sendResponse = async () => {
        try {
            const res = await fetch(`/api/tickets/${ticketID}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    content
                })
            })

            if (res.status !== 200) return manageError(res.status)

            swal({
                title: "Ticket Sent Succeesfully :)",
                icon: "success",
                buttons: "ok"
            }).then(result => {
                if (result) {
                    router.refresh()
                    setContent("")
                }
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

        <div className={styles.response}>
            <input
                value={content}
                onChange={(e) => setContent(e.target.value)} />
            <button
                className={styles.btn}
                onClick={sendResponse}>Response</button>
        </div>
    )
}
