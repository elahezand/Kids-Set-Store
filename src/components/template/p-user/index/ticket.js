import Link from "next/link";
import styles from "./ticket.module.css";

const Ticket = ({ title, createdAt, _id, department, isAnswer }) => {
  return (
    <Link href={`/p-user/tickets/${_id}`}
      className={styles.ticket}>
      <div>
        <p>{title}</p>
        <p className={styles.department}>
          {department.title} </p>
      </div>
      <div>
        <p>{new Date(createdAt).toISOString().slice(0, 10)}</p>
        <p
          className={isAnswer ?
            styles.answer : styles.no_answer}>
          {isAnswer ? "Answered" : "Not Answered"}</p>
      </div>
    </Link>
  );
};

export default Ticket;
