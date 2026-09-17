import { FaStar } from "react-icons/fa";
import { FaRegStar } from "react-icons/fa6";
import Image from "next/image";

const Comment = ({ username, score, date, body }) => {
  return (
    <section className="mt-4 flex items-center gap-4 border-b border-black/20 pb-6 sm:gap-6">
      <Image
        width={60}
        height={60}
        src="/images/user-profile-flat-illustration-avatar-person-icon-gender-neutral-silhouette-profile-picture-free-vector.jpg"
        className="h-[50px] w-[50px] shrink-0 rounded-full sm:h-[60px] sm:w-[60px]"
        alt=""
      />
      <div className="w-full">
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
          <div className="flex items-baseline justify-between gap-2">
            <strong>{username}</strong>
            <p className="ml-2 text-sage-400">{date.slice(0, 10)}</p>
          </div>
          <div className="ml-0 flex gap-1 text-coral-300 sm:ml-8">
            {new Array(score).fill(0).map((item, index) => (
              <FaStar key={index} />
            ))}
            {new Array(5 - score).fill(0).map((item, index) => (
              <FaRegStar key={index} />
            ))}
          </div>
        </div>
        <p className="mb-0.5 mt-2.5">{body}</p>
      </div>
    </section>
  );
};

export default Comment;
