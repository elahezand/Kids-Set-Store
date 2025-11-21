import Link from "next/link";
import styles from "./stepper.module.css";
import { FaArrowRightLong } from "react-icons/fa6";
const Stepper = ({ step }) => {
    return (
        <div className={styles.stepper_bg}>
            <div className={styles.stepper}>
                <Link className={step == "cart" && styles.active_step} href={"/cart"}>
                    Shopping Card
                </Link>
                <FaArrowRightLong />
                {step === "checkout" || step === "complate" ? (
                    <Link
                        className={step == "checkout" && styles.active_step}
                        href={"/checkout"}
                    >
                        Pay
                    </Link>
                ) : (
                    <p>Pay</p>
                )}
                <FaArrowRightLong />
                {step == "complate" ? (
                    <Link
                        className={step == "complate" && styles.active_step}
                        href={"/complate"}
                    >
                        Complete Order
                    </Link>
                ) : (
                    <p> Complete Order</p>
                )}
            </div>
        </div>
    );
};

export default Stepper;
