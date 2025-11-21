import styles from "./topbar.module.css";
import { IoIosSearch, IoIosNotifications } from "react-icons/io";
import Image from "next/image";
const Topbar = ({ user }) => {
    return (
        <>
            <div className={styles.topbar}>
                <div className={styles.profile}>
                    <Image
                        height={200}
                        width={200}
                        src="/images/user-profile-flat-illustration-avatar-person-icon-gender-neutral-silhouette-profile-picture-free-vector.jpg" alt="" />
                    <div>
                        <p>{user.username}</p>
                        <span>ADMIN</span>
                    </div>
                </div>
                <section>
                    <div className={styles.searchBox}>
                        <input type="text" placeholder="Search" />
                        <div>
                            <IoIosSearch />
                        </div>
                    </div>
                    <div className={styles.notification}>
                        <IoIosNotifications />
                        <span>2</span>
                    </div>
                </section>
            </div>
        </>
    );
};

export default Topbar;
