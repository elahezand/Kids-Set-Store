import styles from "@/styles/p-user.module.css";
import Topbar from "@/components/modules/p-user/topbar/topbar";
import Sidebar from "@/components/modules/p-user/sidebar/sidebar";
import { redirect } from "next/navigation";
import RefreshClient from "@/utils/refreshToken";
import { authUser } from "@/utils/serverHelper";

const Layout = async ({ children }) => {
    const user = await authUser()
    if (!user) {
        redirect("/login-register")
    }

    return (
        <>
            {user.status === "expired" && <RefreshClient shouldRefresh={true} />}
            <div className={styles.layout}>
                <section className={styles.section}>
                    <Sidebar />
                    <div className={styles.contents}>
                        <Topbar
                            user={JSON.parse(JSON.stringify(user))} />
                        {children}
                    </div>
                </section>
            </div>

        </>
    );
};

export default Layout;
