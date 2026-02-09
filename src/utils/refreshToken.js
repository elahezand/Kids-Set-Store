"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import RouteSkeleton from "@/components/feedBack/RouteSkeleton";
import { useRouter } from "next/navigation";
export default function RefreshAccessToken({ shouldRefresh, children }) {
    const [loading, setLoading] = useState(true);
    const router = useRouter()

    useEffect(() => {
        if (!shouldRefresh) {
            setLoading(false);
            return;
        }
        const refresh = async () => {
            try {
                const response = await axios.post(
                    "/api/auth/refresh",
                    {},
                    { withCredentials: true });
                if (response.status === 200 || response.status === 201) {
                    router.refresh()
                    setTimeout(() => {
                        setLoading(false);
                    }, 1000);
                }
            } catch (err) {
                console.error("Refresh API Error Details:", err.response?.data || err.message);
                window.location.href = "/";
            }
        };
        refresh()
    }, [shouldRefresh,router]);

    if (loading) {
        return (
            <RouteSkeleton />
        );
    }

    return children
}
