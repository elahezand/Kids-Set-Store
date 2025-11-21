import { FaStar } from "react-icons/fa";
import { FaRegStar } from "react-icons/fa6";
import Image from "next/image";

import styles from "./comment.module.css";
const Comment = ({ username, score, date, body }) => {
  return (
    <section className={styles.comment}>
      <Image
        width={200}
        height={200}
        src="/images/user-profile-flat-illustration-avatar-person-icon-gender-neutral-silhouette-profile-picture-free-vector.jpg"
        className={styles.avatar} alt="" />
      <div>
        <div className={styles.main_details}>
          <div className={styles.user_info}>
            <strong>{username}</strong>
            <p>{date.slice(0, 10)}</p>
          </div>
          <div className={styles.stars}>
            {new Array(score).fill(0).map((item, index) => (
              <FaStar key={index} />
            ))}
            {new Array(5 - score).fill(0).map((item, index) => (
              <FaRegStar key={index} />
            ))}
          </div>
        </div>
        <p>
          {body}
        </p>
      </div>
    </section>
  );
};

export default Comment;
