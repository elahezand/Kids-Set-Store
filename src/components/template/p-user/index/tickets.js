import styles from "./tickets.module.css";
import Ticket from "./ticket";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";

const Tickets = ({ tickets }) => {
  return (
    <div className={styles.content}>
      <div className={styles.content_details}>
        <p> Recent Tickets </p>
        <Link href="/p-user/tickets">
          All Tickets <FaArrowRight />
        </Link>
      </div>
      {tickets.length ? tickets.map((item, index) => (
        <Ticket key={index + 1} {...item} />
      ))
        : <p className={styles.empty}> No Ticket Yet </p>}
    </div>
  );
};

export default Tickets;
