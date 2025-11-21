"use client";

import styles from "./sidebar.module.css";
import { ImReply } from "react-icons/im";
import { FaComments, FaHeart, FaShoppingBag, FaUsers } from "react-icons/fa";
import { MdOutlineAttachMoney } from "react-icons/md";
import { MdSms, MdLogout } from "react-icons/md";
import { usePathname } from "next/navigation";
import { TbListDetails } from "react-icons/tb";
import Link from "next/link";
import { useRouter } from "next/navigation";
import swal from "sweetalert";

const Sidebar = () => {
    const path = usePathname();
    const router = useRouter()

    const logoutHandler = () => {
        swal({
            title: "Are You Sure TO Logout ?",
            icon: "warning",
            buttons: ["NO", "yes"],
        }).then(async (result) => {
            if (result) {
                const res = await fetch("/api/auth/logout", {
                    method: "POST"
                })
                if (res.status == 200) {
                    router.replace("/login-register")
                }
            }
        });
    };
    return (
        <aside className={styles.sidebar}>
            <div className={styles.sidebar_header}>
                <p>Welcome To Your Dashboard</p>
            </div>
            <ul className={styles.sidebar_main}>
                {path.includes("/p-user") ? (
                    <>
                        <Link href={"/p-user"} className={styles.sidebar_link_active}>
                            <ImReply />
                            Dashboard
                        </Link>
                        <Link href={"/p-user/orders?page=1"}>
                            <FaShoppingBag />
                            Orders
                        </Link>
                        <Link href={"/p-user/tickets?page=1"}>
                            <MdSms />
                            Tickets
                        </Link>
                        <Link href={"/p-user/comments?page=1"}>
                            <FaComments />
                            Comments
                        </Link>
                        <Link href={"/p-user/favorites?page=1"}>
                            <FaHeart />
                            Favorites
                        </Link>
                        <Link href={"/p-user/detail-profile"}>
                            <TbListDetails />
                            Detail-Profile
                        </Link>
                    </>
                ) : (
                    <>
                        <Link href={"/p-admin"} className={styles.sidebar_link_active}>
                            <ImReply />
                            Dashboard
                        </Link>

                        <Link href={"/p-admin/products"}>
                            <FaShoppingBag />
                            Products
                        </Link>
                        <Link href={"/p-admin/users"}>
                            <FaUsers />
                            Users
                        </Link>
                        <Link href={"/p-admin/comments"}>
                            <FaComments />
                            Comments
                        </Link>

                        <Link href={"/p-admin/tickets"}>
                            <MdSms />
                            Tickets
                        </Link>
                        <Link href={"/p-admin/discount"}>
                            <MdOutlineAttachMoney />
                            Discounts
                        </Link>
                    </>
                )}
            </ul>
            <div className={styles.logout} onClick={logoutHandler}>
                <MdLogout />
                Exit
            </div>
        </aside>
    );
};

export default Sidebar;
