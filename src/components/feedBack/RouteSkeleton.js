import styles from "./RouteSkeleton.module.css";

export default function RouteSkeleton() {
    return (
        <div className={styles.container}>
            <div className={styles.spinner} role="status">
                <span className={styles.srOnly}>Loading...</span>
            </div>
        </div>
    );
}