"use client"
import { useEffect } from "react"

export default function RefreshClient({ shouldRefresh }) {
    useEffect(() => {
        if (!shouldRefresh) return
        fetch("/api/auth/refresh", {
            method: "POST",
            credentials: "include",
            cache: "no-store"
        })

    }, [shouldRefresh])

    return null
}