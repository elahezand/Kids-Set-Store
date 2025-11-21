import Link from "next/link";
import styles from "./ticket.module.css";

const Ticket = ({ _id, subject, createdAt, department, answerBy }) => {
  return (
    <Link href={`/p-user/tickets/${_id}`} className={styles.ticket}>
      <div>
        <p>{subject}</p>
        <p className={styles.department}>{department.title}</p>
      </div>
      <div>
        <p>{createdAt.slice(0, 10)}</p>
        <p className={answerBy === "ADMIN" ?
          `${styles.answer}` : `${styles.no_answer}`}>
          {answerBy === "ADMIN" ? "Answered" : "No Answer"}
        </p>
      </div>
    </Link>
  );
};

export default Ticket;
