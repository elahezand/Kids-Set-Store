"use client";
import styles from "./sidebar.module.css";
import { ImReply } from "react-icons/im";
import { FaComments, FaHeart, FaShoppingBag, FaUsers } from "react-icons/fa";
import { MdOutlineAttachMoney } from "react-icons/md";
import { MdSms, MdLogout } from "react-icons/md";
import { TbListDetails } from "react-icons/tb";
import { usePathname } from "next/navigation";
import Link from "next/link";
import swal from "sweetalert";
import { useRouter } from "next/navigation";
const Sidebar = () => {
    const path = usePathname();
    const router = useRouter()

    const logoutHandler = () => {
        swal({
            title: "Are You Sure To LogOut?",
            icon: "warning",
            buttons: ["No", "yes"],
        }).then(async (result) => {
            if (result) {
                const res = await fetch("/api/auth/logout", {
                    method: "POST"
                })
                if (res.status === 200) {
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
                        <Link href={"/p-user"}
                            className={styles.sidebar_link_active}>
                            <ImReply />
                            Dashboard
                        </Link>
                        <Link href={"/p-user/orders"}>
                            <FaShoppingBag />
                            Orders
                        </Link>
                        <Link href={"/p-user/tickets"}>
                            <MdSms />
                            Support Tickets
                        </Link>
                        <Link href={"/p-user/comments"}>
                            <FaComments />
                            Comments
                        </Link>
                        <Link href={"/p-user/wishlist"}>
                            <FaHeart />
                            Favorites
                        </Link>
                        <Link href={"/p-user/account-details"}>
                            <TbListDetails />
                            Detail-account
                        </Link>
                    </>
                ) : (
                    <>
                        <Link href={"/p-admin"}
                            className={styles.sidebar_link_active}>
                            <ImReply />
                            Dashboard
                        </Link>

                        <Link href={"/p-admin/products?page=1"}>
                            <FaShoppingBag />
                            Products
                        </Link>
                        <Link href={"/p-admin/users?page=1"}>
                            <FaUsers />
                            Users
                        </Link>
                        <Link href={"/p-admin/detail-account"}>
                            <MdOutlineAttachMoney />
                            Detail-Account
                        </Link>
                        <Link href={"/p-admin/comments?page=1"}>
                            <FaComments />
                            Comments
                        </Link>
                        <Link href={"/p-admin/articles?page=1"}>
                            <FaUsers />
                            Articles
                        </Link>

                        <Link href={"/p-admin/tickets?page=1"}>
                            <MdSms />
                            Tickets
                        </Link>
                        <Link href={"/p-admin/discounts?page=1"}>
                            <MdOutlineAttachMoney />
                            Discounts
                        </Link>
                    </>
                )}
            </ul>
            <div className={styles.logout}
                onClick={logoutHandler}>
                <MdLogout />
                EXIT
            </div>
        </aside>
    );
};

export default Sidebar;
