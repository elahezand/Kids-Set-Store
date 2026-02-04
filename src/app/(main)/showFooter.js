"use client"
import React from 'react'
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Footer from '@/components/modules/footer/footer';

const noFooterRoutes = ["/login-register"];

export default function ShowFooter() {

    const pathname = usePathname();
    const [showFooter, setShowFooter] = useState(true);

    useEffect(() => {
        setShowFooter(!noFooterRoutes.includes(pathname));
    }, [pathname]);
    return (
        <>
            {showFooter && <Footer />}
        </>
    )
}
