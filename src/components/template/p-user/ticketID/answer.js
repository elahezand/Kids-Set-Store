import styles from "./answer.module.css";
import Image from "next/image";
const Answer = ({ ticket }) => {
    return (
        <>
            {ticket.message.map((item, index) => (
                <section className={item.senderID?.role === "ADMIN" ? `${styles.adminticket}` :
                    `${styles.userTicket}`}
                    key={index}>
                    <div >
                        <div
                         className={styles.ticket_main}>
                            <p>{item.createdAt.slice(0, 10)} </p>
                            <div>
                                <div>
                                    <p>{item.senderID?.username ? item.senderID.username : null}</p>
                                    <span>{item.senderID?.role ? item.senderID.role : null}</span>
                                </div>
                                <Image
                                    width={200}
                                    height={200}
                                    src="/images/user-profile-flat-illustration-avatar-person-icon-gender-neutral-silhouette-profile-picture-free-vector.jpg" alt="" />
                            </div>
                        </div>
                        <div className={styles.ticket_text}>
                            <p>{item.content}</p>
                        </div>
                    </div>
                </section>
            ))}


        </>


    );
};

export default Answer;


