import styles from "./answer.module.css";
import Image from "next/image";

const Answer = ({ ticket }) => {
  const ticketsToRender = [ticket, ...(ticket.children || [])];

  return (
    <>
      {ticketsToRender.map((item, index) => (
        <section
          className={
            item.user?.role === "ADMIN" ? styles.adminticket : styles.userTicket}
          key={index}>
          <div className={styles.ticket_main}>
            <p>{item.createdAt?.slice(0, 10)}</p>
            <div>
              <div>
                <p>{item.user?.email || "Unknown"}</p>
                <span>{item.user?.role || "USER"}</span>
              </div>
              <Image
                width={50}
                height={50}
                src="/images/user-profile-flat-illustration-avatar-person-icon-gender-neutral-silhouette-profile-picture-free-vector.jpg"
                alt="User Avatar"
              />
            </div>
          </div>
          <div className={styles.ticket_text}>
            <p>{item.content}</p>
          </div>
        </section>
      ))}
    </>
  );
};

export default Answer;


